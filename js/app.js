/* Portfolio: crtanje sadržaja, jezik, animacije i robotić na prvom ekranu koji prati kursor. */
(function () {
  'use strict';
  var D = window.PF, C = D.contact, root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var lang = (function () {
    var q = (location.search.match(/[?&]lang=(en|bs)/) || [])[1], saved = null;
    try { saved = localStorage.getItem('graba-lang'); } catch (e) { /* privatni mod */ }
    var nav = (navigator.language || '').slice(0, 2);
    return q || saved || (['bs', 'hr', 'sr'].indexOf(nav) > -1 ? 'bs' : 'en');
  })();
  function T() { return D[lang]; }
  function get(path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, T()); }

  /* ---------------- naslovi koji izlaze riječ po riječ ---------------- */
  /* riječi između *zvjezdica* su naglašene ljubičastom */
  function split(el, text) {
    var hot = false;
    el.innerHTML = text.split(' ').map(function (w, i) {
      var start = w.charAt(0) === '*', end = w.slice(-1) === '*';
      if (start) hot = true;
      var h = esc(w.replace(/\*/g, '')), out = '<span class="w"><span style="--i:' + i + '">' + (hot ? '<em>' + h + '</em>' : h) + '</span></span>';
      if (end) hot = false;
      return out;
    }).join(' ');
  }
  function plain(text) { return String(text).replace(/\*/g, ''); }

  /* ---------------- naslovne slike za projekte bez screenshota ---------------- */
  var ART = {
    pitch: '<svg viewBox="0 0 640 360" aria-hidden="true"><rect width="640" height="360" fill="#14321f"/><g fill="#1a3d27"><rect x="0" width="80" height="360"/><rect x="160" width="80" height="360"/><rect x="320" width="80" height="360"/><rect x="480" width="80" height="360"/></g><g fill="none" stroke="#e8f5e9" stroke-opacity=".55" stroke-width="2"><rect x="30" y="24" width="580" height="312"/><path d="M320 24V336"/><circle cx="320" cy="180" r="48"/><rect x="30" y="110" width="70" height="140"/><rect x="540" y="110" width="70" height="140"/></g><g font-family="Inter Tight,Arial" font-weight="600"><rect x="404" y="70" width="168" height="74" rx="14" fill="#0e0e10"/><text x="420" y="98" font-size="13" fill="#a996ff">CAPTAIN PICK</text><text x="420" y="128" font-size="26" fill="#f3f1ec">9.4 pts</text><rect x="70" y="214" width="190" height="74" rx="14" fill="#f3f1ec"/><text x="86" y="242" font-size="13" fill="#5f5e5a">PREDICTED</text><text x="86" y="272" font-size="26" fill="#0e0e10">+38 next GW</text></g><g fill="#6d4aff"><circle cx="238" cy="150" r="9"/><circle cx="300" cy="96" r="9"/><circle cx="360" cy="230" r="9"/><circle cx="430" cy="190" r="9"/></g></svg>',
    floor: '<svg viewBox="0 0 640 360" aria-hidden="true"><rect width="640" height="360" fill="#1b1714"/><rect x="40" y="36" width="560" height="288" rx="18" fill="#26201c" stroke="#3a312b" stroke-width="2"/><g fill="#3a312b"><rect x="70" y="66" width="150" height="34" rx="10"/></g><g font-family="Inter Tight,Arial" font-weight="600" font-size="13"><g fill="#c9a36a"><circle cx="300" cy="120" r="30"/><circle cx="420" cy="120" r="30"/><rect x="480" y="200" width="90" height="56" rx="12"/></g><g fill="#6d4aff"><circle cx="300" cy="240" r="30"/></g><g fill="#5a4a3e"><circle cx="160" cy="200" r="30"/><circle cx="420" cy="240" r="30"/></g><text x="291" y="125" fill="#1b1714">T1</text><text x="411" y="125" fill="#1b1714">T2</text><text x="290" y="245" fill="#fff">T5</text><text x="507" y="233" fill="#1b1714">VIP</text><text x="78" y="88" fill="#f3e6d2">Bar</text></g><rect x="250" y="290" width="200" height="40" rx="20" fill="#f3f1ec"/><text x="272" y="315" font-family="Inter Tight,Arial" font-weight="600" font-size="14" fill="#0e0e10">Reserve table 5 · 21:00</text></svg>',
    map: '<svg viewBox="0 0 640 360" aria-hidden="true"><rect width="640" height="360" fill="#e7f0ec"/><g fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"><path d="M-20 250 C140 220 260 290 400 230 S600 150 680 170"/><path d="M180 -20 C210 120 160 220 230 380"/></g><g fill="none" stroke="#fff" stroke-width="6"><path d="M-20 120 H660 M460 -20 V380"/></g><path d="M0 330 C120 300 200 340 320 320 S540 280 640 300 V360 H0Z" fill="#b9d8e3"/><g><circle cx="330" cy="170" r="70" fill="#0d8a5f" opacity=".12"/><path d="M330 120c-18 0-30 14-30 30 0 24 30 52 30 52s30-28 30-52c0-16-12-30-30-30z" fill="#0d8a5f"/><path d="M322 150h16M330 142v16" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g><g fill="#5f5e5a" opacity=".5"><circle cx="170" cy="110" r="10"/><circle cx="520" cy="230" r="10"/><circle cx="460" cy="90" r="10"/></g><rect x="40" y="36" width="200" height="64" rx="16" fill="#fff"/><text x="58" y="62" font-family="Inter Tight,Arial" font-weight="600" font-size="14" fill="#0e0e10">Ljekarna Centar</text><text x="58" y="84" font-family="Inter Tight,Arial" font-size="13" fill="#0d8a5f">On duty now · 650 m</text></svg>'
  };
  function cover(w) { return w.img ? '<img src="' + esc(w.img) + '" alt="" loading="lazy" decoding="async">' : (ART[w.art] || ''); }

  /* ---------------- crtanje teksta ---------------- */
  function render() {
    var t = T();
    root.lang = lang;
    document.title = t.title;
    var md = $('meta[name="description"]'); if (md) md.setAttribute('content', t.desc);
    $$('[data-t]').forEach(function (el) { var v = get(el.getAttribute('data-t')); if (typeof v === 'string') { if (el.classList.contains('split')) split(el, v); else el.textContent = plain(v); } });
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    $('.burger').setAttribute('aria-label', t.menu);

    var navHtml = ['work', 'services', 'process', 'about'].map(function (k) { return '<a href="#' + k + '">' + esc(t.nav[k]) + '</a>'; });
    $('.links').innerHTML = '<span class="blob" aria-hidden="true"></span>' + navHtml.join('');
    var ic = { call: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>', viber: '<path d="M7.5 19.5 4 21l1.2-3.6A8.5 8.5 0 1 1 7.5 19.5Z"/><path d="M9.5 9.5c.5 2 2 3.5 4 4"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>' };
    function svg(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ic[k] + '</svg>'; }
    $('#sheet').innerHTML = '<p class="kicker sheet-k">' + esc(t.menu) + '</p><ul class="sheet-list">' +
      ['work', 'services', 'process', 'about', 'contact'].map(function (k, i) { return '<li><a href="#' + k + '"' + (k === 'contact' ? ' class="main"' : '') + ' style="--k:' + i + '"><b>0' + (i + 1) + '</b><span>' + esc(k === 'contact' ? t.touch : t.nav[k]) + '</span><i aria-hidden="true">' + (k === 'contact' ? '↗' : '→') + '</i></a></li>'; }).join('') +
      '</ul><div class="sheet-foot"><p>' + esc(t.sheetP) + '</p><div><a href="tel:' + esc(C.tel) + '">' + svg('call') + esc(t.phone) + '</a><a href="' + esc(C.viber) + '">' + svg('viber') + 'Viber</a><a href="mailto:' + esc(C.email) + '">' + svg('mail') + 'Email</a></div></div>';

    var copyIc = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
    var links = ['#work', '#contact', 'tel:' + C.tel, C.viber];
    $('.pills').innerHTML = t.pills.map(function (p, i) { return '<a class="pill' + (i === 0 ? ' main' : '') + '" href="' + esc(links[i]) + '" style="--k:' + i + '">' + esc(p) + '</a>'; }).join('') +
      '<button type="button" class="pill line" style="--k:4" data-copy aria-label="' + esc(t.reach + ' ' + C.email + ', ' + t.copy) + '">' + esc(t.reach) + ' <u>' + esc(C.email) + '</u>' + copyIc + '</button>';

    $('.work').innerHTML = D.work.map(function (w, i) {
      var it = t.items[w.id];
      return '<li class="job reveal" data-i="' + i + '">' +
        '<div class="job-row" role="button" tabindex="0" aria-expanded="false" aria-controls="job-' + i + '"><span class="job-n">' + (i < 9 ? '0' : '') + (i + 1) + '</span><h3 class="job-t">' + esc(it[0]) + '</h3><span class="job-k">' + esc(it[1]) + (w.live ? '<span class="live">' + esc(t.liveTag) + '</span>' : '') + '</span><span class="job-y">' + esc(w.year) + '</span></div>' +
        '<div class="job-body" id="job-' + i + '"><a class="job-img" href="' + esc(w.live || w.src) + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' + cover(w) + '</a>' +
        '<p class="job-p">' + esc(it[2]) + '</p><ul class="tags">' + w.tags.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul>' +
        '<p class="job-links">' + (w.live ? '<a href="' + esc(w.live) + '" target="_blank" rel="noopener">' + esc(t.live) + ' ↗</a>' : '') + '<a href="' + esc(w.src) + '" target="_blank" rel="noopener">' + esc(t.code) + ' ↗</a></p></div></li>';
    }).join('');
    openJob(0, true);

    $('.services').innerHTML = t.services.map(function (s, i) { return '<li class="service reveal" style="--d:' + i + '"><b>0' + (i + 1) + '</b><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p></li>'; }).join('');
    $('.steps').innerHTML = t.process.map(function (s, i) { return '<li class="step reveal" style="--d:' + i + '"><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p><span class="bar"><i></i></span></li>'; }).join('');
    var chips = D.stack.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
    $('.mq-track').innerHTML = chips + chips.replace(/<span>/g, '<span aria-hidden="true">');
    $('.about-p').innerHTML = t.aboutP.map(function (p) { return '<p class="reveal">' + esc(p) + '</p>'; }).join('');
    $('.facts').innerHTML = t.facts.map(function (f, i) { return '<div class="reveal" style="--d:' + i + '"><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('');
    $('.mail-addr').textContent = C.email;
    $('.mail').setAttribute('aria-label', t.copy + ': ' + C.email);
    $('.channels').innerHTML = [
      ['email', C.email, 'mailto:' + C.email], ['phone', C.phone, 'tel:' + C.tel], ['viber', C.phone, C.viber], ['whatsapp', C.phone, C.whatsapp], ['github', 'github.com/grabator', C.github]
    ].map(function (c) { return '<li><a href="' + esc(c[2]) + '"' + (/^https/.test(c[2]) ? ' target="_blank" rel="noopener"' : '') + '><span>' + esc(t[c[0]]) + '</span><b>' + esc(c[1]) + '</b></a></li>'; }).join('');
    $('.year').textContent = '© ' + new Date().getFullYear();
    $('.scrub-hint [data-t]').textContent = fine ? t.scrub : t.tapBot;
    $('.totop').setAttribute('aria-label', t.top);
    reveal();
    startType();
    curSec = null; requestAnimationFrame(onScroll);
    cars();
  }

  /* ---------------- pisaća mašina ---------------- */
  var typeTimer = null;
  function startType() {
    var el = $('.typed'), caret = $('.caret'), text = T().type, n = 0;
    clearTimeout(typeTimer); clearInterval(typeTimer);
    caret.classList.remove('done');
    if (reduced) { el.textContent = text; caret.classList.add('done'); return; }
    if (bot) bot.talk(false);
    el.textContent = '';
    typeTimer = setTimeout(function () {
      if (bot) bot.talk(true);
      typeTimer = setInterval(function () {
        n++; el.textContent = text.slice(0, n);
        if (n >= text.length) { clearInterval(typeTimer); caret.classList.add('done'); if (bot) bot.talk(false); }
      }, 34);
    }, 600);
  }
  setTimeout(function () { $('.pills').classList.add('in'); }, 400);

  /* ---------------- radovi: otvaranje i slika koja prati miš ---------------- */
  function openJob(i, quiet) {
    if (peek && peekOn) { peekOn = false; peek.classList.remove('on'); }
    $$('.job').forEach(function (j) {
      var on = Number(j.getAttribute('data-i')) === i && !(j.classList.contains('open') && !quiet);
      j.classList.toggle('open', on);
      $('.job-row', j).setAttribute('aria-expanded', String(on));
    });
  }
  var peek = $('.peek'), peekIn = $('.peek-in'), px = 0, py = 0, tx = 0, ty = 0, peekOn = false, peekRaf = 0;
  function peekLoop() {
    px += (tx - px) * 0.16; py += (ty - py) * 0.16;
    peek.style.transform = 'translate3d(' + (px - 190).toFixed(1) + 'px,' + (py - 120).toFixed(1) + 'px,0) scale(' + (peekOn ? 1 : 0.85) + ') rotate(' + ((tx - px) * 0.04).toFixed(2) + 'deg)';
    if (peekOn || Math.abs(tx - px) > 0.5) peekRaf = requestAnimationFrame(peekLoop); else peekRaf = 0;
  }
  if (fine) {
    document.addEventListener('mousemove', function (e) {
      var row = e.target.closest && e.target.closest('.job-row');
      if (row && row.parentNode.classList.contains('open')) row = null;
      tx = e.clientX + 30; ty = e.clientY;
      if (row) {
        var w = D.work[Number(row.parentNode.getAttribute('data-i'))];
        if (peek.__id !== w.id) { peek.__id = w.id; peekIn.innerHTML = cover(w); }
        if (!peekOn) { peekOn = true; px = tx; py = ty; peek.classList.add('on'); }
      } else if (peekOn) { peekOn = false; peek.classList.remove('on'); }
      if (!peekRaf && peekOn) peekRaf = requestAnimationFrame(peekLoop);
    }, { passive: true });
  }

  /* ---------------- pojavljivanje ---------------- */
  var io = null;
  function reveal() {
    var els = $$('.reveal, .split');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    if (io) io.disconnect();
    io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------- kopiranje emaila ---------------- */
  var toastT = 0;
  function toast(msg) { var el = $('.toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('on'); }, 2200); }
  function copy() {
    var done = function () { toast(T().copied); bot.cheer(T().copied); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(C.email).then(done, function () { location.href = 'mailto:' + C.email; });
    else location.href = 'mailto:' + C.email;
  }

  /* ---------------- događaji ---------------- */
  var sheet = $('#sheet'), burger = $('.burger');
  function menu(open) { sheet.classList.toggle('open', open); sheet.setAttribute('aria-hidden', String(!open)); sheet.inert = !open; burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? T().close : T().menu); document.body.style.overflow = open ? 'hidden' : ''; }
  document.addEventListener('click', function (e) {
    var b;
    if ((b = e.target.closest('[data-lang]'))) { lang = b.getAttribute('data-lang'); try { localStorage.setItem('graba-lang', lang); } catch (x) { /* privatni mod */ } render(); return; }
    if (e.target.closest('[data-copy]')) { copy(); return; }
    if (e.target.closest('.burger')) { menu(!sheet.classList.contains('open')); return; }
    if (e.target.closest('#sheet a')) { menu(false); return; }
    if ((b = e.target.closest('.job-row')) && window.innerWidth >= 900) { openJob(Number(b.parentNode.getAttribute('data-i'))); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.classList.contains('open')) { menu(false); burger.focus(); }
    var row = e.target.closest && e.target.closest('.job-row');
    if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openJob(Number(row.parentNode.getAttribute('data-i'))); }
  });

  /* traka napretka, čvrsta navigacija i aktivni link */
  /* klizni "blob" iza aktivnog linka u meniju */
  var curSec = null;
  function blobTo(a) {
    var blob = $('.links .blob'); if (!blob) return;
    if (!a) { blob.style.opacity = '0'; return; }
    blob.style.opacity = '1'; blob.style.width = a.offsetWidth + 'px'; blob.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }
  document.addEventListener('mouseover', function (e) {
    var a = e.target.closest && e.target.closest('.links a');
    if (a) blobTo(a); else if (e.target.closest && !e.target.closest('.links')) blobTo($('.links a.on'));
  });
  var ring = $('.totop .fill'), totop = $('.totop'), nav = $('#nav'), ticking = false, secs = ['work', 'services', 'process', 'about', 'contact'];
  function onScroll() {
    ticking = false;
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    ring.style.strokeDashoffset = (132 * (1 - (max > 0 ? Math.min(1, y / max) : 0))).toFixed(1);
    totop.classList.toggle('on', y > window.innerHeight * 0.6);
    nav.classList.toggle('solid', y > 30);
    var cur = '';
    secs.forEach(function (id) { var s = document.getElementById(id); if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = id; });
    if (cur !== curSec) { curSec = cur; $$('.links a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); }); blobTo($('.links a.on')); }
    bot.scroll(y);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* ---------------- robotić (prvi ekran) ----------------
   * Glava se okreće u 3D prema kursoru, lice se pomjera unutar ekrana, antena se njiše.
   * Zna i trikove: skok, okret, srca u očima, kod na ekranu, namigivanje.
   * Kad ga dugo niko ne dira zaspe, a ako brzo tresete mišem, zavrti mu se. */
  var bot = (function () {
    var el = $('.bot'), api = { scroll: function () {}, wake: function () {}, talk: function () {}, cheer: function () {}, hint: function () {} };
    if (!el) return api;
    var head = $('.bot-head', el), face = $('.bot-face', el), disc = $('.bot-disc', el), shadow = $('.bot-shadow', el), neck = $('.bot-neck', el), stick = $('.stick', el), bubble = $('.bubble', el);
    var W = 0, cx = 0, cy = 0, mx = -1, my = -1, lastMove = -1e9, lastAct = performance.now(), sy = 0;
    var lx = 0, ly = 0, tx = 0, ty = 0, plx = 0, ang = 0, angV = 0, jumpT = -1e9, spinT = -1e9, wobT = -1e9, wanderAt = 0, raf = 0, visible = true;
    var mood = '', moodT = 0, sleeping = false;
    function measure() { var r = el.getBoundingClientRect(); W = r.width; cx = r.left + r.width * 0.5; cy = r.top + window.scrollY + r.height * 0.48; }
    function clamp(v, a) { return v < -a ? -a : v > a ? a : v; }
    function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

    /* raspoloženja: happy, hearts, code, wink, dizzy (privremeno) */
    function setMood(m, ms) {
      if (mood) el.classList.remove(mood);
      mood = m; if (m) el.classList.add(m);
      clearTimeout(moodT);
      if (m && ms) moodT = setTimeout(function () { el.classList.remove(m); mood = ''; }, ms);
    }
    var burst = $('.burst', el);
    function pop() { burst.classList.remove('go'); void burst.offsetWidth; burst.classList.add('go'); }

    var sayT = 0;
    function say(text, ms) { bubble.textContent = text; bubble.classList.add('on'); clearTimeout(sayT); sayT = setTimeout(function () { bubble.classList.remove('on'); }, ms || 2400); }

    function sleep(on) {
      if (sleeping === on) return;
      sleeping = on; el.classList.toggle('sleep', on);
      if (!on) { jumpT = performance.now(); say(T().bot.wake, 1800); }
    }
    function act() { lastAct = performance.now(); if (sleeping) sleep(false); }

    function frame(now) {
      raf = 0;
      if (!reduced && !sleeping && now - lastAct > 16000) sleep(true);
      var idle = now - lastMove > 3200;
      if (sleeping) { tx = 0; ty = 0.75; }
      else if (!idle && mx >= 0) {
        tx = clamp((mx - cx) / (window.innerWidth * 0.42), 1);
        ty = clamp((my - (cy - window.scrollY)) / (window.innerHeight * 0.48), 1);
      } else if (now > wanderAt) {
        tx = Math.random() * 1.6 - 0.8; ty = Math.random() * 1 - 0.45;
        wanderAt = now + 1300 + Math.random() * 1900;
      }
      var tty = clamp(ty + (sleeping ? 0 : sy * 0.9), 1);
      var k = reduced ? 1 : sleeping ? 0.03 : 0.085;
      lx += (tx - lx) * k; ly += (tty - ly) * k;
      var u = W / 100, fl = reduced ? 0 : Math.sin(now / (sleeping ? 1600 : 950)) * (sleeping ? 0.5 : 0.9);
      var jt = now - jumpT, jump = jt < 900 ? -Math.abs(Math.sin(jt / 120)) * 4 * Math.exp(-jt / 260) : 0;
      var st = now - spinT, spin = st < 1000 ? ease(st / 1000) * 360 : 0;
      var wt = now - wobT, wob = wt < 1600 ? Math.sin(wt / 70) * 9 * (1 - wt / 1600) : 0;
      var y = ly * 1.6 + fl + jump;
      head.style.transform = 'translate3d(' + (lx * 2.4 * u).toFixed(2) + 'px,' + (y * u).toFixed(2) + 'px,0) rotateY(' + (lx * 30 + spin).toFixed(2) + 'deg) rotateX(' + (-ly * 22).toFixed(2) + 'deg) rotateZ(' + (wob + (sleeping ? 6 : 0) * Math.min(1, ly)).toFixed(2) + 'deg)';
      face.style.transform = 'translate3d(' + (lx * 3.6 * u).toFixed(2) + 'px,' + (ly * 2.8 * u).toFixed(2) + 'px,0)';
      shadow.style.transform = 'translate3d(' + ((1.5 - lx * 2.6) * u).toFixed(2) + 'px,' + ((3.2 - ly * 1.4 + (fl + jump) * 0.4) * u).toFixed(2) + 'px,0) scale(' + (1 - jump * 0.02).toFixed(3) + ')';
      disc.style.transform = 'translate3d(' + (-lx * 1.4 * u).toFixed(2) + 'px,' + (-ly * u).toFixed(2) + 'px,0)';
      neck.style.transform = 'translate3d(' + (lx * 0.84 * u).toFixed(2) + 'px,' + ((fl + jump) * 0.35 * u).toFixed(2) + 'px,0)';
      if (!reduced) {
        angV += -ang * 0.07 - (lx - plx) * 120 - (jt < 900 ? Math.cos(jt / 120) * 0.8 * Math.exp(-jt / 260) : 0) - (st < 1000 ? Math.sin(st / 160) * 1.2 : 0);
        angV *= 0.84; ang = clamp(ang + angV, 38);
      }
      plx = lx;
      stick.style.transform = 'rotate(' + (ang + (reduced ? 0 : Math.sin(now / 1400) * 3) + wob * 1.5).toFixed(2) + 'deg)';
      if (visible && !document.hidden && (!reduced || Math.abs(tx - lx) + Math.abs(tty - ly) > 0.002)) raf = requestAnimationFrame(frame);
    }
    api.wake = function () { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
    api.scroll = function (y) { sy = Math.min(1, y / (window.innerHeight * 0.7)); act(); };
    api.talk = function (on) { el.classList.toggle('talk', on); };
    api.cheer = function (text) { act(); setMood('happy', 1500); pop(); jumpT = performance.now(); say(text, 1800); api.wake(); };
    api.hint = function (i) { if (sleeping || !visible) return; var h = T().bot.pills[i]; if (h) say(h, 2000); if (i === 1) setMood('hearts', 1600); };

    /* treptanje */
    (function blink() {
      setTimeout(function () {
        if (!reduced && visible && !sleeping) {
          el.classList.add('blink');
          setTimeout(function () { el.classList.remove('blink'); }, 130);
          if (Math.random() < 0.22) setTimeout(function () { el.classList.add('blink'); setTimeout(function () { el.classList.remove('blink'); }, 120); }, 260);
        }
        blink();
      }, 2200 + Math.random() * 3200);
    })();
    setTimeout(function () { say(T().bot.hi, 2800); }, 1500);

    /* klik: svaki put drugi trik */
    var trick = 0;
    var tricks = [
      function (b) { setMood('happy', 1500); pop(); jumpT = performance.now(); say(b.tricks[0]); },
      function (b) { setMood('happy', 1100); spinT = performance.now(); say(b.tricks[1], 1600); },
      function (b) { setMood('hearts', 1800); pop(); say(b.tricks[2]); },
      function (b) { setMood('code', 1900); say(b.tricks[3], 1900); },
      function (b) { setMood('wink', 1100); jumpT = performance.now(); say(b.tricks[4]); }
    ];
    el.addEventListener('click', function () { act(); tricks[trick](T().bot); trick = (trick + 1) % tricks.length; api.wake(); });

    /* praćenje kursora; brzo tresenje mišem = vrtoglavica */
    var flips = [], pdx = 0, dizzyUntil = 0;
    window.addEventListener('pointermove', function (e) {
      act();
      if (e.pointerType !== 'mouse') return;
      var now = performance.now(), dx = e.clientX - (mx < 0 ? e.clientX : mx);
      if (Math.abs(dx) > 6) {
        if (pdx && (dx > 0) !== (pdx > 0)) { flips.push(now); flips = flips.filter(function (t) { return now - t < 1000; }); }
        pdx = dx;
      }
      if (flips.length >= 7 && now > dizzyUntil && visible) { flips = []; dizzyUntil = now + 4000; setMood('dizzy', 1800); wobT = now; say(T().bot.dizzy, 1800); }
      mx = e.clientX; my = e.clientY; lastMove = now; api.wake();
    }, { passive: true });
    window.addEventListener('pointerdown', function (e) { act(); mx = e.clientX; my = e.clientY; lastMove = performance.now(); api.wake(); }, { passive: true });
    window.addEventListener('keydown', act);
    document.addEventListener('mouseleave', function () { lastMove = -1e9; });
    document.addEventListener('pointerover', function (e) { el.classList.toggle('excited', !!(e.target.closest && e.target.closest('a, button, [role="button"]'))); });

    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) act(); api.wake(); }).observe(el);
    document.addEventListener('visibilitychange', api.wake);
    window.addEventListener('resize', function () { measure(); api.wake(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();
    return api;
  })();

  /* hover na dugmad na prvom ekranu: robotić komentariše */
  document.addEventListener('pointerover', function (e) {
    var p = e.target.closest && e.target.closest('.pills > *');
    if (p && e.pointerType === 'mouse' && p !== lastPill) bot.hint(Number(p.style.getPropertyValue('--k')));
    lastPill = p;
  });
  var lastPill = null;

  /* ---------------- listanje usluga i koraka na mobitelu ---------------- */
  function cars() {
    $$('.car-ui').forEach(function (ui) {
      var list = $('.' + ui.getAttribute('data-car')), items = list.children, n = items.length;
      ui.innerHTML = '<div class="dots">' + [].map.call(items, function (x, i) { return '<button type="button" aria-label="' + (i + 1) + ' / ' + n + '"></button>'; }).join('') + '</div><span class="swipe" aria-hidden="true">' + esc(T().swipe) + ' <i>→</i></span>';
      var dots = $$('.dots button', ui);
      function at() { var w = items[0].offsetWidth + 12; return Math.max(0, Math.min(n - 1, Math.round(list.scrollLeft / w))); }
      function mark() { var i = at(); dots.forEach(function (d, j) { d.classList.toggle('on', j === i); d.setAttribute('aria-current', String(j === i)); }); ui.classList.toggle('end', i === n - 1); }
      dots.forEach(function (d, i) { d.addEventListener('click', function () { list.scrollTo({ left: items[i].offsetLeft - items[0].offsetLeft, behavior: 'smooth' }); }); });
      if (!list.__car) {
        list.__car = true;
        var t = false;
        list.addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(function () { t = false; list.__mark(); }); } }, { passive: true });
        /* kad se prvi put pojavi, lagano "povuče" karticu da se vidi da se lista */
        if (!reduced && 'IntersectionObserver' in window) {
          var o = new IntersectionObserver(function (en) {
            if (!en[0].isIntersecting || list.scrollWidth <= list.clientWidth + 4) return;
            o.disconnect();
            setTimeout(function () { if (list.scrollLeft < 4) { list.scrollTo({ left: 70, behavior: 'smooth' }); setTimeout(function () { list.scrollTo({ left: 0, behavior: 'smooth' }); }, 650); } }, 500);
          }, { threshold: 0.6 });
          o.observe(list);
        }
      }
      list.__mark = mark;
      mark();
    });
  }
  window.addEventListener('resize', function () { $$('.car-ui').forEach(function (ui) { var l = $('.' + ui.getAttribute('data-car')); if (l.__mark) l.__mark(); }); });

  /* dugme sa emailom se lagano "lijepi" za kursor */
  (function () {
    var m = $('.mail');
    if (!fine || reduced || !m) return;
    m.addEventListener('mousemove', function (e) { var r = m.getBoundingClientRect(); m.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)'; });
    m.addEventListener('mouseleave', function () { m.style.transform = ''; });
  })();

  render();
  onScroll();
  bot.wake();
})();
