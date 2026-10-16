/*
 * Obična verzija: četiri dijela (Radovi, Usluge, O meni, Kontakt) koji staju na jedan ekran.
 * Projekti se gledaju jedan po jedan (velika slika + sličice), bez dugog listanja.
 * Ista funkcija pravi HTML u browseru (promjena jezika) i u tools/staticno.mjs (statični HTML za Google).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const em = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
const ext = 'target="_blank" rel="noopener"';
const pad = (n) => String(n).padStart(2, '0');

export function creditHTML(PF, lang) {
  const c = PF.credit;
  return esc(PF[lang].credit) + ' <a href="' + c.url + '" ' + ext + '>' + esc(c.name) + ' · ' + esc(c.site) + '</a>';
}

export const TABS = ['work', 'services', 'about', 'contact'];

export function classicHTML(PF, lang) {
  const T = PF[lang], C = PF.contact, S = T.site;
  const n = PF.work.length;

  const nav = TABS.map((id, i) => '<a href="#' + id + '" data-tab="' + id + '"' + (i === 0 ? ' aria-current="true"' : '') + '>'
    + '<span class="s-n">' + pad(i + 1) + '</span><b>' + esc(S.tabs[id]) + '</b>'
    + (id === 'work' ? '<em>' + n + '</em>' : '') + '<i class="s-ic s-ic-' + id + '" aria-hidden="true"></i></a>').join('');

  const projects = PF.work.map((w, i) => {
    const [name, kind, desc] = T.items[w.id];
    const media = w.img
      ? '<img src="' + w.img + '" alt="' + esc(name) + '" width="1200" height="675"' + (i < 2 ? '' : ' loading="lazy"') + ' decoding="async">'
      : '<div class="s-art s-art-' + w.art + '" aria-hidden="true"><span>' + esc(name) + '</span></div>';
    const links = (w.live ? '<a class="s-btn s-main" href="' + w.live + '" ' + ext + '>' + esc(T.live) + ' <span aria-hidden="true">↗</span></a>' : '')
      + (w.src ? '<a class="s-btn" href="' + w.src + '" ' + ext + '>' + esc(T.code) + ' <span aria-hidden="true">↗</span></a>' : '');
    return '<article class="s-proj' + (i === 0 ? ' on' : '') + '" data-i="' + i + '" aria-labelledby="p-' + w.id + '">'
      + '<figure class="s-shot">' + media + (w.live ? '<span class="s-live">' + esc(T.liveTag) + '</span>' : '') + '</figure>'
      + '<div class="s-info"><p class="s-meta"><span>' + esc(kind) + '</span><span>' + w.year + '</span></p>'
      + '<h3 id="p-' + w.id + '">' + esc(name) + '</h3><p class="s-desc">' + esc(desc) + '</p>'
      + '<ul class="s-tags">' + w.tags.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul>'
      + '<p class="s-links">' + links + '</p></div></article>';
  }).join('');

  const thumbs = PF.work.map((w, i) => '<li><button type="button" data-p="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="' + esc(T.items[w.id][0]) + '">'
    + (w.img ? '<img src="' + w.img + '" alt="" width="160" height="90" loading="lazy" decoding="async">' : '<span class="s-art s-art-' + w.art + '"></span>')
    + '</button></li>').join('');

  const services = T.services.map(([h, p], i) => '<li><span class="s-n">' + pad(i + 1) + '</span><h3>' + esc(h) + '</h3><p>' + esc(p) + '</p></li>').join('');
  const process = T.process.map(([h, p], i) => '<li><b><span>' + (i + 1) + '</span> ' + esc(h) + '</b><p>' + esc(p) + '</p></li>').join('');
  const facts = T.facts.map(([k, v]) => '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>').join('');
  const stack = PF.stack.map((s) => '<li>' + esc(s) + '</li>').join('');
  const channels = [
    ['phone', 'tel:' + C.tel, C.phone, false],
    ['viber', C.viber, C.phone, false],
    ['whatsapp', C.whatsapp, C.phone, true],
    ['github', C.github, 'grabator', true]
  ].map(([k, href, v, ex]) => '<li><a href="' + href + '"' + (ex ? ' ' + ext : '') + '><span>' + esc(T[k]) + '</span><b>' + esc(v) + '</b><i aria-hidden="true">↗</i></a></li>').join('');

  return ''
    + '<aside class="s-rail">'
    + '<p class="s-avail"><i aria-hidden="true"></i>' + esc(S.avail) + '</p>'
    + '<h1 class="s-name">Ahmed<br>Grabus</h1>'
    + '<p class="s-role">' + esc(T.role) + ' · ' + esc(S.place) + '</p>'
    + '<p class="s-intro">' + esc(T.hero) + '</p>'
    + '<button type="button" class="s-room" data-room><span class="s-room-img" aria-hidden="true"></span><span><b>' + esc(S.roomT) + '</b><small>' + esc(S.roomP) + '</small></span><i aria-hidden="true">→</i></button>'
    + '<nav class="s-nav" aria-label="' + esc(S.navLabel) + '">' + nav + '</nav>'
    + '<p class="s-foot"><span class="s-time" data-time>Mostar</span><span>© 2026 Graba</span></p>'
    + '</aside>'
    + '<div class="s-stage">'
    + '<section class="s-panel s-work on" id="work" data-panel="work" aria-labelledby="work-h">'
    + '<header class="s-ph"><p class="s-k">' + esc(T.workK) + '</p><h2 id="work-h">' + em(T.workH) + '</h2>'
    + '<p class="s-count" aria-live="polite"><b data-cur>01</b><span> / ' + pad(n) + '</span></p>'
    + '<p class="s-arrows"><button type="button" class="s-arr" data-step="-1" aria-label="' + esc(S.prev) + '">←</button><button type="button" class="s-arr" data-step="1" aria-label="' + esc(S.next) + '">→</button></p></header>'
    + '<div class="s-projs" data-projs>' + projects + '</div>'
    + '<ol class="s-thumbs" aria-label="' + esc(T.workK) + '">' + thumbs + '</ol>'
    + '</section>'
    + '<section class="s-panel s-serv" id="services" data-panel="services" aria-labelledby="serv-h">'
    + '<header class="s-ph"><p class="s-k">' + esc(T.servK) + '</p><h2 id="serv-h">' + em(T.servH) + '</h2></header>'
    + '<ul class="s-cards">' + services + '</ul>'
    + '<div class="s-proc"><p class="s-k">' + esc(T.procK) + '</p><ol>' + process + '</ol></div>'
    + '</section>'
    + '<section class="s-panel s-about" id="about" data-panel="about" aria-labelledby="about-h">'
    + '<header class="s-ph"><p class="s-k">' + esc(T.aboutK) + '</p><h2 id="about-h">' + em(T.aboutH) + '</h2></header>'
    + '<div class="s-cols"><div>' + T.aboutP.map((p) => '<p class="s-p">' + esc(p) + '</p>').join('') + '<dl class="s-facts">' + facts + '</dl></div>'
    + '<div><p class="s-k">' + esc(T.stackK) + '</p><ul class="s-chips">' + stack + '</ul><p class="s-credit">' + creditHTML(PF, lang) + '</p></div></div>'
    + '</section>'
    + '<section class="s-panel s-contact" id="contact" data-panel="contact" aria-labelledby="contact-h">'
    + '<header class="s-ph"><p class="s-k">' + esc(T.contactK) + '</p><h2 id="contact-h">' + em(T.contactH) + '</h2></header>'
    + '<p class="s-p">' + esc(T.contactP) + '</p>'
    + '<button type="button" class="s-mail" data-copy="' + C.email + '"><span>' + esc(C.email) + '</span><small>' + esc(T.copy) + '</small></button>'
    + '<ul class="s-channels">' + channels + '</ul>'
    + '<p class="s-sign">' + esc(T.foot) + '</p>'
    + '</section>'
    + '</div>';
}
