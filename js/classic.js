/*
 * Glavna stranica: svijetao, uredan izgled (klase pf-*).
 * Vrh sa naslovom i dva telefona, izdvojeni radovi (Casa Montana, M&S, MyShishapedia), izjave klijenata,
 * usluge, o meni i kontakt. Soba (3D) ostaje na uređajima na dodir, otvara se dugmetom "Uđite u moju 3D sobu".
 * Ista funkcija pravi HTML u browseru (promjena jezika) i u tools/staticno.mjs (statični HTML za Google).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ext = 'target="_blank" rel="noopener"';
const pad = (n) => String(n).padStart(2, '0');
// *riječi* u naslovu postaju kurziv u boji
const em = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

export function creditHTML(PF, lang) {
  const c = PF.credit;
  return esc(PF[lang].credit) + ' <a href="' + c.url + '" ' + ext + '>' + esc(c.name) + ' · ' + esc(c.site) + '</a>';
}

export const TABS = ['work', 'services', 'about', 'contact'];

/* male linijske ikone (boja = currentColor) */
const IC = {
  viber: '<path d="M12 3c4.9 0 8 2.6 8 7.4 0 4.6-3 7.2-7.6 7.2-.8 0-1.6-.1-2.3-.3L7 19.5V16.6C4.9 15.4 4 13.3 4 10.4 4 5.6 7.1 3 12 3z"/><path d="M9.5 8.2c.3-.4.8-.4 1 0l.6 1.2c.1.3 0 .6-.2.8l-.3.3c.4.9 1.2 1.7 2.1 2.1l.3-.3c.2-.2.5-.3.8-.2l1.2.6c.4.2.4.7 0 1-.6.6-1.5.8-2.3.4-1.6-.8-2.9-2.1-3.6-3.6-.4-.8-.2-1.7.4-2.3z"/>',
  wa: '<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8z"/><path d="M9.2 8.4c.2-.5.7-.5.9 0l.5 1.1c.1.3 0 .5-.2.7l-.3.4c.5 1 1.3 1.8 2.3 2.3l.4-.3c.2-.2.4-.3.7-.2l1.1.5c.5.2.5.7 0 .9-.7.4-1.5.5-2.2.1a7.4 7.4 0 0 1-3.3-3.3c-.4-.7-.3-1.5.1-2.2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/>',
  phone: '<path d="M6.5 3.5l3 3-2 2.5a12 12 0 0 0 7.5 7.5l2.5-2 3 3-2 2.5C11 20 4 13 4 5.5z"/>',
  gh: '<path d="M9 19c-4 1.3-4-2-6-2.5m12 4.5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.8 2.8 5.8 3.1 5.8 3.1a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 4.4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  room: '<path d="M3 10l9-6 9 6v10H3z"/><path d="M9 20v-6h6v6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.8 2.5 15.2 0 18M12 3c-2.5 2.8-2.5 15.2 0 18"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  out: '<path d="M7 17L17 7M9 7h8v8"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>'
};
const ic = (k) => '<svg class="pf-ic" viewBox="0 0 24 24" aria-hidden="true">' + IC[k] + '</svg>';
const QUOTE = '<svg class="pf-q-mark" viewBox="0 0 42 32" aria-hidden="true"><path d="M0 32V19.2C0 8.6 5.6 2.2 16.8 0l1.8 4.4C12.4 6.2 9.4 9.8 9.2 15H17v17zm22.4 0V19.2C22.4 8.6 28 2.2 39.2 0L41 4.4c-6.2 1.8-9.2 5.4-9.4 10.6h7.8v17z"/></svg>';

export function classicHTML(PF, lang) {
  const T = PF[lang], C = PF.contact, P = T.p;
  const W = Object.fromEntries(PF.work.map((w) => [w.id, w]));
  const name = (id) => T.items[id][0], type = (id) => T.items[id][1];

  const langs = '<div class="pf-langs" role="group" aria-label="' + esc(T.room.lang) + '">'
    + ['bs', 'en'].map((l) => '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === lang) + '">' + l.toUpperCase() + '</button>').join('') + '</div>';

  const nav = '<header class="pf-nav"><div class="pf-wrap pf-nav-in">'
    + '<a class="pf-logo" href="#top" aria-label="Ahmed Grabus"><i aria-hidden="true">AG</i><span>Ahmed Grabus</span></a>'
    + '<nav class="pf-links" aria-label="' + esc(T.site.navLabel) + '">' + P.nav.map((t, i) => '<a href="#' + TABS[i] + '">' + esc(t) + '</a>').join('') + '</nav>'
    + '<div class="pf-nav-r">' + langs + '<a class="pf-btn pf-dark pf-sm" href="#contact">' + esc(P.write) + '</a></div>'
    + '</div><i class="pf-prog" aria-hidden="true"></i></header>';

  /* vrh: naslov, dva telefona koji se sami listaju i dvije kartice koje lebde */
  const words = (s, start) => s.split(' ').map((w, i) => '<span class="pf-w"><span style="--i:' + (start + i) + '">' + esc(w) + '</span></span>').join(' ');
  const n1 = P.h1a.split(' ').length;
  // crta ispod zadnje riječi naslova (nacrta se poslije riječi)
  const lastSp = P.h1b.lastIndexOf(' ');
  const h1b = (lastSp > 0 ? words(P.h1b.slice(0, lastSp), n1) + ' ' : '')
    + '<span class="pf-last">' + words(P.h1b.slice(lastSp + 1), n1 + P.h1b.split(' ').length - 1)
    + '<svg class="pf-swash" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path d="M3 15C60 5 150 3 297 9"/></svg></span>';
  const phone = (id, cls, first) => '<div class="pf-phone ' + cls + '"><div class="pf-scr"><img src="' + W[id].long + '" alt="" width="600" height="6769"' + (first ? ' fetchpriority="high"' : '') + '></div></div>';
  const hero = '<section class="pf-hero" id="top"><div class="pf-aura" aria-hidden="true"><i></i><i></i><i></i></div>'
    + '<div class="pf-wrap pf-hero-in"><div class="pf-hero-txt">'
    + '<p class="pf-avail"><i aria-hidden="true"></i>' + esc(P.avail) + ' · ' + esc(P.place.split(',')[0]) + '</p>'
    + '<h1 class="pf-h1">' + words(P.h1a, 0) + ' <em>' + h1b + '</em></h1>'
    + '<p class="pf-lead">' + esc(P.lead) + '</p>'
    + '<div class="pf-btns"><a class="pf-btn pf-dark pf-mag" href="#work">' + esc(P.cta1) + ic('arrow') + '</a><a class="pf-btn pf-line pf-mag" href="' + C.whatsapp + '" ' + ext + '>' + ic('wa') + esc(P.cta2) + '</a></div>'
    + '<button type="button" class="pf-room" data-room>' + ic('room') + '<span><b>' + esc(P.room) + '</b><small>' + esc(P.roomSub) + '</small></span>' + ic('arrow') + '</button>'
    + '<p class="pf-proof"><span class="pf-stars" aria-hidden="true">★★★★★</span>' + esc(P.proof) + '</p>'
    + '</div><div class="pf-stage" aria-hidden="true"><div class="pf-tilt">'
    + phone('casa', 'pf-ph1', true) + phone('mscarwash', 'pf-ph2', false)
    + '<div class="pf-chip pf-chip1"><span class="pf-chip-ic">' + ic('check') + '</span><span><b>' + esc(P.float[0][0]) + '</b><small>' + esc(P.float[0][1]) + '</small></span></div>'
    + '<div class="pf-chip pf-chip2"><span class="pf-chip-ic pf-g">' + ic('globe') + '</span><span><b>' + esc(P.float[1][0]) + '</b><small>' + esc(P.float[1][1]) + '</small></span></div>'
    + '</div></div></div></section>';

  const tick = P.ticker.map((t) => '<span>' + esc(t) + '</span><i>✦</i>').join('');
  const ticker = '<div class="pf-ticker" aria-hidden="true"><div class="pf-ticker-in">' + tick + tick + '</div></div>';

  /* izdvojeni radovi */
  const caseHTML = (id, i) => {
    const w = W[id], c = P.cases[id];
    return '<article class="pf-case' + (i % 2 ? ' pf-flip' : '') + '" id="case-' + id + '">'
      + '<a class="pf-case-img rv" href="' + w.live + '" ' + ext + ' data-cursor="' + esc(P.live) + '" aria-label="' + esc(name(id) + ': ' + P.live) + '"><img src="' + w.img + '" alt="' + esc(name(id)) + '" width="1200" height="675" loading="lazy"></a>'
      + '<div class="pf-case-txt rv"><p class="pf-k"><span>' + pad(i + 1) + '</span>' + esc(c.k) + '</p>'
      + '<h3>' + esc(name(id)) + '</h3><p class="pf-case-d">' + esc(c.d) + '</p>'
      + '<ul class="pf-stats">' + c.stats.map(([a, b]) => '<li><b>' + esc(a) + '</b><span>' + esc(b) + '</span></li>').join('') + '</ul>'
      + '<div class="pf-case-l"><a class="pf-link" href="' + w.live + '" ' + ext + '>' + esc(P.live) + ic('out') + '</a>' + (w.src ? '<a class="pf-link pf-mut" href="' + w.src + '" ' + ext + '>' + ic('gh') + esc(P.source) + '</a>' : '') + '</div>'
      + '</div></article>';
  };
  const featured = ['casa', 'mscarwash', 'myshishapedia'];

  const ART = { grabpoints: ['GP', '#26407a', '#5b86e0'], apoteke: ['Rx', '#0d5e50', '#3cbf9a'] };
  const more = ['squadjury', 'salon', 'lounge', 'svecana', 'planinka', 'ashiana', 'grabpoints', 'apoteke'].filter((id) => W[id]).map((id) => {
    const w = W[id], a = ART[id];
    const pic = w.img ? '<img src="' + w.img + '" alt="" width="1200" height="675" loading="lazy">'
      : '<span class="pf-art" style="--a:' + a[1] + ';--b:' + a[2] + '">' + a[0] + '</span>';
    return '<li class="pf-mini"><a href="' + (w.live || w.src) + '" ' + ext + '><span class="pf-mini-pic">' + pic + '</span>'
      + '<span class="pf-mini-t"><b>' + esc(name(id)) + '</b><small>' + esc(type(id)) + '</small></span>' + ic(w.live ? 'out' : 'gh') + '</a></li>';
  }).join('');

  const work = '<section class="pf-sec" id="work"><div class="pf-wrap">'
    + '<div class="pf-head rv"><p class="pf-eye">' + esc(P.workK) + '</p><h2>' + em(P.workH) + '</h2><p class="pf-sub">' + esc(P.workSub) + '</p></div>'
    + featured.map(caseHTML).join('')
    + '<div class="pf-more rv"><div class="pf-more-h"><h3>' + esc(P.moreH) + '</h3><p>' + esc(P.moreSub) + '</p></div><ul class="pf-minis">' + more + '</ul></div>'
    + '</div></section>';

  /* dizajn za M&S: traka koja polako klizi */
  const fig = (alt) => PF.design.map(([f, w, h], i) => '<figure><img src="assets/design/' + f + '" alt="' + (alt ? esc(T.g.des[i] || '') : '') + '" width="' + w + '" height="' + h + '" loading="lazy"><figcaption>' + esc(T.g.des[i] || '') + '</figcaption></figure>').join('');
  const design = '<section class="pf-des" aria-label="' + esc(P.desK) + '"><div class="pf-wrap"><p class="pf-eye rv">' + esc(P.desK) + '</p></div>'
    + '<div class="pf-des-row"><div class="pf-des-in">' + fig(true) + '<div class="pf-des-dup" aria-hidden="true">' + fig(false) + '</div></div></div></section>';

  /* izjave klijenata */
  const quotes = '<section class="pf-sec pf-quotes"><div class="pf-wrap">'
    + '<div class="pf-head rv"><p class="pf-eye">' + esc(P.quotesK) + '</p><h2>' + em(P.quotesH) + '</h2></div>'
    + '<div class="pf-q-grid">' + P.quotes.map(([q, who, where], i) => '<figure class="pf-q rv" style="--d:' + i + '">' + QUOTE
      + '<span class="pf-stars" role="img" aria-label="5/5">★★★★★</span><blockquote>' + esc(q) + '</blockquote>'
      + '<figcaption><i aria-hidden="true">' + esc(where.charAt(0)) + '</i><span><b>' + esc(who) + '</b><small>' + esc(where) + '</small></span></figcaption></figure>').join('') + '</div>'
    + '</div></section>';

  /* usluge i kako radimo */
  const services = '<section class="pf-sec pf-alt" id="services"><div class="pf-wrap">'
    + '<div class="pf-head rv"><p class="pf-eye">' + esc(P.servK) + '</p><h2>' + em(P.servH) + '</h2><p class="pf-sub">' + esc(P.servSub) + '</p></div>'
    + '<ul class="pf-serv">' + P.serv.map(([k, h, d], i) => '<li class="rv" style="--d:' + i + '"><span class="pf-serv-ic">' + ic(k) + '</span><h3>' + esc(h) + '</h3><p>' + esc(d) + '</p></li>').join('') + '</ul>'
    + '<div class="pf-proc rv"><h3>' + esc(P.procH) + '</h3><ol>' + P.proc.map(([h, d], i) => '<li><span>' + pad(i + 1) + '</span><b>' + esc(h) + '</b><small>' + esc(d) + '</small></li>').join('') + '</ol></div>'
    + '</div></section>';

  /* o meni */
  const stack = [].concat(...T.g.stackG.map((g) => g[1]));
  const about = '<section class="pf-sec" id="about"><div class="pf-wrap pf-about">'
    + '<div class="rv"><p class="pf-eye">' + esc(P.aboutK) + '</p><h2 class="pf-about-h">' + em(P.aboutH) + '</h2></div>'
    + '<div class="pf-about-r"><p class="pf-about-p rv">' + esc(P.aboutP) + '</p>'
    + '<ul class="pf-why">' + P.why.map(([h, d], i) => '<li class="rv" style="--d:' + i + '"><b>' + esc(h) + '</b><span>' + esc(d) + '</span></li>').join('') + '</ul>'
    + '<p class="pf-stack-k rv">' + esc(P.stackK) + '</p><ul class="pf-stack rv">' + stack.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ul></div>'
    + '</div></section>';

  /* kontakt */
  const contact = '<section class="pf-contact" id="contact"><div class="pf-glow" aria-hidden="true"></div><div class="pf-wrap">'
    + '<p class="pf-eye rv">' + esc(P.contactK) + '</p><h2 class="pf-contact-h rv">' + em(P.contactH) + '</h2><p class="pf-contact-p rv">' + esc(P.contactP) + '</p>'
    + '<div class="pf-cbtns rv">'
    + '<a class="pf-cbtn pf-wa pf-mag" href="' + C.whatsapp + '" ' + ext + '>' + ic('wa') + '<span><b>WhatsApp</b><small>' + esc(C.phone) + '</small></span></a>'
    + '<a class="pf-cbtn pf-vb pf-mag" href="' + C.viber + '">' + ic('viber') + '<span><b>Viber</b><small>' + esc(C.phone) + '</small></span></a>'
    + '<button type="button" class="pf-cbtn pf-ml pf-mag" data-copy="' + C.email + '">' + ic('mail') + '<span><b>' + esc(C.email) + '</b><small>' + esc(P.copy) + '</small></span></button>'
    + '</div>'
    + '<p class="pf-cmore rv"><a href="tel:' + C.tel + '">' + ic('phone') + esc(C.phone) + '</a><a href="' + C.github + '" ' + ext + '>' + ic('gh') + 'github.com/grabator</a></p>'
    + '<footer class="pf-foot"><span>© 2026 · ' + esc(P.foot) + '</span><span>' + esc(P.place) + '</span><span class="pf-credit">' + creditHTML(PF, lang) + '</span><a class="pf-top" href="#top">' + ic('up') + esc(P.top) + '</a></footer>'
    + '</div></section>';

  const dock = '<nav class="pf-dock" aria-label="' + esc(T.site.quickT) + '">'
    + '<a class="pf-d-w" href="' + C.whatsapp + '" ' + ext + '>' + ic('wa') + 'WhatsApp</a>'
    + '<a class="pf-d-v" href="' + C.viber + '">' + ic('viber') + 'Viber</a>'
    + '<button type="button" data-copy="' + C.email + '">' + ic('mail') + 'Email</button></nav>';

  return '<div class="pf">' + nav + hero + ticker + work + design + quotes + services + about + contact + '</div>' + dock + '<div class="pf-cursor" aria-hidden="true"></div>';
}
