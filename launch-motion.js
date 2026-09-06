/* Passive scroll: no scroll hijacking; movement is optional. */
(() => {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const body = document.body;
  const hero = document.querySelector('.launch-scene');
  const earth = document.querySelector('.earth-image');
  const cards = [...document.querySelectorAll('.world-image')];
  const nav = document.querySelector('.nav');
  const progress = document.querySelector('.reading-progress');
  const toggle = document.querySelector('#motion-toggle');
  let paused = false;
  try { paused = localStorage.getItem('eq_motion') === 'paused'; } catch (_) {}
  let frame = 0;
  let observer;
  const targets = [...document.querySelectorAll('.section .sec-head,.discovery-notes>a,.tutorial-card,.tl-item')];
  const enabled = () => !media.matches && !paused;
  function paint() {
    frame = 0;
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    if (!enabled()) return;
    const limit = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, y / limit)})`;
    if (y < hero.offsetHeight + 50) {
      earth.style.transform = `translate3d(0,${Math.min(y * .15, 135)}px,0) scale(1.015)`;
      cards.forEach((card, i) => { card.style.transform = `translate3d(0,${Math.min(y * (.016 + i * .007), 18)}px,0) scale(1.025)`; });
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
  function configure() {
    observer?.disconnect();
    body.classList.toggle('motion-ready', enabled());
    body.classList.toggle('motion-paused', !enabled());
    toggle.textContent = media.matches ? 'Reduced motion is on' : paused ? 'Resume motion' : 'Pause motion';
    toggle.setAttribute('aria-pressed', String(paused || media.matches));
    toggle.disabled = media.matches;
    targets.forEach(el => el.classList.remove('scroll-pending'));
    if (enabled() && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(({target, isIntersecting}) => {
          if (!isIntersecting) return;
          target.classList.remove('scroll-pending');
          target.classList.add('scroll-entered');
          observer.unobserve(target);
        });
      }, {threshold: .08, rootMargin: '0px 0px -35px 0px'});
      targets.forEach(el => {
        if (el.getBoundingClientRect().top > innerHeight && !el.classList.contains('scroll-entered')) {
          el.classList.add('scroll-pending'); observer.observe(el);
        }
      });
    }
    if (!enabled()) { earth.style.transform = ''; cards.forEach(card => card.style.transform = ''); }
    schedule();
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('eq_motion', paused ? 'paused' : 'on'); } catch (_) {}
    configure();
  });
  // Keyboard navigation exposes each section immediately.
  document.addEventListener('keydown', e => {
    if (['Tab','Enter','ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)) {
      targets.forEach(el => { el.classList.remove('scroll-pending'); el.classList.add('scroll-entered'); });
    }
  });
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  media.addEventListener('change', configure);
  configure();
})();
