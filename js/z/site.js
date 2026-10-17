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
    gaze: 'pogled → kursor', secs: ['početak', 'ko sam', 'radovi', 'svi projekti', 'u brojkama', 'usluge', 'o meni', 'kontakt'],
    nums: ['Projekata', 'Uživo na internetu', 'Alata i tehnologija', 'Jezika'], servSide: 'Od ideje do objave.', allH: 'Sve na *jednom* mjestu.', allBtn: 'Pogledaj sve', allP: 'Svaki projekat na jednom ekranu. Klikni na sliku za stranicu uživo.', proc: 'Proces', tools: 'Alati',
    live: 'Uživo', code: 'Kod', copy: 'Kopiraj email', copied: 'Kopirano ✓', ch: ['Telefon', 'Viber', 'WhatsApp', 'GitHub'], logo: 'graba, na vrh stranice', skip: 'Preskoči na sadržaj'
  },
  en: {
    nav: ['Work', 'Services', 'About', 'Contact'], cta: 'Get in touch', menu: 'Menu', h1: ['I see', 'further.'], h2: ['I build', 'better.'], wm: 'I see further',
    heroP: 'Ahmed Grabus, software engineer from Bosnia and Herzegovina. I build fast, beautiful websites and full-stack products, from the database to the last animation.',
    gaze: 'gaze → cursor', secs: ['start', 'who I am', 'work', 'all projects', 'in numbers', 'services', 'about', 'contact'],
    nums: ['Projects', 'Live on the web', 'Tools and technologies', 'Languages'], servSide: 'From idea to launch.', allH: 'Everything in *one* place.', allBtn: 'See all', allP: 'Every project on one screen. Click a picture to open the live site.', proc: 'Process', tools: 'Tools',
    live: 'Live', code: 'Source', copy: 'Copy email', copied: 'Copied ✓', ch: ['Phone', 'Viber', 'WhatsApp', 'GitHub'], logo: 'graba, back to top', skip: 'Skip to content'
  }
};
const IDS = ['pocetak', 'ko-sam', 'radovi', 'projekti', 'brojke', 'usluge', 'o-meni', 'kontakt'];
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
// logo: slovo G kao žirafa (vrat sa mrljama ide u krug, glava je na početku slova)
function giraffeIcon() {
  return '<svg class="z-ico" xmlns="http://www.w3.org/2000/svg" viewBox="6 -2 92 96" aria-hidden="true"><defs><mask id="zgm"><path d="M61.3 34.1 A27 27 0 1 0 73.9 58.9" fill="none" stroke="#fff" stroke-width="10.6" stroke-linecap="round" stroke-linejoin="round"/></mask></defs> <path d="M53.2 21.8L53.6 19.5M46.4 21.3L46.3 17.5M39.6 22.1L39.1 19.7M33.1 24.1L31.6 20.6M27 27.4L25.7 25.4M21.8 31.8L19.1 29.1M17.4 37L15.4 35.7" stroke="rgba(255,255,255,.55)" stroke-width="2.4" stroke-linecap="round"/> <path d="M61.3 34.1 A27 27 0 1 0 73.9 58.9 L56 58.9" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><g mask="url(#zgm)"><path d="M51.4 45.8 L53.6 32.9 L78.6 25.9 L78.6 27.8 L61.8 41.2 L52 45.8 L51.4 45.9 L51.4 45.8ZM78.7 12.1 L78.7 21.8 L52.5 29.1 L50.3 26.9 L48.9 12.1 L78.7 12.1ZM47.1 45 L46.2 42.8 L44.5 32.6 L47.3 30.1 L49.4 32.2 L47.1 45ZM43.5 13.8 L44.8 27.4 L42.1 29.8 L39.5 28.5 L35.4 13.8 L43.5 13.8ZM42.4 44.3 L35.5 34.7 L37.6 31.7 L40.5 33.2 L42.4 44.3ZM30.3 12.8 L35 29.8 L32.9 32.9 L29.7 32.7 L14 12.8 L30.3 12.8ZM39.6 48.1 L29.1 40.1 L29.7 36.9 L32.5 37 L38.8 45.7 L39.7 48 L39.7 48.1 L39.6 48.1ZM10.2 16.7 L10.5 16.7 L25.7 35.9 L25 39.3 L22 40.7 L10.2 34.3 L10.2 16.7ZM24.2 47.7 L23.5 44.3 L26.7 42.9 L38.5 51.9 L38.2 52.1 L37.2 52 L24.2 47.7ZM7.1 38.2 L19.6 45.1 L20.3 48.5 L17.6 51.2 L7.1 50.2 L7.1 38.2ZM22.3 56.6 L20.5 54 L23.1 51.5 L35.2 55.5 L22.3 56.6ZM7.4 55.5 L17 56.4 L18.8 59 L17.7 62.3 L7.4 64.7 L7.4 55.5ZM22.5 60.1 L36 59.1 L37.1 59.2 L36.9 59.6 L36.9 59.6 L23.9 65.3 L21.4 63.6 L22.5 60.1ZM7.8 69.7 L18.9 67.1 L21.5 68.9 L21.4 72.3 L7.8 84.7 L7.8 69.7ZM25.6 69.1 L38.3 63.5 L37.9 64.3 L29 73.3 L25.5 72.3 L25.6 69.1ZM11.8 90.3 L11.8 87.5 L24.6 75.8 L28 76.7 L28.6 79.7 L21.5 90.3 L11.8 90.3ZM31.6 75.9 L41 66.5 L40.4 69.5 L35.8 78.9 L32.2 79.1 L31.6 75.9ZM24.6 93.7 L32.3 82.2 L36 82 L38 85.4 L35.6 93.7 L24.6 93.7ZM39.1 80.4 L43.3 71.7 L43.9 81.6 L40.8 83.5 L39.1 80.4ZM40.2 94.9 L42.7 86.8 L46.1 84.7 L49.1 86.4 L50.2 94.9 L40.2 94.9ZM48.4 68.3 L48.4 68.3 L53 80.6 L50.8 82.8 L48.1 81.3 L47.6 71.7 L48.1 69 L48.4 68.3ZM54.8 93.5 L53.8 85.9 L56.1 83.7 L58.8 84.1 L64 93.5 L54.8 93.5ZM51.7 64.7 L51.8 64.7 L52.5 64.6 L55.4 67.3 L61.3 76.9 L59.6 80 L56.6 79.5 L51.3 65.4 L51.5 65 L51.7 64.7ZM85.5 91.9 L68.6 91.9 L62.9 81.7 L64.5 78.7 L68.2 78.5 L85.5 91.7 L85.5 91.9ZM64.4 74.8 L59.2 66.3 L67.5 70.8 L67.8 74.6 L64.4 74.8ZM86.8 85.8 L71.5 74.2 L71.2 70.5 L74.1 69.2 L86.8 74.2 L86.8 85.8ZM58.6 60.2 L68.6 55.4 L72.5 65.6 L69.5 67 L61.1 62.5 L58.6 60.2ZM90.5 70.3 L75.9 64.5 L71.5 53.3 L90.5 38.2 L90.5 70.3Z" fill="#000"/></g> <path d="M60 23 C54 17 46 15 41 17 C45 22 52 26 59 28 Z" fill="#fff"/><path d="M63 19L60 6" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/><circle cx="60" cy="6" r="4.6" fill="#fff"/><path d="M71 17L73 4" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/><circle cx="73" cy="4" r="4.6" fill="#fff"/><path d="M53 33 C54 22 62 15 71 16 C80 17 89 26 93 35 C95 40 92 45 86 45 C78 45 69 44 60 42 C55 41 52 38 53 33 Z" fill="#fff"/><circle cx="74" cy="27" r="3.4" fill="#000"/><circle cx="74.8" cy="27" r="1.7" fill="#7dffb0"/> <path d="M86 36.5 q2 -1.5 3.5 0" stroke="#000" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M79 42.5 q5 1 10 -1" stroke="#000" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';
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
  const all = PF.work.map((w, i) => {
    const [name, kind] = T.items[w.id], href = w.live || w.src;
    return '<li class="z-up" style="--d:' + ((i % 3) * 0.08 + Math.floor(i / 3) * 0.06).toFixed(2) + 's">'
      + (href ? '<a class="z-tile" href="' + href + '" ' + ext + '>' : '<div class="z-tile">')
      + '<span class="z-tn">' + pad(i + 1) + '</span><figure class="z-shot">' + cover(w, name) + '</figure>'
      + '<span class="z-tm"><b>' + esc(name) + '</b><small>' + esc(kind) + ' · ' + w.year + '</small></span><i aria-hidden="true">' + (href ? '↗' : '') + '</i>'
      + (href ? '</a>' : '</div>') + '</li>';
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
    + '<p class="z-metarow" aria-hidden="true"><span><b data-zsec>01</b> / 08 · <span data-zsecn>' + esc(t.secs[0]) + '</span></span><span data-ztime>Mostar</span></p>'
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
    + '<section class="z-work" id="radovi" aria-labelledby="z-work-h"><header class="z-sh"><p class="z-k">03 · ' + esc(t.secs[2]) + '</p><h2 id="z-work-h" data-sin2>' + em(T.workH) + '</h2><p><a class="z-btn" href="#projekti" data-zgo="projekti"><span data-scr="' + esc(t.allBtn) + '">' + esc(t.allBtn) + '</span>&nbsp;↓</a></p></header>'
    + '<div class="z-neck"><div class="z-neckhost"><canvas class="z-neckcv" aria-hidden="true"></canvas></div><ol class="z-cards">' + works + '</ol></div></section>'
    // 4. brojke
    + '<section class="z-all" id="projekti" aria-labelledby="z-all-h"><header class="z-sh"><p class="z-k">04 · ' + esc(t.secs[3]) + '</p><h2 id="z-all-h" class="z-up">' + em(t.allH) + '</h2><p class="z-cp z-up" style="--d:.1s">' + esc(t.allP) + '</p></header><ol class="z-agrid">' + all + '</ol></section>'

    + '<section class="z-nums" id="brojke" aria-labelledby="z-nums-k"><div class="z-dots"></div><p class="z-k z-up" id="z-nums-k">05 · ' + esc(t.secs[4]) + '</p><div class="z-ngrid">' + nums + '</div></section>'
    // 5. usluge
    + '<section class="z-serv" id="usluge" aria-labelledby="z-serv-h"><canvas class="z-ghost" aria-hidden="true"></canvas><div class="z-stop"><div><p class="z-k">06 · ' + esc(t.secs[5]) + '</p><h2 id="z-serv-h" class="z-up">' + em(T.servH) + '</h2></div><p class="z-side z-up" style="--d:.2s">' + esc(t.servSide) + '</p></div>'
    + '<ul class="z-sgrid">' + serv + '</ul><div class="z-proc"><p class="z-k">' + esc(t.proc) + '</p><ol>' + proc + '</ol></div></section>'
    // 6. o meni
    + '<section class="z-about" id="o-meni" aria-labelledby="z-about-h"><div><p class="z-k">07 · ' + esc(t.secs[6]) + '</p><h2 id="z-about-h" class="z-up">' + em(T.aboutH) + '</h2><dl class="z-facts z-up" style="--d:.15s">' + facts + '</dl></div>'
    + '<div><p class="z-k">' + esc(t.tools) + '</p><ul class="z-chips z-up" style="--d:.25s">' + stack + '</ul></div></section>'
    // 7. kontakt
    + '<section class="z-contact" id="kontakt" aria-labelledby="z-contact-h"><div class="z-dots"></div><div class="z-chead"><canvas class="z-ccv" aria-hidden="true"></canvas></div>'
    + '<div class="z-cbody"><p class="z-k">08 · ' + esc(t.secs[7]) + '</p><h2 id="z-contact-h" class="z-up">' + em(T.contactH) + '</h2><p class="z-cp z-up" style="--d:.1s">' + esc(T.contactP) + '</p>'
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
    const loop = () => { cx += (tx - cx) * 0.5; cy += (ty - cy) * 0.5; cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)'; gaze.style.transform = 'translate(' + (cx + 22).toFixed(1) + 'px,' + (cy - 10).toFixed(1) + 'px)'; craf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(loop) : 0; };
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
