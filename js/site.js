/*
 * Ponašanje glavne stranice: plutajuća traka (vrijeme u Mostaru, meni koji se otvara prema dole na mobitelu),
 * pojavljivanje dijelova dok se lista, brojevi koji se odbroje, ljubičasti sjaj koji prati miš na vrhu,
 * telefoni koji se blago naginju, dugmad koja se povuku prema kursoru i donja traka na mobitelu.
 * Sve animacije su transform/opacity, kroz requestAnimationFrame, i staju kad nisu na ekranu.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const root = document.documentElement;
let io = null, heroIO = null, navIO = null, bound = false, scrollQueued = false, clockT = 0;
let el = null;

export function initSite(node) {
  el = node;
  root.classList.remove('pf-menu'); // nova verzija (npr. drugi jezik) počinje sa zatvorenim menijem
  reveal();
  counters();
  watchHero();
  activeNav();
  menu();
  clock();
  if (fine.matches && !reduced.matches) { tilt(); glow(); magnets(); cursor(); }
  if (!bound) {
    bound = true;
    addEventListener('scroll', queueScroll, { passive: true });
    addEventListener('resize', queueScroll, { passive: true });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(true); });
  }
  onScroll();
}

/* ---------- vrijeme u Mostaru u traci ---------- */
function clock() {
  const b = el.querySelector('[data-clock]');
  clearInterval(clockT);
  if (!b) return;
  let fmt;
  try { fmt = new Intl.DateTimeFormat('bs-BA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Sarajevo' }); } catch (e) { return; }
  const set = () => { b.textContent = fmt.format(new Date()); };
  set();
  clockT = setInterval(set, 20000);
}

/* ---------- meni na mobitelu: traka se produži prema dole ---------- */
function menu() {
  const bar = el.querySelector('.pf-bar'), btn = el.querySelector('.pf-burger');
  if (!bar || !btn) return;
  btn.addEventListener('click', () => (bar.classList.contains('open') ? closeMenu() : openMenu()));
  bar.querySelectorAll('.pf-sheet a').forEach((a) => a.addEventListener('click', () => closeMenu()));
}
function openMenu() {
  const bar = el.querySelector('.pf-bar'), btn = el.querySelector('.pf-burger');
  bar.classList.add('open'); root.classList.add('pf-menu');
  btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', btn.dataset.close);
}
function closeMenu(focus) {
  if (!el) return;
  const bar = el.querySelector('.pf-bar'), btn = el.querySelector('.pf-burger');
  if (!bar || !bar.classList.contains('open')) return;
  bar.classList.remove('open'); root.classList.remove('pf-menu');
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', btn.dataset.open);
  if (focus) btn.focus();
}

/* ---------- pojavljivanje pri listanju ---------- */
function reveal() {
  const items = el.querySelectorAll('.rv');
  if (io) io.disconnect();
  if (reduced.matches || !('IntersectionObserver' in window)) { items.forEach((x) => x.classList.add('in')); return; }
  root.classList.add('pf-anim');
  io = new IntersectionObserver((en) => en.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  items.forEach((x) => io.observe(x));
}

/* ---------- brojevi se odbroje kad se pojave ---------- */
function counters() {
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const nums = [...el.querySelectorAll('.pf-stats b')].filter((b) => /\d/.test(b.textContent));
  const obs = new IntersectionObserver((en) => en.forEach((e) => {
    if (!e.isIntersecting) return;
    obs.unobserve(e.target);
    const b = e.target, m = b.textContent.match(/^(\D*)(\d[\d.,]*)(.*)$/);
    if (!m) return;
    const sep = (m[2].match(/[.,]/) || [''])[0], end = Number(m[2].replace(/[.,]/g, ''));
    if (end < 2) return;
    const fmt = (n) => (sep ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep) : String(n));
    const t0 = performance.now(), dur = 1300;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 4);
      b.textContent = m[1] + fmt(Math.round(end * k)) + m[3];
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  nums.forEach((b) => obs.observe(b));
}

/* ---------- telefoni i sjaj rade samo dok je vrh na ekranu ---------- */
function watchHero() {
  const hero = el.querySelector('.pf-hero');
  if (heroIO) heroIO.disconnect();
  if (!hero || !('IntersectionObserver' in window)) return;
  heroIO = new IntersectionObserver(([e]) => root.classList.toggle('pf-hero-off', !e.isIntersecting));
  heroIO.observe(hero);
}

/* ---------- aktivna stavka u traci ---------- */
function activeNav() {
  const links = [...el.querySelectorAll('.pf-links a')];
  if (navIO) navIO.disconnect();
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  navIO = new IntersectionObserver((en) => en.forEach((e) => {
    const a = map.get(e.target.id);
    if (a && e.isIntersecting) links.forEach((x) => x.classList.toggle('on', x === a));
  }), { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((a, id) => { const s = el.querySelector('#' + id); if (s) navIO.observe(s); });
}

/* ---------- listanje: traka dobije pozadinu, donja traka se pojavi ---------- */
function queueScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
}
function onScroll() {
  if (!el || !root.classList.contains('is-classic')) return;
  const y = scrollY;
  root.classList.toggle('pf-scrolled', y > 8);
  root.classList.toggle('pf-past', y > innerHeight * 0.7);
}

/* ---------- telefoni se blago naginju za mišem ---------- */
function tilt() {
  const stage = el.querySelector('.pf-stage'), box = el.querySelector('.pf-tilt'), hero = el.querySelector('.pf-hero');
  if (!stage || !box) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const loop = () => {
    x += (tx - x) * 0.08; y += (ty - y) * 0.08;
    box.style.transform = 'rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
    raf = (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) ? requestAnimationFrame(loop) : 0;
  };
  hero.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width));
    ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height));
    if (!raf) raf = requestAnimationFrame(loop);
  });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
}

/* ---------- ljubičasti sjaj prati miš na vrhu ---------- */
function glow() {
  const hero = el.querySelector('.pf-hero'), g = el.querySelector('.pf-glow');
  if (!hero || !g) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, on = false;
  const loop = () => {
    x += (tx - x) * 0.1; y += (ty - y) * 0.1;
    g.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    raf = (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) ? requestAnimationFrame(loop) : 0;
  };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = e.clientX - r.left; ty = e.clientY - r.top;
    if (!on) { on = true; x = tx; y = ty; hero.classList.add('pf-lit'); }
    if (!raf) raf = requestAnimationFrame(loop);
  });
  hero.addEventListener('pointerleave', () => { on = false; hero.classList.remove('pf-lit'); });
}

/* ---------- dugmad se blago povuku prema kursoru ---------- */
function magnets() {
  el.querySelectorAll('.pf-mag').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      b.style.transform = 'translate(' + (dx * 8).toFixed(1) + 'px,' + (dy * 6).toFixed(1) + 'px)';
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------- kružić "Otvori stranicu" prati kursor preko slika radova ---------- */
let curRaf = 0;
function cursor() {
  const cur = document.querySelector('.pf-cursor');
  if (!cur) return;
  let tx = 0, ty = 0, x = 0, y = 0;
  const loop = () => {
    x += (tx - x) * 0.2; y += (ty - y) * 0.2;
    cur.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    curRaf = cur.classList.contains('on') || Math.abs(tx - x) > 0.5 ? requestAnimationFrame(loop) : 0;
  };
  el.querySelectorAll('[data-cursor]').forEach((a) => {
    a.addEventListener('pointerenter', (e) => {
      cur.textContent = a.dataset.cursor;
      tx = x = e.clientX; ty = y = e.clientY;
      cur.classList.add('on');
      if (!curRaf) curRaf = requestAnimationFrame(loop);
    });
    a.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
    a.addEventListener('pointerleave', () => cur.classList.remove('on'));
  });
}
