/* Simulated Chromium lab observations; these are not field Core Web Vitals. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base = process.env.ENTELLOQ_QA_URL || 'http://127.0.0.1:8766/';
const reportPath = path.join(__dirname, 'performance-results.json');
const report = {
  generatedAt: new Date().toISOString(), base,
  conditions: {
    kind: 'Headless Chromium, local synthetic lab; not field Core Web Vitals or physical mobile hardware',
    execution: 'One browser and one page, desktop then mobile viewport; fresh navigation with browser cache disabled',
    network: 'No network throttling; same-origin resource timing transfer sizes include navigation',
    scroll: 'Native scroll position driven by requestAnimationFrame over 2000 ms; instant frame positions avoid CSS smooth-scroll retargeting',
    timingAssertions: 'None: timing values are observations, not pass/fail thresholds'
  }, scenarios: [], checks: []
};
const metricNames = ['TaskDuration', 'ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'LayoutCount', 'RecalcStyleCount'];
let browser;
const check = (name, pass, details) => report.checks.push({ name, pass: Boolean(pass), ...(details === undefined ? {} : { details }) });
async function metrics(cdp) {
  const { metrics: list } = await cdp.send('Performance.getMetrics');
  const values = Object.fromEntries(list.map(({ name, value }) => [name, value]));
  return Object.fromEntries(metricNames.map(name => [name, values[name] ?? null]));
}
function delta(before, after) {
  return Object.fromEntries(metricNames.map(name => [name, before[name] === null || after[name] === null ? null : after[name] - before[name]]));
}
async function snapshot(page) {
  return page.evaluate(() => {
    const data = window.__launchPerf;
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource').filter(e => new URL(e.name).origin === location.origin);
    const canvas = document.querySelector('#aperture-light');
    const rect = canvas?.getBoundingClientRect();
    return {
      sampledAtMs: performance.now(), lcpMs: data.lcpMs, cls: data.cls,
      longTasks: { count: data.longTasks.length, totalDurationMs: data.longTasks.reduce((sum, task) => sum + task.duration, 0), entries: data.longTasks },
      supportedEntryTypes: data.supported,
      localTransferBytes: (navigation?.transferSize || 0) + resources.reduce((sum, entry) => sum + entry.transferSize, 0),
      localEncodedBodyBytes: (navigation?.encodedBodySize || 0) + resources.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
      localResourceCount: resources.length,
      videos: [...document.querySelectorAll('video')].map(video => ({ currentSrc: video.currentSrc, loaded: video.dataset.loaded === 'true', readyState: video.readyState })),
      canvas: canvas ? { width: canvas.width, height: canvas.height, backingPixels: canvas.width * canvas.height, cssWidth: canvas.style.width, cssHeight: canvas.style.height, displayed: getComputedStyle(canvas).display, transformedWidth: rect.width, transformedHeight: rect.height, dpr: canvas.dataset.dpr, frame: canvas.dataset.frame ?? null } : null,
      viewport: { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth },
      motion: { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, saveData: Boolean(navigator.connection?.saveData), paused: document.body.classList.contains('motion-paused'), artworkTransform: document.querySelector('.aperture-art')?.style.transform || '' },
      navigationDurationMs: navigation?.duration ?? null
    };
  });
}
(async () => {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  let runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.addInitScript(() => {
    try { localStorage.removeItem('eq_motion'); } catch {}
    const supported = PerformanceObserver.supportedEntryTypes || [];
    const data = window.__launchPerf = { lcpMs: null, cls: 0, longTasks: [], supported };
    let shiftSession = { value: 0, start: 0, last: 0 };
    for (const type of ['largest-contentful-paint', 'layout-shift', 'longtask']) {
      if (!supported.includes(type)) continue;
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (type === 'largest-contentful-paint') data.lcpMs = entry.startTime;
          if (type === 'layout-shift' && !entry.hadRecentInput) {
            if (!shiftSession.value || entry.startTime - shiftSession.last > 1000 || entry.startTime - shiftSession.start > 5000) shiftSession = { value: 0, start: entry.startTime, last: entry.startTime };
            shiftSession.value += entry.value;
            shiftSession.last = entry.startTime;
            data.cls = Math.max(data.cls, shiftSession.value);
          }
          if (type === 'longtask') data.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
        }
      }).observe({ type, buffered: true });
    }
  });
  for (const scenario of [
    { name: 'desktop', viewport: { width: 1440, height: 1000 }, cpuRate: 1 },
    { name: 'mobile-viewport-cpu4x', viewport: { width: 390, height: 844 }, cpuRate: 4 }
  ]) {
    runtimeErrors = [];
    const started = Date.now();
    await page.setViewportSize(scenario.viewport);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: scenario.cpuRate });
    await page.goto(base, { waitUntil: 'load', timeout: 60000 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(800);
    const initial = await snapshot(page);
    const record = { ...scenario, initial };
    report.scenarios.push(record);
    check(scenario.name + ': footage remains unloaded initially', initial.videos.every(video => !video.currentSrc && !video.loaded), initial.videos);
    const idleBefore = await metrics(cdp);
    const idleStart = await page.evaluate(() => performance.now());
    await page.waitForTimeout(3000);
    const idleAfter = await metrics(cdp);
    const idleEnd = await page.evaluate(() => performance.now());
    record.heroIdle = { requestedDurationMs: 3000, actualDurationMs: idleEnd - idleStart, cdpDelta: delta(idleBefore, idleAfter), canvas: (await snapshot(page)).canvas };
    const scrollBefore = await metrics(cdp);
    record.scroll = await page.evaluate(async () => {
      const stage = document.querySelector('.aperture-scroll-stage');
      const startY = scrollY, endY = stage.getBoundingClientRect().top + scrollY + stage.offsetHeight + 300;
      const frames = [], start = performance.now();
      let previous = null;
      await new Promise(resolve => {
        function tick(now) {
          if (previous !== null) frames.push(now - previous);
          previous = now;
          const progress = Math.min((now - start) / 2000, 1);
          const eased = progress < .5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          scrollTo({ top: startY + (endY - startY) * eased, behavior: 'instant' });
          if (progress < 1) requestAnimationFrame(tick); else resolve();
        }
        requestAnimationFrame(tick);
      });
      const end = performance.now(), sorted = [...frames].sort((a, b) => a - b);
      const tasks = window.__launchPerf.longTasks.filter(task => task.startTime >= start && task.startTime <= end);
      return { startY, endY, startMs: start, endMs: end, requestedDurationMs: 2000, actualDurationMs: end - start, frameCount: frames.length, frameTimesMs: frames, p95FrameTimeMs: sorted.length ? sorted[Math.ceil(sorted.length * .95) - 1] : null, maxFrameTimeMs: sorted.length ? sorted[sorted.length - 1] : null, longTasks: { count: tasks.length, totalDurationMs: tasks.reduce((sum, task) => sum + task.duration, 0), entries: tasks } };
    });
    record.scroll.cdpDelta = delta(scrollBefore, await metrics(cdp));
    await page.evaluate(() => { const target = document.querySelector('#faq') || document.querySelector('footer'); scrollTo({ top: target.getBoundingClientRect().top + scrollY, behavior: 'instant' }); });
    await page.waitForTimeout(200);
    const offscreenStart = await snapshot(page), offscreenBefore = await metrics(cdp);
    await page.waitForTimeout(2000);
    const offscreenAfter = await metrics(cdp), offscreenEnd = await snapshot(page);
    record.offscreenIdle = { requestedDurationMs: 2000, actualDurationMs: offscreenEnd.sampledAtMs - offscreenStart.sampledAtMs, cdpDelta: delta(offscreenBefore, offscreenAfter), frameBefore: offscreenStart.canvas?.frame, frameAfter: offscreenEnd.canvas?.frame, frameUnchanged: offscreenStart.canvas?.frame === offscreenEnd.canvas?.frame, artworkTransformUnchanged: offscreenStart.motion.artworkTransform === offscreenEnd.motion.artworkTransform };
    record.final = offscreenEnd;
    record.totalWallDurationMs = Date.now() - started;
    record.runtimeErrors = [...runtimeErrors];
    check(scenario.name + ': decorative frame remains unchanged offscreen', record.offscreenIdle.frameUnchanged, record.offscreenIdle);
    check(scenario.name + ': artwork remains unchanged offscreen', record.offscreenIdle.artworkTransformUnchanged);
    check(scenario.name + ': zero runtime errors', runtimeErrors.length === 0, runtimeErrors);
    console.log(JSON.stringify({ scenario: scenario.name, initialLcpMs: initial.lcpMs, initialCls: initial.cls, initialTransferBytes: initial.localTransferBytes, canvasPixels: initial.canvas?.backingPixels, scrollP95Ms: record.scroll.p95FrameTimeMs, offscreenFrameUnchanged: record.offscreenIdle.frameUnchanged, runtimeErrors }));
  }
  await context.close();
})().catch(error => { report.fatal = error.stack || error.message; check('Profiler completed', false, report.fatal); }).finally(async () => {
  await browser?.close();
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  const failed = report.checks.filter(item => !item.pass);
  console.log(`${report.checks.length - failed.length}/${report.checks.length} functional assertions passed; report: ${reportPath}`);
  if (failed.length) process.exitCode = 1;
});
