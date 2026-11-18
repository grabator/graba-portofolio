/*
 * Ponašanje glavne stranice: dijelovi se blago pojave dok se lista, brojevi odbroje, zaglavlje dobije pozadinu
 * i traku napretka, telefoni na vrhu se blago naginju za mišem, dugmad se "lijepe" za kursor,
 * a donja traka (WhatsApp, Viber, Email) se na mobitelu pojavi kad se pređe prvi ekran.
 * Sve animacije su transform/opacity, crtaju se kroz requestAnimationFrame i staju kad nisu na ekranu.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const root = document.documentElement;
let io = null, heroIO = null, navIO = null, bound = false, scrollQueued = false;
let el = null;

export function initSite(node) {
  el = node;
  reveal();
  counters();
  watchHero();
  activeNav();
  if (fine.matches && !reduced.matches) { tilt(); magnets(); cursor(); }
  if (!bound) {
    bound = true;
    addEventListener('scroll', queueScroll, { passive: true });
    addEventListener('resize', queueScroll, { passive: true });
  }
  onScroll();
}

/* ---------- pojavljivanje pri listanju ---------- */
function reveal() {
  const items = el.querySelectorAll('.rv');
  if (io) io.disconnect();
  if (reduced.matches || !('IntersectionObserver' in window)) { items.forEach((x) => x.classList.add('in')); return; }
  root.classList.add('pf-anim');
  io = new IntersectionObserver((en) => en.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  items.forEach((x) => io.observe(x));
}

/* ---------- brojevi u karticama se odbroje kad se pojave ---------- */
function counters() {
  const nums = [...el.querySelectorAll('.pf-stats b')].filter((b) => /\d/.test(b.textContent));
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver((en) => en.forEach((e) => {
    if (!e.isIntersecting) return;
    obs.unobserve(e.target);
    const b = e.target, txt = b.dataset.v || b.textContent;
    b.dataset.v = txt;
    const m = txt.match(/^(\D*)(\d[\d.,]*)(.*)$/);
    if (!m) return;
    const sep = (m[2].match(/[.,]/) || [''])[0];
    const end = Number(m[2].replace(/[.,]/g, ''));
    if (end < 2) return;
    const fmt = (n) => (sep ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep) : String(n));
    const t0 = performance.now(), dur = 1400;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 4);
      b.textContent = m[1] + fmt(Math.round(end * k)) + m[3];
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  nums.forEach((b) => obs.observe(b));
}

/* ---------- telefoni na vrhu: animacija radi samo dok je vrh na ekranu ---------- */
function watchHero() {
  const hero = el.querySelector('.pf-hero');
  if (heroIO) heroIO.disconnect();
  if (!hero || !('IntersectionObserver' in window)) return;
  heroIO = new IntersectionObserver(([e]) => root.classList.toggle('pf-hero-off', !e.isIntersecting));
  heroIO.observe(hero);
}

/* ---------- aktivna stavka u meniju ---------- */
function activeNav() {
  const links = [...el.querySelectorAll('.pf-links a')];
  if (navIO) navIO.disconnect();
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  navIO = new IntersectionObserver((en) => en.forEach((e) => {
    const a = map.get(e.target.id);
    if (a && e.isIntersecting) { links.forEach((x) => x.classList.toggle('on', x === a)); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((a, id) => { const s = el.querySelector('#' + id); if (s) navIO.observe(s); });
}

/* ---------- listanje: zaglavlje, traka napretka, donja traka ---------- */
function queueScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
}
function onScroll() {
  if (!el || !root.classList.contains('is-classic')) return;
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  root.classList.toggle('pf-scrolled', y > 8);
  root.classList.toggle('pf-past', y > innerHeight * 0.7);
  const bar = el.querySelector('.pf-prog');
  if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
}

/* ---------- telefoni se blago naginju za mišem (samo desktop) ---------- */
function tilt() {
  const stage = el.querySelector('.pf-stage'), box = el.querySelector('.pf-tilt');
  if (!stage || !box) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const loop = () => {
    x += (tx - x) * 0.08; y += (ty - y) * 0.08;
    box.style.transform = 'rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
    raf = (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) ? requestAnimationFrame(loop) : 0;
  };
  const hero = el.querySelector('.pf-hero');
  hero.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width)));
    ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height)));
    if (!raf) raf = requestAnimationFrame(loop);
  });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
}

/* ---------- dugmad koja se blago povuku prema kursoru ---------- */
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

/* ---------- kružić "Otvori stranicu" koji prati kursor preko slika radova ---------- */
let curEl = null, curRaf = 0;
function cursor() {
  curEl = document.querySelector('.pf-cursor');
  if (!curEl) return;
  let tx = 0, ty = 0, x = 0, y = 0;
  const loop = () => {
    x += (tx - x) * 0.2; y += (ty - y) * 0.2;
    curEl.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    curRaf = curEl.classList.contains('on') || Math.abs(tx - x) > 0.5 ? requestAnimationFrame(loop) : 0;
  };
  el.querySelectorAll('[data-cursor]').forEach((a) => {
    a.addEventListener('pointerenter', (e) => {
      curEl.textContent = a.dataset.cursor;
      tx = x = e.clientX; ty = y = e.clientY;
      curEl.classList.add('on');
      if (!curRaf) curRaf = requestAnimationFrame(loop);
    });
    a.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
    a.addEventListener('pointerleave', () => curEl.classList.remove('on'));
  });
}
