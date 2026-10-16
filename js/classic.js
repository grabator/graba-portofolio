/*
 * Klasična verzija: obična stranica sa svim sadržajem (radovi, usluge, alati, o meni, kontakt).
 * Ista funkcija pravi HTML u browseru (promjena jezika) i u tools/staticno.mjs (statični HTML za Google).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const em = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
const ext = 'target="_blank" rel="noopener"';

export function creditHTML(PF, lang) {
  const c = PF.credit;
  return esc(PF[lang].credit) + ' <a href="' + c.url + '" ' + ext + '>' + esc(c.name) + ' · ' + esc(c.site) + '</a>';
}

export function classicHTML(PF, lang) {
  const T = PF[lang], C = PF.contact;
  const work = PF.work.map((w) => {
    const [name, kind, desc] = T.items[w.id];
    const media = w.img
      ? '<img src="' + w.img + '" alt="' + esc(name) + '" width="1200" height="675" loading="lazy" decoding="async">'
      : '<div class="c-art c-art-' + w.art + '" aria-hidden="true"><span>' + esc(PF.exe[w.id]) + '</span></div>';
    const links = (w.live ? '<a class="c-btn" href="' + w.live + '" ' + ext + '>' + esc(T.live) + ' <span aria-hidden="true">↗</span></a>' : '')
      + (w.src ? '<a class="c-btn c-ghost" href="' + w.src + '" ' + ext + '>' + esc(T.code) + ' <span aria-hidden="true">↗</span></a>' : '');
    return '<li class="c-card"><div class="c-media">' + media + '</div><div class="c-body">'
      + '<p class="c-meta"><span>' + esc(kind) + '</span><span>' + w.year + '</span></p>'
      + '<h3>' + esc(name) + '</h3><p>' + esc(desc) + '</p>'
      + '<ul class="c-tags">' + w.tags.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul>'
      + '<p class="c-links">' + links + '</p></div></li>';
  }).join('');
  const services = T.services.map(([h, p], i) => '<li><span class="c-num">0' + (i + 1) + '</span><h3>' + esc(h) + '</h3><p>' + esc(p) + '</p></li>').join('');
  const process = T.process.map(([h, p], i) => '<li><span class="c-num">' + (i + 1) + '</span><h3>' + esc(h) + '</h3><p>' + esc(p) + '</p></li>').join('');
  const stack = PF.stack.map((s) => '<li>' + esc(s) + '</li>').join('');
  const facts = T.facts.map(([k, v]) => '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>').join('');
  const channels = [
    ['phone', 'tel:' + C.tel, C.phone],
    ['viber', C.viber, C.phone],
    ['whatsapp', C.whatsapp, C.phone],
    ['github', C.github, 'grabator']
  ].map(([k, href, v]) => '<li><a href="' + href + '"' + (k === 'phone' || k === 'viber' ? '' : ' ' + ext) + '><span>' + esc(T[k]) + '</span><b>' + esc(v) + '</b></a></li>').join('');

  return ''
    + '<header class="c-hero" id="c-top">'
    + '<p class="c-kick">GRABA OS v1.0 · Mostar</p>'
    + '<h1>Ahmed Grabus <span>(Graba)</span></h1>'
    + '<p class="c-role">' + esc(T.role) + '</p>'
    + '<p class="c-lead">' + esc(T.hero) + '</p>'
    + '<p class="c-cta"><a class="c-btn" href="#c-work">' + esc(T.nav.work) + '</a><a class="c-btn c-ghost" href="#c-contact">' + esc(T.contactK) + '</a></p>'
    + '</header>'
    + '<section class="c-sec" id="c-work" aria-labelledby="c-work-h"><p class="c-k">' + esc(T.workK) + '</p><h2 id="c-work-h">' + em(T.workH) + '</h2><ul class="c-grid">' + work + '</ul></section>'
    + '<section class="c-sec" id="c-services" aria-labelledby="c-serv-h"><p class="c-k">' + esc(T.servK) + '</p><h2 id="c-serv-h">' + em(T.servH) + '</h2><ul class="c-list">' + services + '</ul>'
    + '<h3 class="c-sub">' + em(T.procH) + '</h3><ol class="c-list c-steps">' + process + '</ol></section>'
    + '<section class="c-sec" id="c-stack" aria-labelledby="c-stack-h"><h2 id="c-stack-h" class="c-k c-k-h">' + esc(T.stackK) + '</h2><ul class="c-chips">' + stack + '</ul></section>'
    + '<section class="c-sec c-about" id="c-about" aria-labelledby="c-about-h"><p class="c-k">' + esc(T.aboutK) + '</p><h2 id="c-about-h">' + em(T.aboutH) + '</h2>'
    + T.aboutP.map((p) => '<p>' + esc(p) + '</p>').join('') + '<dl class="c-facts">' + facts + '</dl><p class="c-credit">' + creditHTML(PF, lang) + '</p></section>'
    + '<section class="c-sec c-contact" id="c-contact" aria-labelledby="c-contact-h"><p class="c-k">' + esc(T.contactK) + '</p><h2 id="c-contact-h">' + em(T.contactH) + '</h2><p>' + esc(T.contactP) + '</p>'
    + '<p><button type="button" class="c-mail" data-copy="' + C.email + '"><span>' + esc(C.email) + '</span><small>' + esc(T.copy) + '</small></button></p>'
    + '<ul class="c-channels">' + channels + '</ul></section>'
    + '<footer class="c-foot"><p>' + esc(T.foot) + ' © 2026</p><p>' + creditHTML(PF, lang) + '</p></footer>';
}
