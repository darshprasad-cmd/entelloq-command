/* Real product footage: load near the viewport and make motion optional. */
(() => {
  const hero = document.querySelector('.hero-dissection-video');
  const toggle = document.querySelector('.hero-video-toggle');
  if (!hero || !toggle) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clips = [...document.querySelectorAll('.dissection-grid video,.sandbox-grid video')];
  let visible = false;
  let manuallyPaused = false;
  let manuallyStarted = false;
  let failed = false;

  function load(video) {
    if (video.dataset.loaded) return;
    video.dataset.loaded = 'true';
    if (video.dataset.src) video.src = video.dataset.src;
    video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
    video.load();
  }
  function updateButton() {
    const playing = !hero.paused && !hero.ended;
    toggle.textContent = failed ? 'Preview unavailable' : playing ? 'Pause' : 'Play';
    toggle.setAttribute('aria-label', failed ? 'Dissection preview unavailable' : `${playing ? 'Pause' : 'Play'} dissection preview`);
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.disabled = failed;
  }
  function sync() {
    const automatic = !reduced.matches && !document.body.classList.contains('motion-paused') && !navigator.connection?.saveData;
    if (!failed && visible && !document.hidden && !manuallyPaused && (automatic || manuallyStarted)) {
      load(hero);
      hero.play().catch(() => { updateButton(); });
    } else {
      hero.pause();
    }
    updateButton();
  }
  toggle.addEventListener('click', () => {
    if (hero.paused) {
      manuallyPaused = false;
      manuallyStarted = true;
    } else {
      manuallyPaused = true;
      manuallyStarted = false;
    }
    sync();
  });
  hero.addEventListener('play', updateButton);
  hero.addEventListener('pause', updateButton);
  hero.addEventListener('error', () => { failed = true; hero.pause(); updateButton(); });

  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .25;
      sync();
    }, {threshold: [0, .25]});
    heroObserver.observe(hero);
    const clipObserver = new IntersectionObserver(entries => {
      entries.forEach(({target, isIntersecting}) => {
        if (isIntersecting) load(target);
        else target.pause();
      });
    }, {threshold: .1});
    clips.forEach(clip => clipObserver.observe(clip));
  } else {
    // Native controls remain usable in browsers without viewport observation.
    visible = true;
    clips.forEach(load);
    sync();
  }
  clips.forEach(clip => {
    clip.addEventListener('play', () => {
      clips.filter(other => other !== clip).forEach(other => other.pause());
      hero.pause();
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clips.forEach(clip => clip.pause());
    sync();
  });
  new MutationObserver(() => {
    if (document.body.classList.contains('motion-paused')) {
      manuallyStarted = false;
      clips.forEach(clip => clip.pause());
    }
    sync();
  }).observe(document.body, {attributes: true, attributeFilter: ['class']});
  reduced.addEventListener('change', () => { manuallyStarted = false; sync(); });
  updateButton();
})();
