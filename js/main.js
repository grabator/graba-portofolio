/*
 * Ulaz: jezik, gornja traka, klasična verzija i boot ekran "GRABA OS".
 * 3D soba (three.js) se učitava tek kad zatreba, pa je klasična verzija lagana.
 */
import { classicHTML } from './classic.js';
import { sound } from './sound.js';

const PF = window.PF;
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const coarse = matchMedia('(pointer: coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = { lang: html.lang === 'bs' ? 'bs' : 'en', room: null, loading: null, started: false };
const T = () => PF[state.lang];
const store = {
  get(k, s = localStorage) { try { return s.getItem(k); } catch (e) { return null; } },
  set(k, v, s = localStorage) { try { s.setItem(k, v); } catch (e) { /* privatni prozor */ } }
};

/* ---------- poruke ---------- */
let toastTimer = 0;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); }
  catch (e) {
    const a = document.createElement('textarea'); a.value = text; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = '0';
    document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (err) { /* nema kopiranja */ } a.remove();
  }
  toast(T().copied + ': ' + text);
}
document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-copy]');
  if (c) { e.preventDefault(); copy(c.dataset.copy); }
});

/* ---------- jezik ---------- */
const pick = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), T());
function applyLang() {
  html.lang = state.lang;
  document.title = T().title;
  const d = document.querySelector('meta[name="description"]'); if (d) d.setAttribute('content', T().desc);
  document.querySelectorAll('[data-t]').forEach((el) => { const v = pick(el.dataset.t); if (typeof v === 'string') el.textContent = v; });
  document.querySelectorAll('[data-t-label]').forEach((el) => { const v = pick(el.dataset.tLabel); if (typeof v === 'string') el.setAttribute('aria-label', v); });
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  const cl = $('#classic'); if (cl.dataset.rendered !== state.lang) { cl.innerHTML = classicHTML(PF, state.lang); cl.dataset.rendered = state.lang; }
  syncView(); syncSound();
  if (state.room) state.room.setLang(state.lang);
}
function setLang(l) {
  if (l !== 'en' && l !== 'bs') return;
  state.lang = l; store.set('graba-lang', l); applyLang();
}
document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

/* ---------- zvuk ---------- */
function syncSound() {
  const b = $('#snd'); const on = sound.on;
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? T().room.soundOn : T().room.soundOff);
  b.title = b.getAttribute('aria-label');
  if (state.room) state.room.setSound(on);
}
function toggleSound(v) {
  sound.set(v == null ? !sound.on : v);
  syncSound();
  toast(sound.on ? T().room.soundOn : T().room.soundOff);
}
$('#snd').addEventListener('click', () => toggleSound());
// zvuk je bio uključen pri prošloj posjeti: pali se na prvi dodir ili tipku (pravilo browsera)
if (sound.saved()) {
  const wake = () => { if (!sound.on && state.started) { sound.set(true); syncSound(); } if (sound.on) { removeEventListener('pointerup', wake); removeEventListener('keydown', wake); } };
  addEventListener('pointerup', wake); addEventListener('keydown', wake);
}

/* ---------- klasična verzija ili soba ---------- */
const isClassic = () => html.classList.contains('is-classic');
function syncView() {
  const b = $('#view'); const c = isClassic();
  b.textContent = c ? T().room.room : T().room.classic;
  b.hidden = c && html.classList.contains('no-gl');
}
function showClassic(on, save = true) {
  html.classList.toggle('is-classic', on);
  if (save) store.set('graba-view', on ? 'classic' : 'room', sessionStorage);
  syncView();
  if (on) {
    if (state.room) state.room.pause(true);
    window.scrollTo(0, 0);
    const h = $('#classic h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  } else if (state.started && state.room) {
    state.room.pause(false);
  } else {
    boot();
  }
}
$('#view').addEventListener('click', () => showClassic(!isClassic()));

function noRoom() {
  html.classList.add('no-gl');
  $('#boot').hidden = true;
  showClassic(true, false);
  toast(T().room.nogl);
}
function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

/* ---------- boot "GRABA OS" ---------- */
function progress(p) { $('#boot-fill').style.animation = 'none'; $('#boot-fill').style.transform = 'scaleX(' + Math.max(0.04, Math.min(1, p)) + ')'; }
function ensureRoom() {
  if (state.room) return Promise.resolve(state.room);
  if (!state.loading) {
    state.loading = (async () => {
      if (!webglOK()) throw new Error('webgl');
      progress(0.25);
      const mod = await import('./room.js');
      progress(0.55);
      const room = await mod.createRoom({ PF, lang: state.lang, sound, toast, progress, coarse, reduced, setLang, toggleSound, onLost: noRoom });
      state.room = room;
      return room;
    })();
  }
  return state.loading;
}
let booting = false;
async function boot() {
  if (booting) return; booting = true;
  const t0 = performance.now();
  const revisit = store.get('graba-booted', sessionStorage) === '1';
  const bootEl = $('#boot');
  bootEl.hidden = false; bootEl.classList.toggle('revisit', revisit);
  let room;
  try { room = await ensureRoom(); } catch (e) { booting = false; noRoom(); return; }
  progress(1);
  $('#boot-ok').textContent = 'OK';
  if (revisit) { setTimeout(() => start(room, false), Math.max(0, 1000 - (performance.now() - t0))); return; }
  const btn = $('#boot-start'); btn.hidden = false;
  const go = (e) => {
    if (e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift' || e.metaKey || e.ctrlKey || e.altKey)) return;
    if (e.type === 'keydown' && e.target.closest && e.target.closest('.bar')) return;
    if (e.type === 'click' && e.target.closest && e.target.closest('.bar')) return;
    removeEventListener('keydown', go); bootEl.removeEventListener('click', go);
    e.preventDefault();
    start(room, true);
  };
  addEventListener('keydown', go); bootEl.addEventListener('click', go);
  if (!coarse) btn.focus({ preventScroll: true });
}
function start(room, gesture) {
  if (state.started) return;
  state.started = true;
  store.set('graba-booted', '1', sessionStorage);
  const bootEl = $('#boot'); bootEl.classList.add('out');
  setTimeout(() => { bootEl.hidden = true; }, 700);
  html.classList.add('is-on');
  if (gesture && sound.saved()) { sound.set(true); syncSound(); }
  room.start(gesture);
  if (isClassic()) room.pause(true);
}

/* ---------- start ---------- */
applyLang();
if (!isClassic()) boot();
