/*
 * Obična verzija: četiri dijela (Radovi, Usluge, O meni, Kontakt) koji staju na jedan ekran.
 * Projekti se gledaju jedan po jedan (velika slika + sličice), bez dugog listanja.
 * Ista funkcija pravi HTML u browseru (promjena jezika) i u tools/staticno.mjs (statični HTML za Google).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const em = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
const ext = 'target="_blank" rel="noopener"';
const pad = (n) => String(n).padStart(2, '0');
// logo GRABA (slova pretvorena u putanju, bez dodatnog fonta)
const LOGO = '<svg class="d-logo" viewBox="91 -700 3426 712" aria-hidden="true"><path fill="currentColor" d="M344.1 12.0Q192.6 12.0 131.4 -77.2Q70.2 -166.4 102.1 -344.0Q123.7 -463.5 177.0 -542.4Q230.3 -621.2 312.3 -660.6Q394.4 -700.0 501.7 -700.0Q569.0 -700.0 622.9 -683.6Q676.9 -667.3 713.2 -634.8Q749.5 -602.3 763.8 -553.3Q778.0 -504.3 766.2 -439.0H566.3Q570.2 -460.6 565.8 -478.8Q561.4 -497.0 549.6 -510.1Q537.7 -523.2 519.4 -530.3Q501.2 -537.5 477.1 -537.5Q444.1 -537.5 418.0 -527.8Q391.9 -518.1 373.2 -498.8Q354.5 -479.5 342.3 -452.1Q330.0 -424.7 323.5 -388.6L307.5 -299.3Q298.8 -251.2 306.1 -218.1Q313.4 -184.9 338.6 -167.7Q363.9 -150.4 408.0 -150.4Q439.6 -150.4 465.8 -161.9Q491.9 -173.3 509.5 -193.8Q527.1 -214.3 531.7 -239.6L532.4 -244.0H404.6L429.8 -384.0H756.3L687.2 0.0H579.5L573.3 -66.7Q543.9 -42.3 509.4 -24.6Q474.9 -6.9 434.1 2.5Q393.3 12.0 344.1 12.0Z M804.2 0.0 928.1 -688.0H1301.6Q1378.6 -688.0 1422.0 -657.9Q1465.4 -627.8 1479.8 -578.5Q1494.2 -529.1 1483.8 -470.8Q1472.6 -408.6 1438.8 -358.3Q1405.1 -308.1 1352.3 -275.8L1419.0 0.0H1189.6L1144.5 -231.0H1054.8L1013.2 0.0ZM1081.9 -381.4H1201.2Q1226.6 -381.4 1245.2 -403.5Q1263.9 -425.6 1269.9 -459.0Q1273.7 -480.3 1270.1 -496.7Q1266.5 -513.2 1256.2 -523.2Q1245.9 -533.2 1228.5 -533.2H1109.2Z M1440.8 0.0 1779.6 -688.0H2036.3L2127.5 0.0H1906.4L1899.8 -98.2H1696.4L1654.8 0.0ZM1762.1 -251.6H1890.3L1883.4 -375.5Q1882.4 -386.5 1881.4 -402.9Q1880.5 -419.3 1879.8 -438.1Q1879.2 -457.0 1878.3 -475.5Q1877.4 -494.0 1876.6 -508.3H1868.3Q1861.6 -490.0 1852.2 -466.8Q1842.8 -443.6 1832.9 -419.8Q1823.1 -395.9 1813.6 -375.5Z M2197.2 0.0 2321.1 -688.0H2715.6Q2768.2 -688.0 2806.7 -667.2Q2845.2 -646.5 2863.3 -609.0Q2881.5 -571.5 2872.2 -519.9Q2863.6 -472.1 2842.8 -440.3Q2822.0 -408.4 2793.6 -389.0Q2765.2 -369.5 2732.9 -359.0L2732.2 -355.0Q2765.0 -346.0 2789.7 -327.0Q2814.3 -308.0 2825.3 -274.2Q2836.3 -240.5 2826.7 -187.4Q2816.6 -130.8 2782.3 -88.7Q2748.0 -46.6 2698.5 -23.3Q2649.0 0.0 2592.1 0.0ZM2433.7 -160.0H2563.9Q2585.0 -160.0 2600.9 -176.0Q2616.8 -192.0 2622.6 -224.0Q2625.3 -239.0 2621.5 -251.5Q2617.7 -264.0 2608.3 -271.0Q2598.8 -278.0 2585.1 -278.0H2455.0ZM2480.5 -420.0H2597.8Q2612.5 -420.0 2624.3 -427.5Q2636.0 -435.0 2644.4 -449.0Q2652.8 -463.0 2656.5 -484.0Q2660.5 -506.0 2649.6 -521.5Q2638.6 -537.0 2618.9 -537.0H2501.6Z M2830.8 0.0 3169.6 -688.0H3426.3L3517.5 0.0H3296.4L3289.8 -98.2H3086.4L3044.8 0.0ZM3152.1 -251.6H3280.3L3273.4 -375.5Q3272.4 -386.5 3271.4 -402.9Q3270.5 -419.3 3269.8 -438.1Q3269.2 -457.0 3268.3 -475.5Q3267.4 -494.0 3266.6 -508.3H3258.3Q3251.6 -490.0 3242.2 -466.8Q3232.8 -443.6 3222.9 -419.8Q3213.1 -395.9 3203.6 -375.5Z"/></svg>';

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
      + '<p class="s-links">' + links + '</p>'
      + '<button type="button" class="s-next" data-step="1"><span>' + esc(S.nextT) + '</span><b>' + esc(T.items[PF.work[(i + 1) % n].id][0]) + '</b><i aria-hidden="true">→</i></button></div></article>';
  }).join('');

  const thumbs = PF.work.map((w, i) => '<li><button type="button" data-p="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="' + esc(T.items[w.id][0]) + '">'
    + (w.img ? '<img src="' + w.img + '" alt="" width="160" height="90" loading="lazy" decoding="async">' : '<span class="s-art s-art-' + w.art + '"></span>')
    + '<span class="s-tcap">' + esc(T.items[w.id][0]) + '</span></button></li>').join('');

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
    // desktop: velika slika sobe sa laganim animacijama (iza menija)
    + '<div class="d-art" aria-hidden="true"><div class="d-img"></div><i class="d-aq"></i><i class="d-mon"></i><i class="d-glow d-g1"></i><i class="d-glow d-g2"></i>'
    + '<i class="d-sm d-sm1"></i><i class="d-sm d-sm2"></i><i class="d-sm d-sm3"></i><i class="d-sm d-sm4"></i>'
    + '<i class="d-sk d-sk1"></i><i class="d-sk d-sk2"></i><i class="d-sk d-sk3"></i><i class="d-sk d-sk4"></i></div><div class="d-dim" aria-hidden="true"></div>'
    + '<aside class="s-rail">'
    + '<p class="s-avail"><i aria-hidden="true"></i>' + esc(S.avail) + '</p>'
    + '<h1 class="s-name">Ahmed<br>Grabus</h1>'
    + '<p class="s-role">' + esc(T.role) + ' · ' + esc(S.place) + '</p>'
    + '<p class="s-intro">' + esc(T.hero) + '</p>'
    + '<p class="s-quick" aria-label="' + esc(S.quickT) + '">'
    + '<a href="' + C.viber + '"><i class="s-qi s-qi-viber" aria-hidden="true"></i>Viber</a>'
    + '<a href="' + C.whatsapp + '" ' + ext + '><i class="s-qi s-qi-wa" aria-hidden="true"></i>WhatsApp</a>'
    + '<button type="button" data-copy="' + C.email + '"><i class="s-qi s-qi-mail" aria-hidden="true"></i>Email</button></p>'
    + '<button type="button" class="s-room" data-room><b>' + esc(S.roomT) + '</b><i aria-hidden="true">→</i></button>'
    + '<nav class="s-nav" aria-label="' + esc(S.navLabel) + '">' + nav + '</nav>'
    + '<p class="d-brand">' + LOGO + '<span>Ahmed Grabus<br>' + esc(T.role) + '</span></p>'
    + '<p class="s-foot"><span class="s-time" data-time>Mostar</span><span>© 2026 Graba</span></p>'
    + '</aside>'
    + '<div class="s-stage">'
    + '<button type="button" class="s-close" data-close aria-label="' + esc(S.close) + '"><i aria-hidden="true"></i></button>'
    + '<section class="s-panel s-work on" id="work" data-panel="work" aria-labelledby="work-h">'
    + '<header class="s-ph"><p class="s-k">' + esc(T.workK) + '</p><h2 id="work-h">' + em(T.workH) + '</h2>'
    + '<p class="s-count" aria-live="polite"><b data-cur>01</b><span> / ' + pad(n) + '</span></p>'
    + '<p class="s-arrows"><button type="button" class="s-arr" data-step="-1" aria-label="' + esc(S.prev) + '">←</button><button type="button" class="s-arr" data-step="1" aria-label="' + esc(S.next) + '">→</button></p></header>'
    + '<div class="s-projs" data-projs>' + projects + '</div>'
    + '<p class="s-dots" aria-hidden="true">' + PF.work.map((w, i) => '<i' + (i === 0 ? ' class="on"' : '') + '></i>').join('') + '</p>'
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
