/*
 * Ponašanje obične verzije: četiri dijela kao kartice (bez dugog listanja),
 * projekti jedan po jedan (sličice, strelice, tipke ← →, na mobitelu prevlačenje), sat u Mostaru.
 */
import { TABS } from './classic.js';
import { mostarWeather } from './mostar.js';

const state = { tab: 'work', p: 0 };
const narrow = matchMedia('(max-width: 899px)');
let root = null, timeTimer = 0;

export function initSite(el) {
  root = el;
  const h = (location.hash || '').slice(1);
  if (TABS.includes(h)) state.tab = h;
  setTab(state.tab, false, true);
  setProject(state.p, true);
  const projs = root.querySelector('[data-projs]');
  // mobitel: projekti se prevlače vodoravno, brojač prati koji je na sredini
  let raf = 0;
  projs.addEventListener('scroll', () => {
    if (!narrow.matches) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const w = projs.firstElementChild.getBoundingClientRect().width + 14;
      const i = Math.max(0, Math.min(projs.children.length - 1, Math.round(projs.scrollLeft / w)));
      if (i !== state.p) setProject(i, true, true);
    });
  }, { passive: true });
  clock();
  clearInterval(timeTimer); timeTimer = setInterval(clock, 30000);
}

export function setTab(id, focus = true, instant = false) {
  if (!root || !TABS.includes(id)) return;
  state.tab = id;
  root.querySelectorAll('[data-panel]').forEach((p) => p.classList.toggle('on', p.dataset.panel === id));
  root.querySelectorAll('[data-tab]').forEach((a) => { if (a.dataset.tab === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  if (!instant) {
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* nije bitno */ }
    if (narrow.matches) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (focus) { const hd = root.querySelector('#' + id + ' h2'); if (hd) { hd.setAttribute('tabindex', '-1'); hd.focus({ preventScroll: true }); } }
}

export function setProject(i, quiet = false, fromScroll = false) {
  if (!root) return;
  const arts = root.querySelectorAll('.s-proj'), n = arts.length;
  i = ((i % n) + n) % n; state.p = i;
  arts.forEach((a, k) => a.classList.toggle('on', k === i));
  root.querySelectorAll('[data-p]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.p === i)));
  const c = root.querySelector('[data-cur]'); if (c) c.textContent = String(i + 1).padStart(2, '0');
  root.querySelectorAll('.s-dots i').forEach((d, k) => d.classList.toggle('on', k === i));
  if (narrow.matches && !fromScroll && !quiet) {
    const projs = root.querySelector('[data-projs]');
    projs.scrollTo({ left: arts[i].offsetLeft - projs.offsetLeft - 18, behavior: 'smooth' });
  }
  // sljedeća slika se učita unaprijed
  const nx = arts[(i + 1) % n].querySelector('img'); if (nx && nx.loading === 'lazy') nx.loading = 'eager';
}

function clock() {
  const el = root && root.querySelector('[data-time]'); if (!el) return;
  const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Sarajevo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
  el.textContent = 'Mostar ' + t + (temp != null ? ' · ' + temp + '°C' : '');
}
// temperatura u Mostaru (Open-Meteo, keš 15 minuta)
let temp = null;
mostarWeather().then((w) => { if (w.temp != null) { temp = w.temp; clock(); } });

// klikovi i tipke (jedan slušač za cijelu stranicu, radi i poslije promjene jezika)
document.addEventListener('click', (e) => {
  if (!root || !root.contains(e.target)) return;
  const tab = e.target.closest('[data-tab]');
  if (tab) { e.preventDefault(); setTab(tab.dataset.tab); return; }
  const th = e.target.closest('[data-p]');
  if (th) { setProject(+th.dataset.p); return; }
  const st = e.target.closest('[data-step]');
  if (st) setProject(state.p + +st.dataset.step);
});
document.addEventListener('keydown', (e) => {
  if (!root || !document.documentElement.classList.contains('is-classic') || state.tab !== 'work') return;
  if (e.target.closest && e.target.closest('input, textarea')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); setProject(state.p + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); setProject(state.p - 1); }
});
// iskra (samo miš): svjetlo prati kursor, slika projekta se lagano nagne
const fine = matchMedia('(hover: hover) and (pointer: fine)'), calm = matchMedia('(prefers-reduced-motion: reduce)');
let sparkRaf = 0, sparkE = null;
document.addEventListener('pointermove', (e) => {
  if (!root || !fine.matches || e.pointerType !== 'mouse') return;
  sparkE = e;
  if (sparkRaf) return;
  sparkRaf = requestAnimationFrame(() => {
    sparkRaf = 0; const ev = sparkE;
    const st = root.querySelector('.s-stage'); if (!st) return;
    const r = st.getBoundingClientRect();
    st.style.setProperty('--mx', (ev.clientX - r.left) + 'px'); st.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    const shot = ev.target.closest && ev.target.closest('.s-proj.on .s-shot');
    root.querySelectorAll('.s-shot.tilt').forEach((s) => { if (s !== shot) { s.classList.remove('tilt'); s.style.removeProperty('--rx'); s.style.removeProperty('--ry'); } });
    if (!shot) return;
    const b = shot.getBoundingClientRect(), x = (ev.clientX - b.left) / b.width, y = (ev.clientY - b.top) / b.height;
    shot.classList.add('tilt');
    shot.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); shot.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    if (!calm.matches) { shot.style.setProperty('--rx', ((0.5 - y) * 5).toFixed(2) + 'deg'); shot.style.setProperty('--ry', ((x - 0.5) * 7).toFixed(2) + 'deg'); }
  });
}, { passive: true });
addEventListener('hashchange',() => { const h = location.hash.slice(1); if (TABS.includes(h)) setTab(h, false); });
