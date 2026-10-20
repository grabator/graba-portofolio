/*
 * Obična verzija (glavna stranica): crveno-crni izgled.
 * Vrh sa telefonom, velika kartica najnovijeg projekta za klijenta, usluge i "Kako radim", ostali radovi i kontakt.
 * Soba (3D) ostaje na uređajima na dodir, otvara se dugmetom "Uđi u moju sobu".
 * Ista funkcija pravi HTML u browseru (promjena jezika) i u tools/staticno.mjs (statični HTML za Google).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ext = 'target="_blank" rel="noopener"';
const pad = (n) => String(n).padStart(2, '0');

export function creditHTML(PF, lang) {
  const c = PF.credit;
  return esc(PF[lang].credit) + ' <a href="' + c.url + '" ' + ext + '>' + esc(c.name) + ' · ' + esc(c.site) + '</a>';
}

export const TABS = ['services', 'work', 'process', 'contact'];

/* male ikone (linijske, boja = currentColor) */
const IC = {
  viber: '<path d="M12 3c4.9 0 8 2.6 8 7.4 0 4.6-3 7.2-7.6 7.2-.8 0-1.6-.1-2.3-.3L7 19.5V16.6C4.9 15.4 4 13.3 4 10.4 4 5.6 7.1 3 12 3z"/><path d="M9.5 8.2c.3-.4.8-.4 1 0l.6 1.2c.1.3 0 .6-.2.8l-.3.3c.4.9 1.2 1.7 2.1 2.1l.3-.3c.2-.2.5-.3.8-.2l1.2.6c.4.2.4.7 0 1-.6.6-1.5.8-2.3.4-1.6-.8-2.9-2.1-3.6-3.6-.4-.8-.2-1.7.4-2.3z"/>',
  wa: '<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8z"/><path d="M9.2 8.4c.2-.5.7-.5.9 0l.5 1.1c.1.3 0 .5-.2.7l-.3.4c.5 1 1.3 1.8 2.3 2.3l.4-.3c.2-.2.4-.3.7-.2l1.1.5c.5.2.5.7 0 .9-.7.4-1.5.5-2.2.1a7.4 7.4 0 0 1-3.3-3.3c-.4-.7-.3-1.5.1-2.2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/>',
  phone: '<path d="M6.5 3.5l3 3-2 2.5a12 12 0 0 0 7.5 7.5l2.5-2 3 3-2 2.5C11 20 4 13 4 5.5z"/>',
  gh: '<path d="M9 19c-4 1.3-4-2-6-2.5m12 4.5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.8 2.8 5.8 3.1 5.8 3.1a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 4.4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  room: '<path d="M3 10l9-6 9 6v10H3z"/><path d="M9 20v-6h6v6"/>'
};
const ic = (k) => '<svg class="g-ic" viewBox="0 0 24 24" aria-hidden="true">' + IC[k] + '</svg>';

export function classicHTML(PF, lang) {
  const T = PF[lang], C = PF.contact, G = T.g, S = T.site;
  const feat = PF.work.find((w) => w.client) || PF.work[0];
  const [fName, , fDesc] = T.items[feat.id];
  const others = PF.work.filter((w) => w !== feat);

  const langs = '<div class="g-langs" role="group" aria-label="' + esc(T.room.lang) + '">'
    + ['bs', 'en'].map((l) => '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === lang) + '">' + l.toUpperCase() + '</button>').join('') + '</div>';

  const nav = '<header class="g-nav"><a class="g-logo" href="#top" aria-label="Ahmed Grabus">AHMED <span class="g-box">GRABUS</span></a>'
    + '<nav class="g-links" aria-label="' + esc(S.navLabel) + '">' + G.nav.map((t, i) => '<a href="#' + TABS[i] + '">' + esc(t) + '</a>').join('') + '</nav>'
    + '<div class="g-nav-r">' + langs + '<a class="g-btn g-pr g-sm" href="#contact">' + esc(G.cta) + '</a></div></header>';

  const chips = G.chips.map(([a, b], i) => '<p class="g-chip g-chip' + (i + 1) + '"><b>' + esc(a) + '</b><small>' + esc(b) + '</small></p>').join('');
  const faces = ['casa-montana.jpg', 'ashiana-cafe.jpg', 'beauty-salon.jpg'].map((f) => '<img src="assets/work/' + f + '" alt="" width="40" height="40" decoding="async">').join('');

  const hero = '<section class="g-hero" id="top"><div class="g-hero-txt">'
    + '<div class="g-who"><i aria-hidden="true">AG</i><div><b>Ahmed Grabus</b><small>' + esc(T.role) + ' · ' + esc(S.place) + '</small></div></div>'
    + '<h1 class="g-h1">' + esc(G.h1a) + ' <span class="g-box">' + esc(G.h1b) + '</span></h1>'
    + '<p class="g-lead">' + esc(G.lead) + '</p>'
    + '<p class="g-btns"><a class="g-btn g-pr" href="#contact">' + esc(G.cta) + '</a><a class="g-btn g-po" href="#work">' + esc(G.ctaWork) + '</a></p>'
    + '<button type="button" class="g-room" data-room>' + ic('room') + '<span><b>' + esc(G.room) + '</b><small>' + esc(G.roomSub) + '</small></span><i aria-hidden="true">→</i></button>'
    + '<p class="g-trust"><span class="g-faces">' + faces + '</span><span><b>' + esc(fName) + '</b> ' + esc(G.trust) + '</span></p>'
    + '</div><div class="g-stage" aria-hidden="true"><div class="g-glow"></div><div class="g-phone"><img src="' + feat.phone + '" alt="" width="560" height="1212" decoding="async"></div>' + chips + '</div></section>';

  const res = G.res.map(([a, b]) => '<li><b>' + esc(a) + '</b><span>' + esc(b) + '</span></li>').join('');
  const featTags = G.tagsF.map((t) => '<li>' + esc(t) + '</li>').join('') + '<li><a href="' + feat.live + '" ' + ext + '>' + esc(feat.live.replace(/^https?:\/\//, '').replace(/\/$/, '')) + ' ↗</a></li>';
  const featured = '<section class="g-sec g-work" id="work" aria-labelledby="feat-h"><article class="g-feat">'
    + '<img class="g-feat-bg" src="' + feat.img + '" alt="' + esc(fName) + '" width="1200" height="675" loading="lazy" decoding="async">'
    + '<div class="g-feat-in"><div><p class="g-kick">' + esc(G.featK) + '</p><h2 class="g-an" id="feat-h">' + esc(fName.toUpperCase()) + '</h2><p class="g-feat-p">' + esc(fDesc) + '</p><ul class="g-tags">' + featTags + '</ul></div>'
    + '<div class="g-phone g-phone-sm" aria-hidden="true"><img src="' + feat.phone + '" alt="" width="560" height="1212" loading="lazy" decoding="async"></div></div></article>'
    + '<ul class="g-res">' + res + '</ul></section>';

  const serv = G.serv.map(([a, b]) => '<li><b>' + esc(a) + '</b><span>' + esc(b) + '</span></li>').join('');
  const proc = G.proc.map(([a, b], i) => '<li><span class="g-n">' + pad(i + 1) + '</span><b>' + esc(a) + '</b><span>' + esc(b) + '</span></li>').join('');
  const cols = '<section class="g-sec g-cols"><div id="services"><h2 class="g-an">' + esc(G.servH.toUpperCase()) + '</h2><p class="g-sub">' + esc(G.servSub) + '</p><ul class="g-serv">' + serv + '</ul></div>'
    + '<div id="process"><h2 class="g-an">' + esc(G.procH.toUpperCase()) + '</h2><ol class="g-proc">' + proc + '</ol></div></section>';

  const card = (w) => {
    const [name, kind] = T.items[w.id];
    const shot = w.img ? '<img src="' + w.img + '" alt="' + esc(name) + '" width="1200" height="675" loading="lazy" decoding="async">'
      : '<div class="s-art s-art-' + w.art + '" aria-hidden="true"><span>' + esc(name) + '</span></div>';
    const links = (w.live ? '<a href="' + w.live + '" ' + ext + '>' + esc(G.live) + ' ↗</a>' : '') + (w.src ? '<a href="' + w.src + '" ' + ext + '>' + esc(G.source) + ' ↗</a>' : '');
    return '<li class="g-card"><figure>' + shot + '</figure><div class="g-card-t"><div><h3>' + esc(name) + '</h3><p>' + esc(kind) + ' · ' + w.year + '</p></div><p class="g-card-l">' + links + '</p></div></li>';
  };
  const more = '<section class="g-sec g-more" aria-labelledby="more-h"><div class="g-head"><h2 class="g-an" id="more-h">' + esc(G.moreH.toUpperCase()) + '</h2><p class="g-sub">' + esc(G.moreSub) + '</p></div>'
    + '<ul class="g-grid">' + others.map(card).join('') + '</ul></section>';

  const contact = '<section class="g-sec g-contact" id="contact" aria-labelledby="contact-h"><h2 class="g-an" id="contact-h">' + esc(G.contactH.toUpperCase()) + '</h2><p class="g-sub">' + esc(G.contactP) + '</p>'
    + '<button type="button" class="g-mail" data-copy="' + C.email + '"><span>' + C.email + '</span><small>' + esc(G.copy) + '</small></button>'
    + '<ul class="g-chan"><li><a href="' + C.viber + '">' + ic('viber') + '<span>' + esc(T.viber) + '</span><b>' + C.phone + '</b></a></li>'
    + '<li><a href="' + C.whatsapp + '" ' + ext + '>' + ic('wa') + '<span>' + esc(T.whatsapp) + '</span><b>' + C.phone + '</b></a></li>'
    + '<li><a href="tel:' + C.tel + '">' + ic('phone') + '<span>' + esc(T.phone) + '</span><b>' + C.phone + '</b></a></li>'
    + '<li><a href="' + C.github + '" ' + ext + '>' + ic('gh') + '<span>GitHub</span><b>grabator</b></a></li></ul>'
    + '<footer class="g-foot"><span>' + esc(G.foot) + '</span><span>' + esc(G.place) + '</span><span class="g-credit">' + creditHTML(PF, lang) + '</span></footer></section>';

  const dock = '<nav class="g-dock" aria-label="' + esc(S.quickT) + '"><a class="g-d-v" href="' + C.viber + '">' + ic('viber') + 'Viber</a><a class="g-d-w" href="' + C.whatsapp + '" ' + ext + '>' + ic('wa') + 'WhatsApp</a><button type="button" data-copy="' + C.email + '">' + ic('mail') + 'Email</button></nav>';

  return '<div class="g">' + nav + hero + featured + cols + more + contact + '</div>' + dock;
}
