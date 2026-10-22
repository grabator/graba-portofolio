/*
 * Ponašanje obične verzije: dijelovi se blago pojave dok se lista, zaglavlje dobije pozadinu poslije vrha,
 * a donja traka (Viber, WhatsApp, Email) se na mobitelu pojavi kad se pređe prvi ekran.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let io = null, ticking = false;

export function initSite(el) {
  const items = el.querySelectorAll('.g-sec, .g-card, .g-res li, .g-serv li, .g-proc li, .g-why-l li');
  // filter radova: sve, stranice za biznise, aplikacije
  const filt = el.querySelector('.g-filt');
  if (filt) filt.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-f]');
    if (!b) return;
    const f = b.dataset.f;
    filt.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    el.querySelectorAll('.g-grid .g-card').forEach((c) => { c.hidden = f !== 'all' && c.dataset.cat !== f; if (!c.hidden) c.classList.add('in'); });
    el.querySelector('.g-grid').classList.toggle('is-filtered', f !== 'all');
  });
  if (io) io.disconnect();
  if (reduced.matches || !('IntersectionObserver' in window)) items.forEach((x) => x.classList.add('in'));
  else {
    io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach((x) => { x.classList.add('rv'); io.observe(x); });
  }
  onScroll();
}

function onScroll() {
  ticking = false;
  const y = window.scrollY, h = document.documentElement;
  h.classList.toggle('g-scrolled', y > 24);
  h.classList.toggle('g-past', y > window.innerHeight * 0.55);
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
