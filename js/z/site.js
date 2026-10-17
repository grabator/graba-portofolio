/*
 * Desktop: stranica sa IT žirafom. Sadržaj dolazi iz PF (js/i18n.js), ovdje su samo kratki natpisi.
 * Efekti: slova koja se "dešifruju", meni koji se razvuče, tekst nagnut u 3D, brojke koje se odbroje,
 * žirafa koja prati miš i vrat koji raste kroz radove. Sve se pomjera samo kroz transform i opacity.
 */
import { createCodeGiraffe } from './giraffe.js';
import { createNeckStrip } from './neck.js';
import { mostarWeather } from '../mostar.js';

const Z = {
  bs: {
    nav: ['Radovi', 'Usluge', 'O meni', 'Kontakt'], cta: 'Javi se', menu: 'Meni', h1: ['Vidim', 'dalje.'], h2: ['Pravim', 'bolje.'], wm: 'Vidim dalje',
    heroP: 'Ahmed Grabus, softverski inženjer iz BiH. Pravim brze i lijepe web stranice i full-stack proizvode, od baze do zadnje animacije.',
    gaze: 'pogled → kursor', secs: ['početak', 'ko sam', 'radovi', 'u brojkama', 'usluge', 'o meni', 'kontakt'],
    nums: ['Projekata', 'Uživo na internetu', 'Alata i tehnologija', 'Jezika'], servSide: 'Od ideje do objave.', proc: 'Proces', tools: 'Alati',
    live: 'Uživo', code: 'Kod', copy: 'Kopiraj email', copied: 'Kopirano ✓', ch: ['Telefon', 'Viber', 'WhatsApp', 'GitHub'], logo: 'graba, na vrh stranice', skip: 'Preskoči na sadržaj'
  },
  en: {
    nav: ['Work', 'Services', 'About', 'Contact'], cta: 'Get in touch', menu: 'Menu', h1: ['I see', 'further.'], h2: ['I build', 'better.'], wm: 'I see further',
    heroP: 'Ahmed Grabus, software engineer from Bosnia and Herzegovina. I build fast, beautiful websites and full-stack products, from the database to the last animation.',
    gaze: 'gaze → cursor', secs: ['start', 'who I am', 'work', 'in numbers', 'services', 'about', 'contact'],
    nums: ['Projects', 'Live on the web', 'Tools and technologies', 'Languages'], servSide: 'From idea to launch.', proc: 'Process', tools: 'Tools',
    live: 'Live', code: 'Source', copy: 'Copy email', copied: 'Copied ✓', ch: ['Phone', 'Viber', 'WhatsApp', 'GitHub'], logo: 'graba, back to top', skip: 'Skip to content'
  }
};
const IDS = ['pocetak', 'ko-sam', 'radovi', 'brojke', 'usluge', 'o-meni', 'kontakt'];
const NAV_IDS = ['radovi', 'usluge', 'o-meni', 'kontakt'];
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}[]<>/=+*;:$#&';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const em = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
const rch = () => CHARS[(Math.random() * CHARS.length) | 0];
const pad = (n) => String(n).padStart(2, '0');
const ext = 'target="_blank" rel="noopener"';

/* ---------- slova koja se "dešifruju" ---------- */
function scrambleIn(el, text, delay = 0) {
  if (reduced) { el.textContent = text; return; }
  el.innerHTML = '&nbsp;';
  clearInterval(el._sc); clearTimeout(el._st);
  el._st = setTimeout(() => {
    let pos = 0;
    el._sc = setInterval(() => {
      pos += 0.5;
      let out = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') out += ' ';
        else if (i < pos) out += text[i];
        else if (i < pos + 3) out += rch();
      }
      el.textContent = out || ' ';
      if (pos >= text.length) { clearInterval(el._sc); el.textContent = text; }
    }, 25);
  }, delay);
}
function scrambleHover(el) {
  const text = el.dataset.scr || el.textContent;
  el.dataset.scr = text;
  if (reduced) return;
  clearInterval(el._hv);
  let f = 0;
  el._hv = setInterval(() => {
    f++;
    const done = Math.floor(f / 4);
    let out = '';
    for (let i = 0; i < text.length; i++) out += text[i] === ' ' ? ' ' : (i < done ? text[i] : rch());
    el.textContent = out;
    if (done >= text.length) { clearInterval(el._hv); el.textContent = text; }
  }, 25);
}
function scrambleReset(el) { clearInterval(el._hv); if (el.dataset.scr) el.textContent = el.dataset.scr; }

/* ---------- HTML ---------- */
function giraffeIcon() {
  return '<svg class="z-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M9 3v4M14 3v4"/><circle cx="9" cy="2.6" r="1.2" fill="currentColor"/><circle cx="14" cy="2.6" r="1.2" fill="currentColor"/><path d="M6 13c0-3.5 2.4-6 6-6s5 2 5 4l-1 3c3 2 4 5 4 9H9c0-4-3-6-3-10Z"/><circle cx="10.5" cy="11" r=".9" fill="currentColor"/></svg>';
}
function cover(w, name) {
  if (w.img) return '<img src="' + w.img + '" alt="' + esc(name) + '" width="1200" height="675" loading="lazy" decoding="async">';
  const bg = w.art === 'pitch'
    ? '<svg viewBox="0 0 160 90" aria-hidden="true"><rect x="8" y="8" width="144" height="74" fill="none" stroke="rgba(255,255,255,.18)"/><line x1="80" y1="8" x2="80" y2="82" stroke="rgba(255,255,255,.18)"/><circle cx="80" cy="45" r="12" fill="none" stroke="rgba(255,255,255,.18)"/><rect x="8" y="27" width="18" height="36" fill="none" stroke="rgba(255,255,255,.18)"/><rect x="134" y="27" width="18" height="36" fill="none" stroke="rgba(255,255,255,.18)"/></svg>'
    : '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><pattern id="zg" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="rgba(255,255,255,.12)"/></pattern></defs><rect width="160" height="90" fill="url(#zg)"/><circle cx="98" cy="38" r="3.5" fill="#7dffb0"/><circle cx="98" cy="38" r="9" fill="none" stroke="rgba(125,255,176,.4)"/></svg>';
  return '<div class="z-cover">' + bg + '<span>' + esc(name) + '</span></div>';
}
function html(PF, lang) {
  const T = PF[lang], t = Z[lang], C = PF.contact;
  const nav = NAV_IDS.map((id, i) => '<a href="#' + id + '" data-zgo="' + id + '"><span data-scr="' + esc(t.nav[i]) + '">' + esc(t.nav[i]) + '</span></a>').join('');
  const works = PF.work.map((w, i) => {
    const [name, kind, desc] = T.items[w.id];
    return '<li class="z-card z-' + (i % 2 ? 'r' : 'l') + '" style="--i:' + i + '"><i class="z-node"><b>' + pad(i + 1) + '</b></i><article>'
      + '<figure class="z-shot">' + cover(w, name) + '</figure>'
      + '<p class="z-meta">' + esc(kind) + ' · ' + w.year + '</p><h3>' + esc(name) + '</h3><p class="z-desc">' + esc(desc) + '</p>'
      + '<ul class="z-tags">' + w.tags.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>'
      + '<p class="z-cl">' + (w.live ? '<a class="z-btn z-solid" href="' + w.live + '" ' + ext + '>' + esc(t.live) + ' ↗</a>' : '') + (w.src ? '<a class="z-btn" href="' + w.src + '" ' + ext + '>' + esc(t.code) + ' ↗</a>' : '') + '</p>'
      + '</article></li>';
  }).join('');
  const nums = [[PF.work.length, t.nums[0]], [PF.work.filter((w) => w.live).length, t.nums[1]], [PF.stack.length, t.nums[2]], [2, t.nums[3]]]
    .map(([n, l], i) => '<div class="z-up" style="--d:' + (i * 0.15) + 's"><b data-count="' + n + '">0</b><span>' + esc(l) + '</span></div>').join('');
  const serv = T.services.map(([h, p], i) => '<li class="z-up" style="--d:' + (i * 0.1) + 's"><span class="z-n">' + pad(i + 1) + '</span><h3>' + esc(h) + '</h3><p>' + esc(p) + '</p></li>').join('');
  const proc = T.process.map(([h, p], i) => '<li class="z-up" style="--d:' + (0.3 + i * 0.1) + 's"><i></i><b>' + esc(h) + '</b><p>' + esc(p) + '</p></li>').join('');
  const facts = T.facts.map(([k, v]) => '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>').join('');
  const stack = PF.stack.map((x) => '<li data-scr="' + esc(x) + '">' + esc(x) + '</li>').join('');
  const chans = [[t.ch[0], 'tel:' + C.tel, C.phone, false], [t.ch[1], C.viber, C.phone, false], [t.ch[2], C.whatsapp, C.phone, true], [t.ch[3], C.github, 'grabator', true]]
    .map(([l, h, v, x]) => '<li><a href="' + h + '"' + (x ? ' ' + ext : '') + '><span>' + esc(l) + '</span><b>' + esc(v) + '</b><i aria-hidden="true">↗</i></a></li>').join('');
  const manifest = T.aboutP.join(' ');
  return ''
    + '<a class="z-skip" href="#ko-sam">' + esc(t.skip) + '</a>'
    + '<header class="z-nav"><div class="z-pills">'
    + '<a class="z-pill z-logo" href="#pocetak" data-zgo="pocetak" aria-label="' + esc(t.logo) + '">' + giraffeIcon() + '<span>graba</span></a>'
    + '<div class="z-pill z-menu"><button type="button" class="z-hb" aria-expanded="false" aria-controls="z-links" aria-label="' + esc(t.menu) + '"><i></i><i></i><i></i></button><nav id="z-links" class="z-links" aria-label="' + esc(t.menu) + '">' + nav + '</nav></div>'
    + '</div><div class="z-right"><div class="z-lang" role="group" aria-label="Jezik / Language"><button type="button" data-lang="bs" aria-pressed="' + (lang === 'bs') + '">BS</button><button type="button" data-lang="en" aria-pressed="' + (lang === 'en') + '">EN</button></div>'
    + '<a class="z-cta" href="#kontakt" data-zgo="kontakt"><i aria-hidden="true"></i><span data-scr="' + esc(t.cta) + '">' + esc(t.cta) + '</span></a></div></header>'
    + '<p class="z-metarow" aria-hidden="true"><span><b data-zsec>01</b> / 07 · <span data-zsecn>' + esc(t.secs[0]) + '</span></span><span data-ztime>Mostar</span></p>'
    + '<main id="z-main">'
    // 1. početak
    + '<section class="z-hero" id="pocetak" aria-labelledby="z-h1"><div class="z-dots"></div><p class="z-wm" aria-hidden="true">' + esc(t.wm) + '</p>'
    + '<canvas class="z-gcv" aria-hidden="true"></canvas>'
    + '<div class="z-hb-row"><div class="z-hl"><h1 id="z-h1" class="z-big" aria-label="' + esc(t.h1.join(' ')) + '"><span data-sin="' + esc(t.h1[0]) + '" data-sd="200" aria-hidden="true"></span><br><span data-sin="' + esc(t.h1[1]) + '" data-sd="500" aria-hidden="true"></span></h1>'
    + '<p class="z-lead">' + esc(t.heroP) + '</p></div>'
    + '<p class="z-big z-hr"><span class="z-vh">' + esc(t.h2.join(' ')) + '</span><span data-sin="' + esc(t.h2[0]) + '" data-sd="700" aria-hidden="true"></span><br><span data-sin="' + esc(t.h2[1]) + '" data-sd="1000" aria-hidden="true"></span></p></div>'
    + '<span class="z-gaze" aria-hidden="true">' + esc(t.gaze) + '</span></section>'
    // 2. ko sam
    + '<section class="z-man" id="ko-sam" aria-labelledby="z-man-k"><p class="z-k" id="z-man-k">02 · ' + esc(t.secs[1]) + '</p><div class="z-persp"><p class="z-mtext">' + esc(manifest) + '</p></div></section>'
    // 3. radovi
    + '<section class="z-work" id="radovi" aria-labelledby="z-work-h"><header class="z-sh"><p class="z-k">03 · ' + esc(t.secs[2]) + '</p><h2 id="z-work-h" data-sin2>' + em(T.workH) + '</h2></header>'
    + '<div class="z-neck"><div class="z-neckhost"><canvas class="z-neckcv" aria-hidden="true"></canvas></div><ol class="z-cards">' + works + '</ol></div></section>'
    // 4. brojke
    + '<section class="z-nums" id="brojke" aria-labelledby="z-nums-k"><div class="z-dots"></div><p class="z-k z-up" id="z-nums-k">04 · ' + esc(t.secs[3]) + '</p><div class="z-ngrid">' + nums + '</div></section>'
    // 5. usluge
    + '<section class="z-serv" id="usluge" aria-labelledby="z-serv-h"><canvas class="z-ghost" aria-hidden="true"></canvas><div class="z-stop"><div><p class="z-k">05 · ' + esc(t.secs[4]) + '</p><h2 id="z-serv-h" class="z-up">' + em(T.servH) + '</h2></div><p class="z-side z-up" style="--d:.2s">' + esc(t.servSide) + '</p></div>'
    + '<ul class="z-sgrid">' + serv + '</ul><div class="z-proc"><p class="z-k">' + esc(t.proc) + '</p><ol>' + proc + '</ol></div></section>'
    // 6. o meni
    + '<section class="z-about" id="o-meni" aria-labelledby="z-about-h"><div><p class="z-k">06 · ' + esc(t.secs[5]) + '</p><h2 id="z-about-h" class="z-up">' + em(T.aboutH) + '</h2><dl class="z-facts z-up" style="--d:.15s">' + facts + '</dl></div>'
    + '<div><p class="z-k">' + esc(t.tools) + '</p><ul class="z-chips z-up" style="--d:.25s">' + stack + '</ul></div></section>'
    // 7. kontakt
    + '<section class="z-contact" id="kontakt" aria-labelledby="z-contact-h"><div class="z-dots"></div><div class="z-chead"><canvas class="z-ccv" aria-hidden="true"></canvas></div>'
    + '<div class="z-cbody"><p class="z-k">07 · ' + esc(t.secs[6]) + '</p><h2 id="z-contact-h" class="z-up">' + em(T.contactH) + '</h2><p class="z-cp z-up" style="--d:.1s">' + esc(T.contactP) + '</p>'
    + '<button type="button" class="z-mail z-up" style="--d:.2s" data-zcopy="' + esc(C.email) + '"><span>' + esc(C.email) + '</span><small data-zcopied>' + esc(t.copy) + '</small></button>'
    + '<ul class="z-chans z-up" style="--d:.3s">' + chans + '</ul>'
    + '<p class="z-foot">© 2026 Graba · ' + esc(T.foot) + '</p></div></section>'
    + '</main><div class="z-cur" aria-hidden="true"></div>';
}

/* ---------- ponašanje ---------- */
let state = null, gazeShown = false;
export function initZ({ PF, getLang }) {
  const host = document.createElement('div'); host.id = 'z'; host.className = 'z';
  document.body.appendChild(host);
  render(PF, getLang());
  document.addEventListener('graba:lang', () => render(PF, getLang()));
}

function render(PF, lang) {
  if (state) { state.cleanup.forEach((f) => f()); }
  const host = document.getElementById('z');
  host.innerHTML = html(PF, lang);
  const cleanup = [];
  state = { cleanup };
  const $ = (s) => host.querySelector(s), $$ = (s) => host.querySelectorAll(s);
  const t = Z[lang];

  // ulaz: sve se pojavi nakon 800 ms, naslovi se dešifruju
  host.classList.remove('z-in');
  const tIn = setTimeout(() => {
    host.classList.add('z-in');
    $$('[data-sin]').forEach((el) => scrambleIn(el, el.dataset.sin, +el.dataset.sd));
  }, reduced ? 0 : 800);
  cleanup.push(() => clearTimeout(tIn));

  // žirafa na početku
  const hero = $('.z-hero');
  const big = createCodeGiraffe($('.z-gcv'), {
    sight: true,
    place: (w, h) => { const s = 0.93 * (h / 900); return { s, ox: w * 0.5 - 655 * s, oy: -20 * (h / 900) }; }
  });
  big.start(); cleanup.push(() => big.stop());

  // blijeda glava iza usluga (crta se jednom)
  const ghost = createCodeGiraffe($('.z-ghost'), { still: true, follow: false, words: false, glow: false, alpha: 0.07, density: 1.15,
    place: (w, h) => { const s = 1.25 * (h / 900); return { s, ox: w - 560 * s, oy: h * 0.18 - 160 * s }; } });
  ghost.start(); cleanup.push(() => ghost.stop());

  // glava u kontaktu: izviri odozdo lijevo i gleda prema dugmadima
  const contactG = createCodeGiraffe($('.z-ccv'), { flip: true, words: false, intro: false, baseTurn: 0.12,
    place: (w, h) => { const s = 0.62 * (h / 900) * 1.35; return { s, ox: w * 0.55 - 560 * s, oy: h - 820 * s }; } });
  let cStarted = false;
  const cio = new IntersectionObserver(([e]) => { if (e.isIntersecting && !cStarted) { cStarted = true; contactG.start(); } }, { threshold: 0.15 });
  cio.observe($('.z-contact')); cleanup.push(() => { cio.disconnect(); if (cStarted) contactG.stop(); });

  // vrat kroz radove: kartice se pojave kad ih vrat dostigne
  const cards = [...$$('.z-card')];
  const nh = $('.z-neckhost');
  const neck = createNeckStrip(nh, $('.z-neckcv'), (y) => {
    const top = nh.getBoundingClientRect().top;
    for (const c of cards) if (!c.classList.contains('on') && c.getBoundingClientRect().top - top + c.offsetHeight * 0.35 <= y) c.classList.add('on');
  });
  neck.start(); cleanup.push(() => neck.stop());

  // meni koji se razvuče
  const menu = $('.z-menu'), hb = $('.z-hb');
  const setMenu = (on) => { menu.classList.toggle('open', on); hb.setAttribute('aria-expanded', String(on)); $$('.z-links a').forEach((a) => (a.tabIndex = on ? 0 : -1)); };
  setMenu(false);
  hb.addEventListener('click', () => setMenu(!menu.classList.contains('open')));

  // skrol na dijelove
  host.addEventListener('click', (e) => {
    const a = e.target.closest('[data-zgo]');
    if (a) { e.preventDefault(); if (a.closest('.z-links')) setMenu(false); const el = document.getElementById(a.dataset.zgo); if (el) { el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); try { history.replaceState(null, '', '#' + a.dataset.zgo); } catch (er) { /* nije bitno */ } } }
    const m = e.target.closest('[data-zcopy]');
    if (m) {
      const v = m.dataset.zcopy, lab = m.querySelector('[data-zcopied]');
      (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).catch(() => { const ta = document.createElement('textarea'); ta.value = v; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (er) { /* bez kopiranja */ } ta.remove(); });
      scrambleIn(lab, t.copied, 0); clearTimeout(m._t); m._t = setTimeout(() => scrambleIn(lab, t.copy, 0), 2000);
    }
  });

  // slova se miješaju na hover
  const over = (e) => { const el = e.target.closest && e.target.closest('[data-scr]'); if (el && host.contains(el) && !el.contains(e.relatedTarget)) scrambleHover(el); };
  const out = (e) => { const el = e.target.closest && e.target.closest('[data-scr]'); if (el && !el.contains(e.relatedTarget)) scrambleReset(el); };
  host.addEventListener('mouseover', over); host.addEventListener('mouseout', out);

  // pojavljivanje pri skrolu, naslovi koji se dešifruju, brojke koje se odbroje
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target; io.unobserve(el); el.classList.add('in');
    if (el.matches('[data-sin2]')) { const ems = el.innerHTML; const txt = el.textContent; if (!reduced) { const sp = document.createElement('span'); el.textContent = ''; el.appendChild(sp); scrambleIn(sp, txt, 0); setTimeout(() => { el.innerHTML = ems; }, txt.length * 50 + 200); } }
    el.querySelectorAll('[data-count]').forEach((b) => {
      const n = +b.dataset.count; if (reduced) { b.textContent = n; return; }
      const t0 = performance.now(), d = 1200 + (+getComputedStyle(b.parentElement).getPropertyValue('--d').replace('s', '') || 0) * 1000;
      const step = (now) => { const k = Math.min(1, (now - t0) / d); b.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }), { threshold: 0.3 });
  $$('.z-up, [data-sin2], .z-ngrid > div, .z-contact').forEach((el) => io.observe(el));
  cleanup.push(() => io.disconnect());

  // brojač dijela gore lijevo
  const secIo = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    const i = IDS.indexOf(en.target.id); if (i < 0) return;
    $('[data-zsec]').textContent = pad(i + 1); $('[data-zsecn]').textContent = t.secs[i];
  }), { rootMargin: '-45% 0px -45% 0px' });
  IDS.forEach((id) => { const el = document.getElementById(id); if (el) secIo.observe(el); });
  cleanup.push(() => secIo.disconnect());

  // tekst "ko sam" nagnut u 3D, ispravlja se dok se skrola
  const man = $('.z-man'), mt = $('.z-mtext');
  let my = 60, mraf = 0;
  const manLoop = () => {
    mraf = requestAnimationFrame(manLoop);
    const r = man.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
    const target = 60 - 180 * p; my += (target - my) * 0.05;
    const op = reduced ? 1 : Math.min(1, Math.max(0, (p - 0.3) / 0.2));
    mt.style.transform = reduced ? 'none' : 'rotateX(24deg) translateY(' + my.toFixed(1) + 'px) translateZ(15px)';
    mt.style.opacity = op.toFixed(3);
  };
  const mio = new IntersectionObserver(([e]) => { if (e.isIntersecting && !mraf) mraf = requestAnimationFrame(manLoop); else if (!e.isIntersecting && mraf) { cancelAnimationFrame(mraf); mraf = 0; } });
  mio.observe(man); cleanup.push(() => { mio.disconnect(); cancelAnimationFrame(mraf); });

  // vlastiti kursor (samo miš)
  const cur = $('.z-cur'), gaze = $('.z-gaze');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy, craf = 0;
    const move = (e) => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); const inHero = !!(e.target.closest && e.target.closest('.z-hero')); gaze.classList.toggle('out', !inHero); if (!gazeShown && inHero) { gazeShown = true; gaze.classList.add('on'); gT = setTimeout(() => gaze.classList.add('gone'), 5000); } cur.classList.toggle('big', !!(e.target.closest && e.target.closest('a, button'))); if (!craf) craf = requestAnimationFrame(loop); };
    const loop = () => { cx += (tx - cx) * 0.25; cy += (ty - cy) * 0.25; cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)'; gaze.style.transform = 'translate(' + (cx + 22).toFixed(1) + 'px,' + (cy - 10).toFixed(1) + 'px)'; craf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(loop) : 0; };
    addEventListener('pointermove', move, { passive: true });
    const leave = () => cur.classList.remove('on');
    document.addEventListener('mouseleave', leave);
    let gT = 0;
    cleanup.push(() => { removeEventListener('pointermove', move); document.removeEventListener('mouseleave', leave); clearTimeout(gT); });
  }

  // sat i temperatura u Mostaru
  const timeEl = $('[data-ztime]');
  let temp = null;
  const clock = () => { const hm = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Sarajevo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); timeEl.textContent = 'Mostar · ' + hm + (temp != null ? ' · ' + temp + '°C' : ''); };
  clock(); const ci = setInterval(clock, 30000); cleanup.push(() => clearInterval(ci));
  mostarWeather().then((w) => { if (w && w.temp != null) { temp = w.temp; clock(); } });

  // hash pri ulazu (#radovi itd.)
  const h = location.hash.slice(1);
  if (IDS.includes(h)) requestAnimationFrame(() => document.getElementById(h).scrollIntoView());
  void hero;
}
