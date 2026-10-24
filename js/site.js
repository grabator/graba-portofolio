/*
 * Ponašanje obične verzije: dijelovi se blago pojave dok se lista, zaglavlje dobije pozadinu poslije vrha,
 * a donja traka (Viber, WhatsApp, Email) se na mobitelu pojavi kad se pređe prvi ekran.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let io = null, ticking = false;

export function initSite(el) {
  const items = el.querySelectorAll('.g-sec, .g-card, .g-res li, .g-serv li, .g-proc li, .g-why-l li');
  // filter radova: sve, stranice za biznise, aplikacije
  const filt = el.querySelector('.g-filt');
  if (filt) filt.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-f]');
    if (!b) return;
    const f = b.dataset.f;
    filt.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    el.querySelectorAll('.g-grid .g-card').forEach((c) => { c.hidden = f !== 'all' && c.dataset.cat !== f; if (!c.hidden) c.classList.add('in'); });
    el.querySelector('.g-grid').classList.toggle('is-filtered', f !== 'all');
  });
  if (io) io.disconnect();
  if (reduced.matches || !('IntersectionObserver' in window)) items.forEach((x) => x.classList.add('in'));
  else {
    io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach((x) => { x.classList.add('rv'); io.observe(x); });
  }
  initBuild(el);
  onScroll();
}

/* "Sastavi svoju stranicu": iz izbora složi poruku i link za WhatsApp */
function initBuild(el) {
  const sec = el.querySelector('#build');
  if (!sec) return;
  let D;
  try { D = JSON.parse(sec.dataset.build); } catch (e) { return; }
  const B = D.B, form = sec.querySelector('.g-build-q');
  const msgEl = sec.querySelector('#build-msg'), wa = sec.querySelector('#build-wa'), like = sec.querySelector('#build-like'), copy = sec.querySelector('#build-copy');
  const fill = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => o[k]);
  const label = (list, v) => (list.find((x) => x[0] === v) || [])[1] || '';
  // malo prvo slovo, osim imena (Google, Viber, WhatsApp)
  const lc = (s) => (/^(Google|Viber|WhatsApp)/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));
  let text = '';
  function update() {
    const biz = (form.querySelector('input[name=biz]:checked') || {}).value || 'other';
    const feats = [...form.querySelectorAll('input[name=feat]:checked')].map((x) => lc(label(B.feats, x.value)));
    const when = (form.querySelector('input[name=when]:checked') || {}).value || 'month';
    const lines = [fill(B.hi, { biz: B.bizW[biz] })];
    if (feats.length) lines.push(fill(B.need, { list: feats.join(', ') }));
    lines.push(fill(B.time, { when: lc(label(B.when, when)) }), B.end);
    text = lines.join('\n');
    msgEl.textContent = text;
    wa.href = D.wa + '?text=' + encodeURIComponent(text);
    const ex = D.items[(B.biz.find((x) => x[0] === biz) || [])[2]];
    like.innerHTML = '';
    if (ex) { const a = document.createElement('a'); a.href = ex[1]; a.target = '_blank'; a.rel = 'noopener'; a.textContent = B.like + ': ' + ex[0] + ' ↗'; like.appendChild(a); }
  }
  form.addEventListener('change', (e) => {
    // promjena vrste biznisa predloži uobičajene stvari za taj biznis
    if (e.target.name === 'biz') form.querySelectorAll('input[name=feat]').forEach((x) => { x.checked = (B.pre[e.target.value] || []).includes(x.value); });
    update();
  });
  copy.addEventListener('click', () => {
    const done = () => { copy.lastChild.textContent = B.copied; setTimeout(() => { copy.lastChild.textContent = B.copyMsg; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => {}); else done();
  });
  update();
}

function onScroll() {
  ticking = false;
  const y = window.scrollY, h = document.documentElement;
  h.classList.toggle('g-scrolled', y > 24);
  h.classList.toggle('g-past', y > window.innerHeight * 0.55);
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
