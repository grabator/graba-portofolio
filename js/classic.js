/*
 * Glavna stranica: crna pozadina, ljubičasti naglasak, široki font (Anybody) za naslove.
 * Plutajuća traka na vrhu (logo G, vrijeme u Mostaru, meni), vrh sa imenom i dva telefona, radovi, klijenti, usluge i kontakt.
 * Soba (3D) ostaje na uređajima na dodir, otvara se dugmetom na vrhu.
 * Ista funkcija pravi HTML u browseru (promjena jezika) i u tools/staticno.mjs (statični HTML za Google).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ext = 'target="_blank" rel="noopener"';
const pad = (n) => String(n).padStart(2, '0');

export function creditHTML(PF, lang) {
  const c = PF.credit;
  return esc(PF[lang].credit) + ' <a href="' + c.url + '" ' + ext + '>' + esc(c.name) + ' · ' + esc(c.site) + '</a>';
}

export const TABS = ['work', 'clients', 'services', 'contact'];

/* logo: crno G na ljubičastoj pločici */
export const LOGO = '<svg class="pf-g" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#9b6bff"/><path d="M46 19H24a7 7 0 0 0-7 7v12a7 7 0 0 0 7 7h22V33H34" fill="none" stroke="#0a0a0c" stroke-width="7.5"/></svg>';

const IC = {
  viber: '<path d="M12 3c4.9 0 8 2.6 8 7.4 0 4.6-3 7.2-7.6 7.2-.8 0-1.6-.1-2.3-.3L7 19.5V16.6C4.9 15.4 4 13.3 4 10.4 4 5.6 7.1 3 12 3z"/><path d="M9.5 8.2c.3-.4.8-.4 1 0l.6 1.2c.1.3 0 .6-.2.8l-.3.3c.4.9 1.2 1.7 2.1 2.1l.3-.3c.2-.2.5-.3.8-.2l1.2.6c.4.2.4.7 0 1-.6.6-1.5.8-2.3.4-1.6-.8-2.9-2.1-3.6-3.6-.4-.8-.2-1.7.4-2.3z"/>',
  wa: '<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8z"/><path d="M9.2 8.4c.2-.5.7-.5.9 0l.5 1.1c.1.3 0 .5-.2.7l-.3.4c.5 1 1.3 1.8 2.3 2.3l.4-.3c.2-.2.4-.3.7-.2l1.1.5c.5.2.5.7 0 .9-.7.4-1.5.5-2.2.1a7.4 7.4 0 0 1-3.3-3.3c-.4-.7-.3-1.5.1-2.2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/>',
  phone: '<path d="M6.5 3.5l3 3-2 2.5a12 12 0 0 0 7.5 7.5l2.5-2 3 3-2 2.5C11 20 4 13 4 5.5z"/>',
  gh: '<path d="M9 19c-4 1.3-4-2-6-2.5m12 4.5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.8 2.8 5.8 3.1 5.8 3.1a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 4.4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  room: '<path d="M3 10l9-6 9 6v10H3z"/><path d="M9 20v-6h6v6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  out: '<path d="M7 17L17 7M9 7h8v8"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>'
};
const ic = (k) => '<svg class="pf-ic" viewBox="0 0 24 24" aria-hidden="true">' + IC[k] + '</svg>';
// naslov sekcije: broj i riječ u širokom fontu
const head = (n, h, sub) => '<div class="pf-head rv"><span class="pf-n">' + pad(n) + '</span><h2>' + esc(h) + '</h2>' + (sub ? '<p class="pf-sub">' + esc(sub) + '</p>' : '') + '</div>';

export function classicHTML(PF, lang) {
  const T = PF[lang], C = PF.contact, P = T.p;
  const W = Object.fromEntries(PF.work.map((w) => [w.id, w]));
  const name = (id) => T.items[id][0], type = (id) => T.items[id][1];

  const langs = '<div class="pf-langs" role="group" aria-label="' + esc(T.room.lang) + '">'
    + ['bs', 'en'].map((l) => '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === lang) + '">' + l.toUpperCase() + '</button>').join('') + '</div>';
  const links = P.nav.map((t, i) => '<a href="#' + TABS[i] + '"><span>' + pad(i + 1) + '</span>' + esc(t) + '</a>').join('');

  /* plutajuća traka: logo, vrijeme u Mostaru (živo), meni; na mobitelu se otvara prema dole */
  const bar = '<header class="pf-bar" id="pf-bar"><div class="pf-bar-row">'
    + '<a class="pf-logo" href="#top" aria-label="Ahmed Grabus">' + LOGO + '<span>Grabus</span></a>'
    + '<p class="pf-clock"><i aria-hidden="true"></i><span>' + esc(P.city) + '</span> <b data-clock></b><em>' + esc(P.avail) + '</em></p>'
    + '<nav class="pf-links" aria-label="' + esc(T.site.navLabel) + '">' + links + '</nav>'
    + '<div class="pf-bar-r">' + langs + '<a class="pf-btn pf-pr pf-sm" href="' + C.whatsapp + '" ' + ext + '>' + ic('wa') + esc(P.write) + '</a></div>'
    + '<button type="button" class="pf-burger" aria-expanded="false" aria-controls="pf-sheet" aria-label="' + esc(P.menu) + '" data-open="' + esc(P.menu) + '" data-close="' + esc(P.close) + '"><i></i><i></i></button>'
    + '</div><div class="pf-sheet" id="pf-sheet"><div class="pf-sheet-in">'
    + '<nav class="pf-sheet-links" aria-label="' + esc(T.site.navLabel) + '">' + links + '</nav>'
    + '<div class="pf-sheet-foot">' + langs + '<a class="pf-btn pf-pr pf-sm" href="' + C.whatsapp + '" ' + ext + '>' + ic('wa') + 'WhatsApp</a><a class="pf-btn pf-ghost pf-sm" href="' + C.viber + '">' + ic('viber') + 'Viber</a></div>'
    + '</div></div></header>';

  /* vrh */
  const letters = (w, start) => [...w].map((ch, i) => '<span style="--i:' + (start + i) + '">' + esc(ch) + '</span>').join('');
  const phone = (id, cls, first) => '<div class="pf-phone ' + cls + '"><div class="pf-scr"><img src="' + W[id].long + '" alt="" width="600" height="6769"' + (first ? ' fetchpriority="high"' : '') + '></div></div>';
  const hero = '<section class="pf-hero" id="top"><div class="pf-dots" aria-hidden="true"></div><div class="pf-glow" aria-hidden="true"></div>'
    + '<div class="pf-wrap pf-hero-in"><div class="pf-hero-txt">'
    + '<p class="pf-role">' + esc(P.role) + '</p>'
    + '<h1 class="pf-h1" aria-label="Ahmed Grabus"><span class="pf-l1" aria-hidden="true">' + letters('AHMED', 0) + '</span><span class="pf-l2" aria-hidden="true">' + letters('GRABUS', 5) + '</span></h1>'
    + '<p class="pf-lead">' + esc(P.lead) + '</p>'
    + '<div class="pf-btns"><a class="pf-btn pf-pr pf-mag" href="#work">' + esc(P.cta1) + ic('arrow') + '</a><a class="pf-btn pf-ghost pf-mag" href="' + C.whatsapp + '" ' + ext + '>' + ic('wa') + esc(P.cta2) + '</a></div>'
    + '<button type="button" class="pf-room" data-room>' + ic('room') + '<span><b>' + esc(P.room) + '</b><small>' + esc(P.roomSub) + '</small></span>' + ic('arrow') + '</button>'
    + '<p class="pf-cl"><span>' + esc(P.clientsK) + '</span>Casa Montana<i></i>M&amp;S Car Wash</p>'
    + '</div><div class="pf-stage" aria-hidden="true"><div class="pf-tilt">' + phone('casa', 'pf-ph1', true) + phone('mscarwash', 'pf-ph2', false) + '</div></div>'
    + '</div></section>';

  /* radovi */
  const thumbs = '<div class="pf-thumbs">' + [3, 1, 8].map((i) => { const [f, w, h] = PF.design[i]; return '<img src="assets/design/' + f + '" alt="' + esc(T.g.des[i]) + '" width="' + w + '" height="' + h + '" loading="lazy">'; }).join('') + '</div>';
  const caseHTML = (id, i) => {
    const w = W[id], c = P.cases[id];
    return '<article class="pf-case' + (i % 2 ? ' pf-flip' : '') + '" id="case-' + id + '">'
      + '<a class="pf-case-img rv" href="' + w.live + '" ' + ext + ' data-cursor="' + esc(P.live) + '" aria-label="' + esc(name(id) + ': ' + P.live) + '"><img src="' + w.img + '" alt="' + esc(name(id)) + '" width="1200" height="675" loading="lazy"></a>'
      + '<div class="pf-case-txt rv"><p class="pf-k">' + esc(c.k) + '</p><h3>' + esc(name(id)) + '</h3><p class="pf-case-d">' + esc(c.d) + '</p>'
      + '<ul class="pf-stats">' + c.stats.map(([a, b]) => '<li><b>' + esc(a) + '</b><span>' + esc(b) + '</span></li>').join('') + '</ul>'
      + (id === 'mscarwash' ? thumbs : '')
      + '<div class="pf-case-l"><a class="pf-link" href="' + w.live + '" ' + ext + '>' + esc(P.live) + ic('out') + '</a>' + (w.src ? '<a class="pf-link pf-mut" href="' + w.src + '" ' + ext + '>' + ic('gh') + esc(P.source) + '</a>' : '') + '</div>'
      + '</div></article>';
  };
  const ART = { grabpoints: 'GP', apoteke: 'Rx' };
  const more = ['squadjury', 'salon', 'lounge', 'svecana', 'planinka', 'ashiana', 'grabpoints', 'apoteke'].filter((id) => W[id]).map((id) => {
    const w = W[id];
    const pic = w.img ? '<img src="' + w.img + '" alt="" width="1200" height="675" loading="lazy">' : '<span class="pf-art">' + ART[id] + '</span>';
    return '<li class="pf-mini"><a href="' + (w.live || w.src) + '" ' + ext + '><span class="pf-mini-pic">' + pic + '</span>'
      + '<span class="pf-mini-t"><b>' + esc(name(id)) + '</b><small>' + esc(type(id)) + '</small></span>' + ic(w.live ? 'out' : 'gh') + '</a></li>';
  }).join('');
  const work = '<section class="pf-sec" id="work"><div class="pf-wrap">' + head(1, P.workH, P.workSub)
    + ['casa', 'mscarwash', 'myshishapedia'].map(caseHTML).join('')
    + '<div class="pf-more rv"><h3>' + esc(P.moreH) + '</h3><ul class="pf-minis">' + more + '</ul></div>'
    + '</div></section>';

  /* klijenti */
  const quotes = '<section class="pf-sec pf-quotes" id="clients"><div class="pf-wrap">' + head(2, P.quotesH)
    + '<div class="pf-q-grid">' + P.quotes.map(([q, who, where], i) => '<figure class="pf-q rv" style="--d:' + i + '">'
      + '<span class="pf-stars" role="img" aria-label="5/5"><i></i><i></i><i></i><i></i><i></i></span><blockquote>' + esc(q) + '</blockquote>'
      + '<figcaption><b>' + esc(where.split(',')[0]) + '</b><span>' + esc(who) + ', ' + esc(where.split(',').slice(1).join(',').trim()) + '</span></figcaption></figure>').join('') + '</div>'
    + '</div></section>';

  /* usluge */
  const stack = [].concat(...T.g.stackG.map((g) => g[1]));
  const services = '<section class="pf-sec" id="services"><div class="pf-wrap">' + head(3, P.servH, P.servSub)
    + '<ul class="pf-serv">' + P.serv.map(([h, d], i) => '<li class="rv" style="--d:' + i + '"><span>' + pad(i + 1) + '</span><h3>' + esc(h) + '</h3><p>' + esc(d) + '</p></li>').join('') + '</ul>'
    + '<div class="pf-proc rv"><p class="pf-proc-h">' + esc(P.procH) + '</p><ol>' + P.proc.map(([h, d]) => '<li><b>' + esc(h) + '</b><small>' + esc(d) + '</small></li>').join('') + '</ol></div>'
    + '<ul class="pf-stack rv">' + stack.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ul>'
    + '</div></section>';

  /* kontakt */
  const contact = '<section class="pf-contact" id="contact"><div class="pf-wrap">'
    + '<span class="pf-n rv">04</span><h2 class="pf-contact-h rv">' + esc(P.contactH) + '</h2><p class="pf-contact-p rv">' + esc(P.contactP) + '</p>'
    + '<div class="pf-cbtns rv">'
    + '<a class="pf-cbtn pf-mag" href="' + C.whatsapp + '" ' + ext + '>' + ic('wa') + '<span><b>WhatsApp</b><small>' + esc(C.phone) + '</small></span>' + ic('arrow') + '</a>'
    + '<a class="pf-cbtn pf-mag" href="' + C.viber + '">' + ic('viber') + '<span><b>Viber</b><small>' + esc(C.phone) + '</small></span>' + ic('arrow') + '</a>'
    + '<button type="button" class="pf-cbtn pf-mag" data-copy="' + C.email + '">' + ic('mail') + '<span><b>Email</b><small>' + esc(C.email) + '</small></span>' + ic('arrow') + '</button>'
    + '</div>'
    + '<footer class="pf-foot"><a class="pf-logo" href="#top" aria-label="Ahmed Grabus">' + LOGO + '</a><span>© 2026 ' + esc(P.foot) + '</span>'
    + '<a href="tel:' + C.tel + '">' + esc(C.phone) + '</a><a href="' + C.github + '" ' + ext + '>github.com/grabator</a>'
    + '<span class="pf-credit">' + creditHTML(PF, lang) + '</span><a class="pf-top" href="#top">' + ic('up') + esc(P.top) + '</a></footer>'
    + '</div></section>';

  const dock = '<nav class="pf-dock" aria-label="' + esc(T.site.quickT) + '">'
    + '<a href="' + C.whatsapp + '" ' + ext + '>' + ic('wa') + 'WhatsApp</a>'
    + '<a href="' + C.viber + '">' + ic('viber') + 'Viber</a>'
    + '<button type="button" data-copy="' + C.email + '">' + ic('mail') + 'Email</button></nav>';

  return '<div class="pf">' + bar + hero + work + quotes + services + contact + '</div>' + dock + '<div class="pf-cursor" aria-hidden="true"></div>';
}
