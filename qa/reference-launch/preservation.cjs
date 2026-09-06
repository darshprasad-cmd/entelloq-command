/* Content and destination regression contract for the launch-page redesign.
 * Run: node qa/reference-launch/preservation.cjs [path/to/index.html]
 * Capture is intentionally pinned to the reviewed pre-redesign commit.
 * This checks preservation, not visual quality or browser interaction. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const baselineCommit = '2ca3670';
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const normalize = value => value.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
  .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const sections = ['products', 'tutorials', 'newsroom', 'platform', 'proof', 'leadership', 'company'];
const contractIds = ['prod-drop', 'drop-panel', 'theme-btn', 'theme-ic', 'tabbar', 'panels',
  'res-grid', 'proof-grid', 'foot-products', 'switcher', 'sw-grid', 'veil', 'pal-input',
  'pal-list', 'pal-count', 'lift', 'lift-icon', 'lift-name', 'lift-url', 'ag-fab',
  'ag-panel', 'ag-close', 'ag-log', 'ag-chips', 'ag-form', 'ag-input', 'eqx-fab',
  'eqx-panel', 'eqx-close', 'eqx-list'];
function sectionHTML(html, id) {
  const match = html.match(new RegExp('<section\\b[^>]*\\bid=["\\\']' + id + '["\\\'][^>]*>([\\s\\S]*?)<\\/section>', 'i'));
  assert.ok(match, 'Missing page section #' + id);
  return match[1];
}
function evaluateData(html) {
  const start = html.indexOf('const PRODUCTS =');
  const end = html.indexOf('const $ ', start);
  assert.ok(start >= 0 && end > start, 'Product/config block must remain available');
  const data = vm.runInNewContext(html.slice(start, end) + '\n({PRODUCTS,TOPICS,ACTIONS,RESOURCES,PROOF})', {}, {timeout:1000});
  const assistantStart = html.indexOf('const PROD_BLURB =');
  const assistantEnd = html.indexOf('const AG_OPENING =', assistantStart);
  const assistant = vm.runInNewContext('const P=id=>PRODUCTS.find(p=>p.id===id);\n' +
    html.slice(assistantStart, assistantEnd) + '\nAG_INTENTS.map(i=>({id:i.id,keywords:i.k,response:i.r()}))',
    {PRODUCTS:data.PRODUCTS}, {timeout:1000});
  return JSON.parse(JSON.stringify({...data, assistant}));
}
function contentOnly(value) {
  if (Array.isArray(value)) return value.map(contentOnly);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !['accent', 'c', 'icon'].includes(key))
    .map(([key, item]) => [key, /Token$/.test(key) ? {sha256:digest(item)} : contentOnly(item)]));
  return value;
}
function capture(html) {
  const data = contentOnly(evaluateData(html));
  const sectionCopy = Object.fromEntries(sections.map(id => [id,
    [...sectionHTML(html, id).matchAll(/<(p|h3|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map(match => normalize(match[2])).filter(Boolean)]));
  const landmarkText = [...html.matchAll(/<(footer)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map(match => normalize(match[2]));
  const destinations = [...new Set([...html.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)]
    .map(match => match[2]).filter(value => !value.startsWith('data:') && !value.includes('${') &&
      !value.includes('fonts.google') && !value.includes("' +")))].sort();
  const portrait = html.match(/<img\b[^>]*class="face"[^>]*src="([^"]+)"/i);
  const companyBanner = sectionHTML(html, 'company').match(/<img\b[^>]*src="([^"]+)"/i);
  return {baselineCommit, sourceSha256:digest(html), sectionCopy, landmarkText,
    destinations, contractIds, founderPortraitSha256:digest(portrait[1]),
    companyBannerSha256:digest(companyBanner[1]), data};
}
if (process.argv.includes('--capture-baseline')) {
  assert.ok(!fs.existsSync(path.join(__dirname, 'baseline.contract.json')), 'Baseline already exists; do not silently regenerate it');
  const html = cp.execFileSync('git', ['show', baselineCommit + ':index.html'], {cwd:root,maxBuffer:2e6}).toString('utf8');
  fs.writeFileSync(path.join(__dirname, 'baseline.html'), html);
  fs.writeFileSync(path.join(__dirname, 'baseline.contract.json'), JSON.stringify(capture(html),null,2) + '\n');
  console.log('Captured immutable baseline from ' + baselineCommit);
} else {
  const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'baseline.contract.json'), 'utf8'));
  const target = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'index.html');
  const html = fs.readFileSync(target, 'utf8');
  const current = capture(html);
  const failures = [];
  function check(fn) { try {fn();} catch(error) {failures.push(error.message);} }
  for (const id of sections) for (const copy of baseline.sectionCopy[id]) {
    check(() => assert.ok(normalize(sectionHTML(html,id)).includes(copy), '#' + id + ' lost copy: ' + copy));
  }
  // Check footer atoms so adding a useful link or rearranging columns is allowed.
  const beforeHTML = fs.readFileSync(path.join(__dirname, 'baseline.html'), 'utf8');
  const beforeFooter = beforeHTML.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)[1];
  const afterFooter = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)?.[1] || '';
  for (const copy of beforeFooter.split(/<[^>]*>/).map(normalize).filter(Boolean)) {
    check(() => assert.ok(normalize(afterFooter).includes(copy), 'Footer content was lost: ' + copy));
  }
  for (const url of baseline.destinations) check(() => assert.ok(current.destinations.includes(url), 'Destination was lost: ' + url));
  for (const id of contractIds) check(() => assert.equal([...html.matchAll(new RegExp('\\bid=["\\\']' + id + '["\\\']','g'))].length, 1, 'Control #' + id + ' must remain unique'));
  for (const key of ['PRODUCTS', 'TOPICS', 'ACTIONS', 'RESOURCES', 'PROOF']) {
    check(() => assert.deepEqual(current.data[key], baseline.data[key], key + ' lost or changed informational data'));
  }
  for (const intent of baseline.data.assistant) {
    const now = current.data.assistant.find(item => item.id === intent.id);
    check(() => assert.ok(now, 'Assistant lost intent: ' + intent.id));
    if (!now) continue;
    check(() => assert.deepEqual(now.keywords, intent.keywords, 'Assistant lost query coverage: ' + intent.id));
    check(() => assert.deepEqual(now.response.acts, intent.response.acts, 'Assistant lost response destinations: ' + intent.id));
  }
  check(() => assert.equal(current.founderPortraitSha256, baseline.founderPortraitSha256, 'Founder portrait changed'));
  check(() => assert.equal(current.companyBannerSha256, baseline.companyBannerSha256, 'Company name banner changed'));
  for (const token of ['data-open-switcher','data-open-palette',"localStorage.setItem('eq_theme'", "e.key === '/'", "e.key.toLowerCase() === 'k'", 'prefers-reduced-motion: reduce']) {
    check(() => assert.ok(html.includes(token), 'Missing interaction/motion hook: ' + token));
  }
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=|type=["'](?:module|application\/|importmap)/i.test(match[1]) || !match[2].trim()) continue;
    check(() => new Function(match[2]));
  }
  if (failures.length) { console.error(failures.join('\n\n')); process.exitCode=1; }
  else console.log('Preserved: 7 sections, all previous direct links, 3 complete product records/media, 16 topic routes, 4 company/press actions, 6 newsroom items, 6 metrics, 17 assistant intents/destinations, founder portrait, company banner and interaction hooks.');
}
