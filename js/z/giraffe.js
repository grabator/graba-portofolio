/*
 * IT žirafa: žirafa nacrtana znakovima koda na jednom canvasu.
 * Oblik je u prostoru 1000x1000 (žirafa gleda lijevo). Vrat se savija i glava okreće prema mišu,
 * mrlje su Voronoi ćelije (d3-delaunay), a znakovi u njima se polako mijenjaju ("kod teče").
 * Sve što se može izračunati jednom, računa se jednom; u petlji se samo pomjeraju tačke i crta.
 */
const HEAD = 'M 545 205 C 520 178, 470 172, 440 185 C 405 200, 372 236, 345 270 C 325 294, 300 316, 296 336 C 292 356, 304 372, 326 376 C 350 380, 372 372, 392 362 C 420 350, 452 338, 480 336 C 515 334, 545 312, 556 280 C 566 250, 562 222, 545 205 Z';
const NECK = 'M 470 330 C 520 470, 610 640, 690 800 C 720 860, 735 930, 745 1010 L 925 1010 C 905 900, 860 760, 790 620 C 720 480, 640 350, 590 250 C 575 230, 560 215, 545 205 C 520 260, 500 300, 470 330 Z';
const EAR = 'M 548 214 C 582 192, 626 192, 650 204 C 628 224, 590 234, 556 232 Z';
const EYE = 'M 412 240 C 420 226, 440 222, 452 232 C 444 246, 424 250, 412 240 Z';
const NOSTRIL = 'M 314 312 C 318 304, 328 302, 334 308';
const MOUTH = 'M 302 352 C 322 362, 346 362, 366 356';
const LASHES = [[410, 236, 400, 230], [414, 232, 406, 224], [420, 229, 415, 220]];
const HORNS = [[462, 186, 454, 138], [500, 188, 508, 136]];
const MANE = [[590, 250], [640, 350], [720, 480], [790, 620], [830, 720]];
const EYE_C = [427, 238], PIV = [520, 300];
const SPOT_CH = '01{}[]<>/=+*;:$#&', GAP_CH = '·.:';
const WORDS = [['graba', 0.3], ['build()', 0.45], ['ship()', 0.65], ['<vidim/>', 0.85]];
const GREEN = '#7dffb0';

const hornPath = ([x1, y1, x2, y2]) => `M ${x1 - 13} ${y1} C ${x1 - 11} ${y1 - 24}, ${x2 - 9} ${y2 + 16}, ${x2 - 8} ${y2 + 6} L ${x2 + 8} ${y2 + 6} C ${x2 + 9} ${y2 + 16}, ${x1 + 11} ${y1 - 24}, ${x1 + 13} ${y1} Z`;
const neckW = (y) => Math.pow(Math.min(1, Math.max(0, (1010 - y) / 810)), 1.7);
const W_PIV = neckW(PIV[1]);

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function sample(d, step) {
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d); svg.appendChild(p); svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'; document.body.appendChild(svg);
  const L = p.getTotalLength(), out = [];
  for (let l = 0; l <= L; l += step) { const q = p.getPointAtLength(l); out.push(q.x, q.y); }
  svg.remove();
  return new Float32Array(out);
}
function inPoly(poly, x, y) { let c = false; for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) { const xi = poly[i], yi = poly[i + 1], xj = poly[j], yj = poly[j + 1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; }

// geometrija se računa jednom za sve instance (ista žirafa)
let GEO = null;
function geometry() {
  if (GEO) return GEO;
  const D3 = globalThis.d3;
  const scratch = document.createElement('canvas').getContext('2d');
  const pH = new Path2D(HEAD), pN = new Path2D(NECK);
  const inHead = (x, y) => scratch.isPointInPath(pH, x, y), inBody = (x, y) => inHead(x, y) || scratch.isPointInPath(pN, x, y);
  const r = rng(11);
  // mrlje: tačke bacane nasumično, ali uvijek iste (seed), sitnije na glavi, krupnije niz vrat
  const pts = [];
  for (let t = 0; t < 14000 && pts.length < 260; t++) {
    const x = 280 + r() * 680, y = 110 + r() * 900;
    if (!inBody(x, y)) continue;
    const d = inHead(x, y) ? 26 : 28 + Math.max(0, y - 300) * 0.06;
    let ok = true; for (let i = 0; i < pts.length; i += 2) { if (Math.hypot(pts[i] - x, pts[i + 1] - y) < d) { ok = false; break; } }
    if (ok) pts.push(x, y);
  }
  const del = new D3.Delaunay(Float64Array.from(pts)), vor = del.voronoi([200, 80, 1000, 1040]);
  const spots = [];
  for (let i = 0; i < pts.length / 2; i++) {
    const poly = vor.cellPolygon(i); if (!poly) { spots.push(null); continue; }
    const cx = pts[i * 2], cy = pts[i * 2 + 1], k = 0.72 + r() * 0.08, out = [];
    for (const [x, y] of poly) out.push(cx + (x - cx) * k, cy + (y - cy) * k);
    spots.push(new Float32Array(out));
  }
  GEO = {
    head: sample(HEAD, 4), neck: sample(NECK, 4), ear: sample(EAR, 3), eye: sample(EYE, 2), nostril: sample(NOSTRIL, 2), mouth: sample(MOUTH, 2),
    horns: HORNS.map((h) => sample(hornPath(h), 3)), inHead, inBody, del, spots, r
  };
  return GEO;
}

/**
 * opt.place(w, h) -> { s, ox, oy }  položaj i veličina (piksel = o + tačka * s)
 * opt.flip     žirafa gleda desno
 * opt.density  1 = normalno, veći broj = rjeđi znakovi
 * opt.alpha    ukupna providnost
 * opt.follow   prati miš
 * opt.still    crta se jednom, bez petlje
 * opt.intro    znakovi se pojave jedan po jedan, pa se nacrta obris
 * opt.words    zelene riječi u vratu
 * opt.sight    isprekidana linija od oka do kursora
 * opt.baseTurn stalni nagib glave (radijani)
 */
export function createCodeGiraffe(canvas, opt = {}) {
  const o = { density: 1, alpha: 1, follow: true, still: false, intro: true, words: true, sight: false, flip: false, baseTurn: 0, glow: true, ...opt };
  const g = canvas.getContext('2d');
  const G = geometry();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fx = o.flip ? -1 : 1;

  // mreža znakova u mirnom položaju (prostor 1000x1000)
  const stepX = 8.17 * o.density, stepY = 12.9 * o.density;
  const cells = [];
  for (let y = 110; y < 1012; y += stepY) for (let x = 280; x < 960; x += stepX) {
    if (!G.inBody(x, y)) continue;
    const head = G.inHead(x, y);
    let bucket = 0;
    const si = G.del.find(x, y), sp = G.spots[si];
    if (sp && inPoly(sp, x, y)) bucket = 1 + ((si * 37) % 10);
    cells.push(x, y, head ? 1 : 0, bucket);
  }
  const N = cells.length / 4;
  const rx = new Float32Array(N), ry = new Float32Array(N), wy = new Float32Array(N), isH = new Uint8Array(N), ch = new Uint8Array(N), t0 = new Float32Array(N);
  const byBucket = Array.from({ length: 11 }, () => []);
  const rr = rng(23);
  for (let i = 0; i < N; i++) {
    rx[i] = cells[i * 4]; ry[i] = cells[i * 4 + 1]; isH[i] = cells[i * 4 + 2]; wy[i] = neckW(ry[i]);
    const b = cells[i * 4 + 3]; byBucket[b].push(i);
    ch[i] = b ? Math.floor(rr() * SPOT_CH.length) : SPOT_CH.length + Math.floor(rr() * GAP_CH.length);
    t0[i] = rr() * 1.2;
  }
  const buckets = byBucket.map((a) => Uint32Array.from(a));
  const bucketAlpha = [0.16, ...Array.from({ length: 10 }, (_, k) => 0.55 + k / 22)];
  const words = WORDS.map(([w, t]) => [w, 530 + (835 - 530) * t, 290 + (1010 - 290) * t]);

  // stanje
  let W = 0, H = 0, dpr = 1, s = 1, ox = 0, oy = 0, atlas = null, cw = 0, chh = 0, fontPx = 11;
  const st = { B: 0, vB: 0, T: o.baseTurn, vT: 0, L: 0, vL: 0, tB: 0, tT: o.baseTurn, tL: 0 };
  const ptr = { x: -1, y: -1, inside: false, moved: 0 };
  let raf = 0, running = false, visible = true, start = performance.now(), last = start, lastTick = 0, blinkAt = start + 3000, blinkT = -1;
  let slow = 0, skip = false, frameN = 0;

  function buildAtlas() {
    const all = SPOT_CH + GAP_CH;
    fontPx = 11 * (s / 0.93) * o.density ** 0.35;
    cw = Math.ceil(fontPx * 0.8 * dpr) + 2; chh = Math.ceil(fontPx * 1.4 * dpr);
    atlas = document.createElement('canvas'); atlas.width = cw * all.length; atlas.height = chh;
    const a = atlas.getContext('2d'); a.fillStyle = '#fff'; a.font = (fontPx * dpr) + 'px "Space Mono", monospace'; a.textAlign = 'center'; a.textBaseline = 'middle';
    for (let i = 0; i < all.length; i++) a.fillText(all[i], i * cw + cw / 2, chh / 2);
  }
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1 : 1.5);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ({ s, ox, oy } = o.place(W, H));
    buildAtlas();
    if (!running) draw(performance.now());
  }

  // pretvaranje tačaka: vrat se povija, glava se pomjeri sa vrhom vrata pa okrene
  let cT = 1, sT = 0, hdx = 0, hdy = 0;
  function prep() { cT = Math.cos(st.T); sT = Math.sin(st.T); hdx = st.B * W_PIV; hdy = st.L * W_PIV; }
  const sx = (x) => o.flip ? ox + (1000 - x) * s : ox + x * s;
  const sy = (y) => oy + y * s;
  function neckPt(x, y, w, out) { out[0] = sx(x + st.B * w); out[1] = sy(y + st.L * w); }
  function headPt(x, y, out) {
    const px = PIV[0] + hdx, py = PIV[1] + hdy, X = x + hdx - px, Y = y + hdy - py;
    out[0] = sx(px + X * cT - Y * sT); out[1] = sy(py + X * sT + Y * cT);
  }
  const tmp = [0, 0];
  function polyPath(arr, head, close = true) {
    const p = new Path2D();
    for (let i = 0; i < arr.length; i += 2) { if (head) headPt(arr[i], arr[i + 1], tmp); else neckPt(arr[i], arr[i + 1], neckW(arr[i + 1]), tmp); if (i) p.lineTo(tmp[0], tmp[1]); else p.moveTo(tmp[0], tmp[1]); }
    if (close) p.closePath();
    return p;
  }
  const pathLen = (arr) => { let L = 0; for (let i = 2; i < arr.length; i += 2) L += Math.hypot(arr[i] - arr[i - 2], arr[i + 1] - arr[i - 1]); return L * s; };
  const LEN = { neck: 0, head: 0 };

  function physics(dt, now) {
    if (o.follow && ptr.x >= 0) {
      headPt(430, 260, tmp);
      const nx = Math.max(-1, Math.min(1, (ptr.x - tmp[0]) / (W / 2))), ny = Math.max(-1, Math.min(1, (ptr.y - tmp[1]) / (H / 2)));
      st.tB = nx * 110 * fx; st.tT = o.baseTurn - ny * 0.2 * fx; st.tL = ny * 14;
    }
    const idle = now - ptr.moved > 2000;
    const t = now / 1000;
    const tB = st.tB + (idle ? Math.sin(t * 0.6) * 10 : 0), tL = st.tL + (idle ? Math.sin(t * 0.9) * 3 : 0);
    const k = 60, c = 14, h = Math.min(dt, 0.05);
    st.vB += ((tB - st.B) * k - st.vB * c) * h; st.B += st.vB * h;
    st.vT += ((st.tT - st.T) * k - st.vT * c) * h; st.T += st.vT * h;
    st.vL += ((tL - st.L) * k - st.vL * c) * h; st.L += st.vL * h;
    st.B = Math.max(-130, Math.min(130, st.B)); st.T = Math.max(-0.35, Math.min(0.35, st.T));
  }

  function draw(now) {
    const el = (now - start) / 1000;
    const intro = o.intro && !reduced && !o.still ? el : 99;
    prep();
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    g.globalAlpha = o.alpha;
    if (o.glow) { headPt(440, 300, tmp); const rg = g.createRadialGradient(tmp[0], tmp[1], 10, tmp[0], tmp[1], 470 * s); rg.addColorStop(0, 'rgba(255,255,255,.09)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); }

    // znakovi (iz atlasa, grupisani po providnosti)
    g.setTransform(1, 0, 0, 1, 0, 0);
    const half = cw / 2, hh = chh / 2;
    for (let b = 0; b < 11; b++) {
      const list = buckets[b]; if (!list.length) continue;
      g.globalAlpha = bucketAlpha[b] * o.alpha;
      for (let j = 0; j < list.length; j++) {
        const i = list[j];
        if (intro < t0[i]) continue;
        if (isH[i]) headPt(rx[i], ry[i], tmp); else neckPt(rx[i], ry[i], wy[i], tmp);
        g.drawImage(atlas, ch[i] * cw, 0, cw, chh, tmp[0] * dpr - half, tmp[1] * dpr - hh, cw, chh);
      }
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalAlpha = o.alpha;

    // zelene riječi
    if (o.words && intro > 1.2) {
      g.font = '700 ' + fontPx + 'px "Space Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (const [w, x, y] of words) { neckPt(x, y, neckW(y), tmp); const m = g.measureText(w).width; g.fillStyle = 'rgba(0,0,0,.88)'; g.fillRect(tmp[0] - m / 2 - 4, tmp[1] - fontPx * 0.75, m + 8, fontPx * 1.5); g.fillStyle = GREEN; g.fillText(w, tmp[0], tmp[1] + 0.5); }
    }

    // obrisi (crtaju se nakon što se znakovi slože)
    const op = intro >= 1.8 ? 1 : Math.max(0, (intro - 1.2) / 0.6);
    if (op > 0) {
      const lw = Math.max(1, s / 0.93);
      const PH = polyPath(G.head, true), PN = polyPath(G.neck, false);
      if (!LEN.neck) { LEN.neck = pathLen(G.neck); LEN.head = pathLen(G.head); }
      const dash = (len) => (op < 1 ? [len * op, len] : []);
      // griva
      g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 3 * lw; g.lineCap = 'round';
      g.beginPath();
      for (let i = 0; i < 64; i++) {
        const t = i / 63, kk = Math.min(3, Math.floor(t * 4)), f = t * 4 - kk;
        const [x1, y1] = MANE[kk], [x2, y2] = MANE[kk + 1], x = x1 + (x2 - x1) * f, y = y1 + (y2 - y1) * f;
        const nx = y2 - y1, ny = -(x2 - x1), L = Math.hypot(nx, ny), len = 6 + (i % 3) * 3;
        neckPt(x, y, neckW(y), tmp); g.moveTo(tmp[0], tmp[1]);
        neckPt(x + nx / L * len, y + ny / L * len, neckW(y), tmp); g.lineTo(tmp[0], tmp[1]);
      }
      g.globalAlpha = o.alpha * op; g.stroke(); g.globalAlpha = o.alpha;
      // uho i rogovi
      g.lineJoin = 'round'; g.lineWidth = 2.2 * lw; g.strokeStyle = '#fff'; g.fillStyle = '#0a0a0a';
      g.setLineDash(dash(200 * s));
      const PE = polyPath(G.ear, true); g.fill(PE); g.stroke(PE);
      for (let k = 0; k < 2; k++) {
        const P = polyPath(G.horns[k], true); g.fill(P); g.stroke(P);
        headPt(HORNS[k][2], HORNS[k][3], tmp); g.fillStyle = '#fff'; g.globalAlpha = o.alpha * op; g.beginPath(); g.arc(tmp[0], tmp[1], 12 * s, 0, 6.2832); g.fill(); g.globalAlpha = o.alpha; g.fillStyle = '#0a0a0a';
      }
      // obris vrata, ali ne preko glave
      g.save(); const clip = new Path2D(); clip.rect(0, 0, W, H); clip.addPath(PH); g.clip(clip, 'evenodd');
      g.setLineDash(dash(LEN.neck)); g.lineWidth = 1.6 * lw; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke(PN); g.restore();
      g.setLineDash(dash(LEN.head)); g.lineWidth = 2.4 * lw; g.strokeStyle = '#fff'; g.stroke(PH);
      g.setLineDash([]);
      // oko (trepće), zjenica prema kursoru, trepavice, nozdrva, usta
      g.globalAlpha = o.alpha * op;
      headPt(EYE_C[0], EYE_C[1], tmp); const ex = tmp[0], ey = tmp[1];
      let bl = 1; if (blinkT >= 0) { const k = (now - blinkT) / 160; bl = k >= 1 ? 1 : 1 - 0.9 * Math.sin(k * Math.PI); }
      const PEy = new Path2D();
      for (let i = 0; i < G.eye.length; i += 2) { headPt(G.eye[i], G.eye[i + 1], tmp); const yy = ey + (tmp[1] - ey) * bl; if (i) PEy.lineTo(tmp[0], yy); else PEy.moveTo(tmp[0], yy); }
      PEy.closePath(); g.fillStyle = '#fff'; g.fill(PEy);
      if (bl > 0.4) {
        let dx = 0, dy = 0; if (ptr.x >= 0) { const d = Math.hypot(ptr.x - ex, ptr.y - ey) || 1; dx = (ptr.x - ex) / d; dy = (ptr.y - ey) / d; } else { dx = -fx; }
        const px = ex + dx * 3.5 * s, py = ey + dy * 2.5 * s;
        g.fillStyle = '#000'; g.beginPath(); g.arc(px, py, 5 * s * bl, 0, 6.2832); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(px - 1.5 * s, py - 1.5 * s, 1.5 * s, 0, 6.2832); g.fill();
      }
      g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineWidth = 1.6 * lw; g.beginPath();
      for (const [a, b, c, d] of LASHES) { headPt(a, b, tmp); g.moveTo(tmp[0], tmp[1]); headPt(c, d, tmp); g.lineTo(tmp[0], tmp[1]); }
      g.stroke();
      g.lineWidth = 2.2 * lw; g.stroke(polyPath(G.nostril, true, false));
      g.lineWidth = 1.8 * lw; g.stroke(polyPath(G.mouth, true, false));
      // linija pogleda do kursora
      if (o.sight && ptr.inside) { g.setLineDash([3, 6]); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ptr.x, ptr.y); g.stroke(); g.setLineDash([]); }
      g.globalAlpha = 1;
    }
  }

  function tick(now) {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const dt = (now - last) / 1000; last = now;
    // slabiji računar: ako je kadar duži od 24 ms dvije sekunde zaredom, crta se svaki drugi kadar
    slow = dt > 0.024 ? slow + dt : Math.max(0, slow - dt);
    if (slow > 2) skip = true;
    physics(dt, now);
    if (now - lastTick > (skip ? 166 : 83)) {          // kod "teče": 12 promjena u sekundi
      lastTick = now;
      const n = Math.max(1, Math.round(N * (skip ? 0.02 : 0.04)));
      for (let k = 0; k < n; k++) { const i = (rr() * N) | 0; ch[i] = ch[i] < SPOT_CH.length ? (rr() * SPOT_CH.length) | 0 : SPOT_CH.length + ((rr() * GAP_CH.length) | 0); }
    }
    if (now > blinkAt) { blinkT = now; blinkAt = now + 4000 + rr() * 3000; }
    if (skip && (frameN++ & 1)) return;
    draw(now);
  }

  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.moved = performance.now();
    ptr.inside = ptr.x >= 0 && ptr.y >= 0 && ptr.x <= r.width && ptr.y <= r.height;
  }
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync(); }, { threshold: 0 });
  const onVis = () => sync();
  function sync() {
    const want = !o.still && !reduced && visible && !document.hidden && started;
    if (want && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); }
    if (!want && running) { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  }
  let started = false;
  const ro = new ResizeObserver(() => resize());

  return {
    start() {
      started = true; start = performance.now();
      resize(); ro.observe(canvas); io.observe(canvas);
      if (o.follow) addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('visibilitychange', onVis);
      if (o.still || reduced) draw(performance.now() + 1e6); else sync();
    },
    restartIntro() { start = performance.now(); },
    stop() {
      started = false; sync(); ro.disconnect(); io.disconnect();
      removeEventListener('pointermove', onMove); document.removeEventListener('visibilitychange', onVis);
    }
  };
}
