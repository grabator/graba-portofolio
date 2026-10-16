/*
 * Radovi kao šetnja Kujundžilukom u Mostaru: svaki dućan je jedan projekat, a na kraju ulice je Stari most.
 * Stranica se lista normalno (gore-dole), a ulica se pri tome pomjera ulijevo, kao da se hoda. Dućan na sredini
 * ekrana otvori kepence, a dodir na dućan otvori karticu sa projektom. Kako se ide prema mostu, pada veče:
 * nebo se mijenja, pale se fenjeri i izlozi.
 * Sve je nacrtano u kodu (HTML, CSS i SVG). U petlji se mijenjaju samo transform i opacity.
 */
(function () {
  'use strict';
  var D = window.PF;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function rich(s) { return esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>'); }

  /* zanat svakog dućana: boja kepenaka, nijansa kamena i ikonica robe na tezgi */
  var SHOP = {
    myshishapedia: { shut: '#7a4a2a', wall: '#dccbb0', ico: 'hookah' },
    squadjury: { shut: '#3d5a3a', wall: '#d3c2a5', ico: 'ball' },
    salon: { shut: '#8c3f4a', wall: '#e2d4bd', ico: 'polish' },
    lounge: { shut: '#2f4a66', wall: '#d6c6aa', ico: 'coffee' },
    svecana: { shut: '#6e5a2c', wall: '#e0d1b6', ico: 'rings' },
    planinka: { shut: '#4b5d34', wall: '#d2bf9f', ico: 'cabin' },
    grabpoints: { shut: '#5a3b6e', wall: '#dacab0', ico: 'chart' },
    apoteke: { shut: '#2e6158', wall: '#ded0b8', ico: 'cross' }
  };
  var ICO = {
    hookah: '<path d="M24 6v6M18 12h12l-2 6h-8zM24 18v14M17 32h14l3 8c0 4-5 6-10 6s-10-2-10-6zM31 24c6 0 9 4 9 10"/>',
    ball: '<circle cx="24" cy="26" r="15"/><path d="M24 17l6 4-2 7h-8l-2-7zM24 17v-6M30 21l8-3M28 28l5 7M20 28l-5 7M18 21l-8-3"/>',
    polish: '<path d="M19 18h10v-8h-10zM16 18h16v22a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z"/><path d="M20 26h8" opacity=".6"/>',
    coffee: '<path d="M10 22h20v8a10 10 0 0 1-20 0zM30 24h3a4 4 0 0 1 0 8h-4M14 16c0-3 3-3 3-6M21 16c0-3 3-3 3-6"/><path d="M8 42h28"/>',
    rings: '<circle cx="19" cy="28" r="9"/><circle cx="29" cy="28" r="9"/><path d="M29 15l3-4h-6z"/>',
    cabin: '<path d="M6 40l18-24 18 24zM18 40v-9h12v9M14 26l-4-5M34 26l4-5"/><path d="M33 12v6"/>',
    chart: '<path d="M8 40h32M12 40V28M20 40V20M28 40V24M36 40V12"/><path d="M12 24l8-8 8 4 8-10"/>',
    cross: '<path d="M19 8h10v11h11v10H29v11H19V29H8V19h11z"/>'
  };
  function icon(k) { return '<svg class="shop-ico" viewBox="0 0 48 48" aria-hidden="true">' + (ICO[k] || '') + '</svg>'; }

  /* ---------- crteži pozadine ---------- */
  /* planine iznad grada (Hum i Velež), dva grebena */
  function hills(w, h) {
    function ridge(seed, base, amp, step) {
      var d = 'M0 ' + h, x = 0, y;
      while (x <= w + step) {
        y = base + Math.sin(x * 0.004 + seed) * amp + Math.sin(x * 0.011 + seed * 2) * amp * 0.45 + Math.sin(x * 0.027 + seed) * amp * 0.12;
        d += ' L' + x.toFixed(0) + ' ' + y.toFixed(1); x += step;
      }
      return d + ' L' + (w + step) + ' ' + h + 'Z';
    }
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" preserveAspectRatio="none">' +
      '<path class="hill-a" d="' + ridge(1.3, h * 0.42, h * 0.16, 24) + '"/>' +
      '<path class="hill-b" d="' + ridge(4.1, h * 0.6, h * 0.1, 20) + '"/></svg>';
  }
  /* kuće iza ulice: kameni krovovi, minareti i čempresi */
  function town(w, h) {
    var out = '', x = -40, i = 0;
    while (x < w) {
      var hw = 70 + ((i * 37) % 60), hh = 60 + ((i * 53) % 70), top = h - hh;
      out += '<path class="t-house" d="M' + x + ' ' + h + 'V' + top + 'h' + hw + 'V' + h + 'Z"/>';
      out += '<path class="t-roof" d="M' + (x - 8) + ' ' + top + 'L' + (x + hw / 2) + ' ' + (top - hw * 0.42) + 'L' + (x + hw + 8) + ' ' + top + 'Z"/>';
      for (var k = 0; k < 2; k++) out += '<rect class="t-win" x="' + (x + 14 + k * (hw - 40)) + '" y="' + (top + 18) + '" width="12" height="16" rx="6"/>';
      if (i % 5 === 2) {
        var mx = x + hw + 22;
        out += '<path class="t-min" d="M' + (mx - 7) + ' ' + h + 'V' + (h - 230) + 'h14V' + h + 'Z M' + (mx - 11) + ' ' + (h - 170) + 'h22v6h-22z M' + (mx - 7) + ' ' + (h - 230) + 'L' + mx + ' ' + (h - 290) + 'L' + (mx + 7) + ' ' + (h - 230) + 'Z"/>';
        out += '<path class="t-dome" d="M' + (mx + 18) + ' ' + h + 'v-50h70v50z M' + (mx + 18) + ' ' + (h - 50) + 'a35 35 0 0 1 70 0z"/>';
        x += 110;
      }
      if (i % 4 === 1) out += '<path class="t-tree" d="M' + (x + hw + 10) + ' ' + h + 'c-10-40-6-110 0-140c6 30 10 100 0 140z"/>';
      x += hw + 26; i++;
    }
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" preserveAspectRatio="none">' + out + '</svg>';
  }
  /* Stari most: Halebija lijevo, Tara desno, luk preko Neretve; skakač na ogradi */
  function bridge(mob) {
    // na mobitelu je kadar uži (zumirano na luk i kule), da most bude velik
    return '<svg class="br-svg" viewBox="' + (mob ? '40 70 920 550' : '0 0 1000 620') + '" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
      '<defs><linearGradient id="nr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fb7b0"/><stop offset="1" stop-color="#1d6f78"/></linearGradient>' +
      '<linearGradient id="st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9dcc4"/><stop offset="1" stop-color="#c9b48f"/></linearGradient></defs>' +
      '<path class="br-gorge" d="M0 300L120 330L170 470L210 620H0Z M1000 300L860 330L820 470L790 620H1000Z"/>' +
      '<path class="br-river" d="M150 560C320 530 680 530 850 560L860 620H140Z" fill="url(#nr)"/>' +
      '<path class="br-ripple" d="M260 575h90M420 590h120M610 576h80M330 600h70M560 604h90"/>' +
      // most: gornja ivica (kaldrma na mostu), luk ispod i otvor kroz koji se vidi grad
      '<path class="br-arch" fill="url(#st)" d="M150 300Q500 128 850 300L850 326L812 470C770 330 610 262 500 262C390 262 230 330 188 470L150 326Z"/>' +
      '<path class="br-under" d="M200 466C246 334 396 274 500 274C604 274 754 334 800 466" fill="none"/>' +
      '<path class="br-deck" d="M150 300Q500 128 850 300" fill="none"/>' +
      '<path class="br-rail" d="M162 288Q500 120 838 288" fill="none"/>' +
      '<g class="br-tower"><path d="M40 130h110v200H40z" fill="url(#st)"/><path d="M28 132L95 78L162 132Z" class="br-troof"/><rect x="80" y="170" width="28" height="44" rx="14" class="br-twin"/><rect x="58" y="250" width="20" height="30" rx="10" class="br-twin"/></g>' +
      '<g class="br-tower"><path d="M850 150h110v180H850z" fill="url(#st)"/><path d="M842 152L905 108L968 152Z" class="br-troof"/><rect x="894" y="190" width="26" height="40" rx="13" class="br-twin"/></g>' +
      '<g class="br-diver"><circle cx="500" cy="164" r="7"/><path d="M500 171v18M500 177l-11 -9M500 177l11 -9M500 189l-6 14M500 189l6 14"/></g>' +
      '<g class="br-splash"><path d="M480 572c6-14 14-14 20 0c6-14 14-14 20 0"/><ellipse cx="500" cy="578" rx="34" ry="5"/></g>' +
      '</svg>';
  }

  /* ---------- stanje ---------- */
  var sec, stage, street, far, mid, tint, intro, bar, fill, now, sky = {}, sheet, card;
  var shops = [], lamps = [], n = 0, dist = 1, W = 0, H = 0, shopW = 0, start = 0, bridgeX = 0, bridgeW = 0;
  var p = 0, active = -1, raf = 0, lastFocus = null, t = null, list = [], jumped = false;

  function render(lang) {
    sec = document.getElementById('work'); if (!sec) return;
    t = D[lang];
    stage = sec.querySelector('.cs-stage'); street = sec.querySelector('.cs-street');
    far = sec.querySelector('.cs-far'); mid = sec.querySelector('.cs-mid'); tint = sec.querySelector('.cs-tint'); intro = sec.querySelector('.cs-intro');
    bar = sec.querySelector('.cs-bar'); fill = sec.querySelector('.cs-fill'); now = sec.querySelector('.cs-now');
    ['day', 'gold', 'dusk'].forEach(function (k) { sky[k] = sec.querySelector('.sky-' + k); });
    sky.sun = sec.querySelector('.cs-sun'); sky.stars = sec.querySelector('.cs-stars');
    sheet = document.getElementById('cs-sheet'); card = sheet.querySelector('.cs-card-in');
    // dućani: svi radovi osim Starog mosta, on je na kraju ulice
    list = D.work.filter(function (w) { return w.id !== 'mostar'; });
    n = list.length;
    var html = list.map(function (w, i) {
      var it = t.items[w.id], s = SHOP[w.id] || SHOP.myshishapedia;
      return '<button type="button" class="shop" data-i="' + i + '" style="--shut:' + s.shut + ';--wall:' + s.wall + '" aria-label="' + esc(t.street.open + ': ' + it[0]) + '">' +
        '<span class="shop-roof"></span>' +
        '<span class="shop-wall">' +
          '<span class="shop-sign"><b>' + esc(it[0]) + '</b></span>' +
          '<span class="shop-door"><span class="shop-win">' + (w.img ? '<img src="' + esc(w.img) + '" alt="" loading="lazy" decoding="async">' : '<span class="shop-win-ico">' + icon(s.ico) + '</span>') + '<i class="shop-glow"></i></span>' +
            '<i class="kep kep-up"></i><i class="kep kep-down"></i></span>' +
          '<span class="shop-goods">' + icon(s.ico) + '</span>' +
        '</span>' +
        '<span class="shop-step"></span>' +
        '<span class="shop-plaque"><b>' + (i < 9 ? '0' : '') + (i + 1) + '</b><span>' + esc(it[1].split(' · ')[1] || it[1]) + '</span>' + (w.live ? '<i class="shop-live">' + esc(t.liveTag) + '</i>' : '') + '</span>' +
      '</button>';
    }).join('');
    var lampHtml = '';
    for (var i = 0; i <= n; i++) lampHtml += '<span class="lamp" data-l="' + i + '"><i class="lamp-glow"></i></span>';
    var mo = D.work.filter(function (w) { return w.id === 'mostar'; })[0];
    street.innerHTML = '<div class="cs-ground"></div>' + html + lampHtml +
      '<div class="cs-bridge">' + bridge(window.innerWidth < 700) +
        (mo ? '<button type="button" class="br-hit" data-bridge aria-label="' + esc(t.street.bridge) + '"></button>' : '') +
        '<div class="cs-end"><p class="cs-end-k">' + esc(t.street.night) + '</p><h3>' + esc(t.street.end) + '</h3><p>' + esc(t.street.endP) + '</p>' +
        '<a class="cs-end-btn" href="#contact">' + esc(t.street.endCta) + ' <i aria-hidden="true">↗</i></a></div>' +
      '</div>';
    shops = [].slice.call(street.querySelectorAll('.shop'));
    lamps = [].slice.call(street.querySelectorAll('.lamp'));
    bar.querySelector('.cs-track').innerHTML = '<i class="cs-fill"></i>' + list.map(function (w, i) { return '<b style="--k:' + i + '"></b>'; }).join('') + '<b class="cs-br"></b>';
    fill = bar.querySelector('.cs-fill');
    active = -1; jumped = false;
    layout();
  }

  /* veličine se računaju iz ekrana; visina sekcije je dužina ulice */
  function layout() {
    if (!sec) return;
    W = stage.clientWidth; H = stage.clientHeight;
    var mob = W < 700;
    shopW = mob ? Math.round(W * 0.7) : Math.round(clamp(W * 0.25, 300, 400));
    start = mob ? Math.round(W * 0.12) : Math.round(W * 0.46);
    // most je visok kao ~2/3 ekrana; šetnja završi tako da je sredina mosta na sredini ekrana
    bridgeW = mob ? Math.round(H * 0.66 * 1.67) : Math.round(clamp(W * 0.95, 900, 1400));
    bridgeX = start + n * shopW + (mob ? 40 : 80);
    var L = bridgeX + Math.round(bridgeW / 2 + W / 2);
    dist = Math.max(1, L - W);
    sec.style.height = (dist + H) + 'px';
    street.style.width = Math.max(L, bridgeX + bridgeW) + 'px';
    shops.forEach(function (el, i) { el.style.left = (start + i * shopW) + 'px'; el.style.width = shopW + 'px'; });
    lamps.forEach(function (el, i) { el.style.left = (start + i * shopW - 6) + 'px'; });
    var br = street.querySelector('.cs-bridge'); br.style.left = bridgeX + 'px'; br.style.width = bridgeW + 'px';
    street.querySelector('.cs-ground').style.width = (bridgeX + bridgeW * 0.14) + 'px';
    // završni tekst stoji u zadnjem ekranu ulice (vidi se cijeli kad se stigne do mosta)
    var end = street.querySelector('.cs-end'), ew = Math.round(Math.min(420, W * 0.84));
    end.style.width = ew + 'px'; end.style.right = 'auto';
    end.style.left = Math.round(bridgeW / 2 + W / 2 - ew - W * (mob ? 0.08 : 0.06)) + 'px';
    // tačke na traci: gdje je koji dućan i most
    [].forEach.call(bar.querySelectorAll('.cs-track b'), function (b, i) {
      var cx = i < n ? start + i * shopW + shopW / 2 : bridgeX + bridgeW / 2;
      b.style.left = (clamp((cx - W / 2) / dist, 0, 1) * 100).toFixed(2) + '%';
    });
    var fw = Math.round(W * 1.5), mw = Math.round(L * 0.5 + W);
    far.innerHTML = hills(fw, Math.round(H * 0.75)); far.style.width = fw + 'px';
    mid.innerHTML = town(mw, Math.round(H * 0.62)); mid.style.width = mw + 'px';
    update(true);
  }

  function progress() {
    var r = sec.getBoundingClientRect();
    return clamp(-r.top / dist, 0, 1);
  }

  function update(force) {
    raf = 0;
    if (!sec) return;
    var np = progress();
    if (!force && Math.abs(np - p) < 0.0001) return;
    p = np;
    var x = p * dist;
    street.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
    mid.style.transform = 'translate3d(' + (-x * 0.45).toFixed(1) + 'px,0,0)';
    far.style.transform = 'translate3d(' + (-x * 0.1).toFixed(1) + 'px,0,0)';
    // dan, zlatni sat, sumrak
    var gold = smooth(0.18, 0.55, p), dusk = smooth(0.55, 0.92, p);
    sky.gold.style.opacity = gold.toFixed(3);
    sky.dusk.style.opacity = dusk.toFixed(3);
    tint.style.opacity = (dusk * 0.9).toFixed(3);
    sky.stars.style.opacity = smooth(0.8, 1, p).toFixed(3);
    sky.sun.style.transform = 'translate3d(0,' + (p * H * 0.55).toFixed(1) + 'px,0) scale(' + (1 + p * 0.35).toFixed(3) + ')';
    sky.sun.style.opacity = (1 - smooth(0.82, 1, p)).toFixed(3);
    street.style.setProperty('--night', smooth(0.5, 0.9, p).toFixed(3));
    intro.style.opacity = (1 - smooth(0.0, 0.07, p)).toFixed(3);
    intro.style.transform = 'translate3d(' + (-x * 0.6).toFixed(1) + 'px,0,0)';
    intro.style.visibility = p > 0.09 ? 'hidden' : '';
    fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    // dućan na sredini ekrana otvori kepence
    var mid0 = x + W / 2, a = -1, best = shopW * 0.62;
    for (var i = 0; i < n; i++) { var d = Math.abs(start + i * shopW + shopW / 2 - mid0); if (d < best) { best = d; a = i; } }
    var atBridge = mid0 > bridgeX + bridgeW * 0.25;
    if (a !== active) {
      if (shops[active]) shops[active].classList.remove('open');
      if (shops[a]) shops[a].classList.add('open');
      active = a;
    }
    var label = a >= 0 ? t.items[list[a].id][0] : atBridge ? 'Stari most' : '';
    if (now.textContent !== label) now.textContent = label;
    if (atBridge && p > 0.985 && !jumped && !reduced) { jumped = true; street.querySelector('.cs-bridge').classList.add('jump'); }
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(function () { update(false); }); }

  /* ---------- kartica projekta ---------- */
  function open(w, from) {
    var it = t.items[w.id];
    card.innerHTML = '<div class="cs-img">' + (w.img ? '<img src="' + esc(w.img) + '" alt="">' : icon((SHOP[w.id] || {}).ico)) + '</div>' +
      '<p class="cs-kind">' + esc(it[1]) + ' · ' + esc(w.year) + '</p><h3 id="cs-sheet-t">' + esc(it[0]) + '</h3><p class="cs-p">' + esc(it[2]) + '</p>' +
      '<ul class="tags">' + w.tags.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul>' +
      '<p class="job-links">' + (w.live ? '<a href="' + esc(w.live) + '" target="_blank" rel="noopener">' + esc(t.live) + ' ↗</a>' : '') + '<a href="' + esc(w.src) + '" target="_blank" rel="noopener">' + esc(t.code) + ' ↗</a></p>';
    lastFocus = from || null;
    sheet.hidden = false;
    requestAnimationFrame(function () { sheet.classList.add('on'); });
    document.body.style.overflow = 'hidden';
    sheet.querySelector('.cs-x').focus({ preventScroll: true });
  }
  function close() {
    if (!sheet || sheet.hidden) return;
    sheet.classList.remove('on'); document.body.style.overflow = '';
    setTimeout(function () { sheet.hidden = true; }, 300);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var s = e.target.closest('.shop');
    if (s) { open(list[+s.getAttribute('data-i')], s); return; }
    if (e.target.closest('[data-bridge]')) { open(D.work.filter(function (w) { return w.id === 'mostar'; })[0], e.target.closest('[data-bridge]')); return; }
    if (e.target.closest('[data-cs-close]') || e.target === sheet) close();
    if (e.target.closest('.cs-end-btn')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (!sheet || sheet.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { var f = [].slice.call(sheet.querySelectorAll('a, button')), k = f.indexOf(document.activeElement); e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
  });
  /* tastatura: dućan u fokusu dođe na sredinu ekrana */
  document.addEventListener('focusin', function (e) {
    var s = e.target.closest && e.target.closest('.shop, [data-bridge]'); if (!s || !sec) return;
    var cx = s.classList.contains('shop') ? start + (+s.getAttribute('data-i')) * shopW + shopW / 2 : bridgeX + bridgeW / 2;
    var y = sec.getBoundingClientRect().top + scrollY + clamp((cx - W / 2) / dist, 0, 1) * dist;
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  });

  addEventListener('scroll', schedule, { passive: true });
  var rt = 0;
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });

  window.CARSIJA = { render: render };
})();
