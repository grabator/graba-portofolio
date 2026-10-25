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
  initShow(el);
  initFx(el);
  onScroll();
}

/* "Uživo na mobitelu": telefon sam lista izabranu stranicu, traka na dugmetu pokazuje koliko je ostalo do sljedećeg projekta.
   Kad posjetilac sam lista ili dodirne ekran, automatika stane na par sekundi. Radi samo dok je dio na ekranu. */
let stopShow = null;
function initShow(el) {
  if (stopShow) stopShow();
  const sec = el.querySelector('#show');
  if (!sec) return;
  const scr = sec.querySelector('.g-dev-scr'), tabs = [...sec.querySelectorAll('.g-show-tabs button')];
  const imgs = [...scr.querySelectorAll('img')], infos = [...sec.querySelectorAll('.g-show-p')];
  const STAY = 9000, SPEED = 42; // ms po projektu, px u sekundi
  let cur = 0, t0 = 0, last = 0, held = 0, visible = false, raf = 0, y = 0;
  function pick(i, user) {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach((b, k) => { b.setAttribute('aria-selected', String(k === cur)); b.style.setProperty('--p', 0); });
    imgs.forEach((im, k) => { im.hidden = k !== cur; });
    infos.forEach((x, k) => { x.hidden = k !== cur; });
    scr.scrollTop = 0; y = 0; t0 = performance.now();
    if (user && held !== Infinity) held = performance.now() + 2500;
    const b = tabs[cur], bar = b.parentNode;
    if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: b.offsetLeft - 16, behavior: reduced.matches ? 'auto' : 'smooth' });
  }
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(64, now - (last || now)); last = now;
    if (!visible || reduced.matches) return;
    if (now < held) { t0 += dt; return; }
    y += SPEED * dt / 1000;
    if (y > scr.scrollHeight - scr.clientHeight) y = scr.scrollHeight - scr.clientHeight;
    scr.scrollTop = y;
    const p = (now - t0) / STAY;
    tabs[cur].style.setProperty('--p', Math.min(1, p).toFixed(3));
    if (p >= 1) pick(cur + 1);
  }
  const hold = () => { held = performance.now() + 4000; };
  // na dodir telefon ne prima listanje (da ne zarobi listanje stranice); dodir pauzira ili pusti automatiku
  if (matchMedia('(pointer: coarse)').matches) scr.addEventListener('click', () => { held = held > performance.now() ? 0 : Infinity; sec.classList.toggle('is-paused', held > 0); });
  else {
    scr.addEventListener('wheel', hold, { passive: true });
    scr.addEventListener('pointerdown', hold);
    scr.addEventListener('keydown', hold);
    scr.addEventListener('scroll', () => { if (performance.now() < held) y = scr.scrollTop; }, { passive: true });
  }
  sec.querySelector('.g-show-tabs').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) pick(+b.dataset.i, true); });
  const vio = new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) imgs.forEach((im) => { im.loading = 'eager'; }); }, { threshold: 0.25 });
  vio.observe(scr);
  pick(0);
  raf = requestAnimationFrame(tick);
  stopShow = () => { cancelAnimationFrame(raf); vio.disconnect(); stopShow = null; };
}

/* sitni efekti: telefon na vrhu se nagne prema mišu, svjetlo prati miš, brojevi se odbroje kad dođu na ekran */
function initFx(el) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hero = el.querySelector('.g-hero'), stage = el.querySelector('.g-stage');
  if (hero && stage && fine && !reduced.matches) {
    let rq = 0, mx = 0, my = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height;
      if (!rq) rq = requestAnimationFrame(() => {
        rq = 0;
        hero.style.setProperty('--mx', (mx * 100).toFixed(1) + '%'); hero.style.setProperty('--my', (my * 100).toFixed(1) + '%');
        stage.style.setProperty('--rx', ((0.5 - my) * 10).toFixed(2) + 'deg'); stage.style.setProperty('--ry', ((mx - 0.5) * 14).toFixed(2) + 'deg');
        stage.style.setProperty('--tx', ((mx - 0.5) * 18).toFixed(1) + 'px'); stage.style.setProperty('--ty', ((my - 0.5) * 14).toFixed(1) + 'px');
      });
    });
    hero.addEventListener('pointerleave', () => { ['--rx', '--ry', '--tx', '--ty'].forEach((k) => stage.style.removeProperty(k)); });
  }
  // kartice radova: blago nagnuće pod mišem
  if (fine && !reduced.matches) el.querySelectorAll('.g-card figure').forEach((f) => {
    f.addEventListener('pointermove', (e) => {
      const r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      f.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg)';
      f.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(0) + '%'); f.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(0) + '%');
    });
    f.addEventListener('pointerleave', () => { f.style.transform = ''; });
  });
  // brojevi (3 jezika, 28 slika...) se odbroje
  const nums = el.querySelectorAll('.g-res b[data-n]');
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const nio = new IntersectionObserver((en) => en.forEach((e) => {
      if (!e.isIntersecting) return;
      nio.unobserve(e.target);
      const b = e.target, n = +b.dataset.n, t0 = performance.now(), D = 1100;
      if (!(n > 1)) return;
      const step = (now) => { const k = Math.min(1, (now - t0) / D), v = Math.round(n * (1 - Math.pow(1 - k, 3))); b.textContent = v; if (k < 1) requestAnimationFrame(step); };
      b.textContent = '0'; requestAnimationFrame(step);
    }), { threshold: 0.6 });
    nums.forEach((b) => nio.observe(b));
  }
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
  const max = h.scrollHeight - window.innerHeight;
  h.style.setProperty('--g-p', max > 0 ? (y / max).toFixed(4) : 0);
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
