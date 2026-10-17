/*
 * IT žirafa: žirafa nacrtana znakovima koda na jednom canvasu.
 * Oblik je u prostoru 1000x1000 (žirafa gleda lijevo). Vrat se savija i glava okreće prema mišu,
 * mrlje su Voronoi ćelije (d3-delaunay), a znakovi u njima se polako mijenjaju ("kod teče").
 * Sve što se može izračunati jednom, računa se jednom.
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
function pathLenD(arr) { let L = 0; for (let i = 2; i < arr.length; i += 2) L += Math.hypot(arr[i] - arr[i - 2], arr[i + 1] - arr[i - 1]); return L; }
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
 *
 * Znakovi se ne crtaju svaki kadar: glava i vrat se jednom iscrtaju u dvije slike (canvas), a u petlji
 * se glava samo zarotira i okrene, a vrat iscrta u tankim trakama pomjerenim koliko se savio.
 * Kad se neki znak promijeni, prepiše se samo njegovo polje u slici.
 */
const P_HEAD = new Path2D(HEAD), P_EAR = new Path2D(EAR), P_EYE = new Path2D(EYE), P_NOSTRIL = new Path2D(NOSTRIL), P_MOUTH = new Path2D(MOUTH);
const P_HORNS = HORNS.map((h) => new Path2D(hornPath(h)));
const HB = [285, 160, 290, 230];                 // okvir glave u prostoru 1000x1000: x, y, širina, visina

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
  const rx = new Float32Array(N), ry = new Float32Array(N), isH = new Uint8Array(N), bk = new Uint8Array(N), ch = new Uint8Array(N), t0 = new Float32Array(N);
  const rr = rng(23);
  let nTop = 1e9, nBot = 0;
  for (let i = 0; i < N; i++) {
    rx[i] = cells[i * 4]; ry[i] = cells[i * 4 + 1]; isH[i] = cells[i * 4 + 2]; bk[i] = cells[i * 4 + 3];
    ch[i] = bk[i] ? Math.floor(rr() * SPOT_CH.length) : SPOT_CH.length + Math.floor(rr() * GAP_CH.length);
    t0[i] = rr() * 1.2;
    if (!isH[i]) { nTop = Math.min(nTop, ry[i]); nBot = Math.max(nBot, ry[i]); }
  }
  nTop -= stepY; nBot += stepY;
  const order = Uint32Array.from({ length: N }, (_, i) => i).sort((a, b) => t0[a] - t0[b]);
  const bucketAlpha = [0.16, ...Array.from({ length: 10 }, (_, k) => 0.55 + k / 22)];
  const words = WORDS.map(([w, t]) => [w, 530 + (835 - 530) * t, 290 + (1010 - 290) * t]);
  const LEN = { head: pathLenD(G.head), ear: pathLenD(G.ear), neck: 0 };

  // stanje
  let W = 0, H = 0, dpr = 1, s = 1, ox = 0, oy = 0, k = 1, fontPx = 11, dprCap = 1.5;
  let atlas = null, atlasM = null, cw = 0, chh = 0, cwC = 0, chC = 0, headCv = null, headCvM = null, neckCv = null, glowCv = null;
  let drawnTo = 0;                                  // koliko je znakova (po redu pojavljivanja) već u slikama
  const st = { B: 0, vB: 0, T: o.baseTurn, vT: 0, L: 0, vL: 0, Y: 0, vY: 0, tB: 0, tT: o.baseTurn, tL: 0, tY: 0 };
  const ptr = { x: -1, y: -1, inside: false, moved: 0 };
  let faceLeft = true;
  let raf = 0, running = false, visible = true, start = performance.now(), last = start, lastTick = 0, blinkAt = start + 3000, blinkT = -1, slow = 0;

  function glyphs(mirror) {
    const all = SPOT_CH + GAP_CH, c = document.createElement('canvas');
    c.width = cw * all.length; c.height = chh;
    const a = c.getContext('2d'); a.fillStyle = '#fff'; a.font = (fontPx * dpr) + 'px "Space Mono", monospace'; a.textAlign = 'center'; a.textBaseline = 'middle';
    for (let i = 0; i < all.length; i++) {
      a.save(); a.translate(i * cw + cw / 2, chh / 2); if (mirror) a.scale(-1, 1); a.fillText(all[i], 0, 0); a.restore();
    }
    return c;
  }
  function layer(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; }
  // polje znaka u slici glave ili vrata (vrat je u slici već okrenut ako žirafa gleda desno)
  function cellBox(i) {
    let x, y;
    if (isH[i]) { x = (rx[i] - HB[0]) * k; y = (ry[i] - HB[1]) * k; }
    else { x = o.flip ? (960 - rx[i]) * k : (rx[i] - 280) * k; y = (ry[i] - nTop) * k; }
    return [Math.round(x - cwC / 2), Math.round(y - chC / 2)];
  }
  function paintCell(i, clear) {
    const src = ch[i] * cw + ((cw - cwC) >> 1), sy0 = (chh - chC) >> 1;
    if (isH[i]) {
      for (let m = 0; m < 2; m++) {
        const c = (m ? headCvM : headCv).getContext('2d'), [x, y] = cellBox(i);
        if (clear) c.clearRect(x, y, cwC, chC);
        c.globalAlpha = bucketAlpha[bk[i]]; c.drawImage(m ? atlasM : atlas, src, sy0, cwC, chC, x, y, cwC, chC);
      }
    } else {
      const c = neckCv.getContext('2d'), [x, y] = cellBox(i);
      if (clear) c.clearRect(x, y, cwC, chC);
      c.globalAlpha = bucketAlpha[bk[i]]; c.drawImage(atlas, src, sy0, cwC, chC, x, y, cwC, chC);
    }
  }
  function build() {
    fontPx = 11 * (s / 0.93) * o.density ** 0.35;
    k = s * dpr;
    cw = Math.ceil(fontPx * 0.8 * dpr) + 2; chh = Math.ceil(fontPx * 1.4 * dpr);
    cwC = Math.min(cw, Math.floor(stepX * k)); chC = Math.min(chh, Math.floor(stepY * k));
    atlas = glyphs(false); atlasM = glyphs(true);
    headCv = layer(HB[2] * k, HB[3] * k); headCvM = layer(HB[2] * k, HB[3] * k);
    neckCv = layer(680 * k, (nBot - nTop) * k);
    if (!glowCv) { glowCv = layer(256, 256); const c = glowCv.getContext('2d'), rg = c.createRadialGradient(128, 128, 3, 128, 128, 128); rg.addColorStop(0, 'rgba(255,255,255,.09)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = rg; c.fillRect(0, 0, 256, 256); }
    const upto = drawnTo; drawnTo = 0; fill(upto);
  }
  function fill(upto) { for (; drawnTo < upto; drawnTo++) paintCell(order[drawnTo], false); }
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1 : dprCap);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ({ s, ox, oy } = o.place(W, H));
    build();
    if (!running) draw(performance.now());
  }

  // pretvaranje tačaka: vrat se povija, glava se pomjeri sa vrhom vrata, zarotira i okrene (cY < 0: gleda na drugu stranu)
  let cT = 1, sT = 0, cY = 1, hdx = 0, hdy = 0;
  function prep() { cT = Math.cos(st.T); sT = Math.sin(st.T); cY = Math.cos(st.Y * Math.PI); hdx = st.B * W_PIV; hdy = st.L * W_PIV; }
  const sx = (x) => o.flip ? ox + (1000 - x) * s : ox + x * s;
  const sy = (y) => oy + y * s;
  function neckPt(x, y, w, out) { out[0] = sx(x + st.B * w); out[1] = sy(y + st.L * w); }
  function headPt(x, y, out) {
    const X = (x - PIV[0]) * cY, Y = y - PIV[1];
    out[0] = sx(PIV[0] + hdx + X * cT - Y * sT); out[1] = sy(PIV[1] + hdy + X * sT + Y * cT);
  }
  // canvas transform za glavu: tačka u prostoru 1000x1000 -> piksel na ekranu
  function headMatrix() {
    g.setTransform(fx * s * dpr, 0, 0, s * dpr, (o.flip ? ox + 1000 * s : ox) * dpr, oy * dpr);
    g.translate(PIV[0] + hdx, PIV[1] + hdy); g.rotate(st.T); g.scale(cY, 1); g.translate(-PIV[0], -PIV[1]);
  }
  const tmp = [0, 0];
  function neckPath(arr) {
    const p = new Path2D();
    for (let i = 0; i < arr.length; i += 2) { neckPt(arr[i], arr[i + 1], neckW(arr[i + 1]), tmp); if (i) p.lineTo(tmp[0], tmp[1]); else p.moveTo(tmp[0], tmp[1]); }
    return p;
  }

  function physics(dt, now) {
    if (o.follow && ptr.x >= 0) {
      // okreće se na onu stranu na kojoj je miš (malo "mrtvog" prostora da ne treperi)
      const px = sx(PIV[0] + st.B * W_PIV), py = sy(PIV[1] + st.L * W_PIV - 40);
      if (ptr.x < px - 50) faceLeft = true; else if (ptr.x > px + 50) faceLeft = false;
      const dir = (faceLeft ? 1 : -1) * fx;            // 1: glava kako je nacrtana, -1: okrenuta
      st.tY = dir === 1 ? 0 : 1;
      const dx = ptr.x - px, dy = ptr.y - py;
      const a = Math.max(-0.6, Math.min(0.32, Math.atan2(dy, Math.max(Math.abs(dx), 120)) * 0.8));   // gore više, dolje manje
      st.tT = dir * (o.baseTurn - a);
      st.tB = Math.max(-1, Math.min(1, dx / (W / 2))) * 110 * fx;
      st.tL = Math.max(-1, Math.min(1, dy / (H / 2))) * 16;
    }
    const idle = now - ptr.moved > 2000;
    const t = now / 1000;
    const tB = st.tB + (idle ? Math.sin(t * 0.6) * 10 : 0), tL = st.tL + (idle ? Math.sin(t * 0.9) * 3 : 0);
    // opruge: brze i bez ljuljanja (skoro kritično prigušene); korak se dijeli da ostane stabilno
    const n = dt > 0.02 ? 2 : 1, h = Math.min(dt, 0.05) / n;
    for (let q = 0; q < n; q++) {
      st.vB += ((tB - st.B) * 170 - st.vB * 25) * h; st.B += st.vB * h;
      st.vT += ((st.tT - st.T) * 150 - st.vT * 23) * h; st.T += st.vT * h;
      st.vL += ((tL - st.L) * 170 - st.vL * 25) * h; st.L += st.vL * h;
      st.vY += ((st.tY - st.Y) * 110 - st.vY * 20) * h; st.Y += st.vY * h;
    }
    st.B = Math.max(-130, Math.min(130, st.B)); st.T = Math.max(-0.7, Math.min(0.7, st.T)); st.Y = Math.max(0, Math.min(1, st.Y));
  }

  function draw(now) {
    const el = (now - start) / 1000;
    const intro = o.intro && !reduced && !o.still ? el : 99;
    // znakovi koji su se do sad pojavili idu u slike
    if (drawnTo < N) { let upto = drawnTo; while (upto < N && t0[order[upto]] <= intro) upto++; fill(upto); }
    prep();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.globalAlpha = o.alpha;
    if (o.glow) { headPt(440, 300, tmp); const R = 470 * s; g.drawImage(glowCv, (tmp[0] - R) * dpr, (tmp[1] - R) * dpr, 2 * R * dpr, 2 * R * dpr); }

    // vrat: trake od po ~6 piksela, svaka pomjerena koliko se vrat na toj visini savio
    const bandH = Math.max(4, Math.round(6 * dpr)), rowsN = neckCv.height;
    const left0 = (o.flip ? ox + 40 * s : ox + 280 * s) * dpr, top0 = (oy + nTop * s) * dpr;
    let yDst = Math.round(top0 + st.L * neckW(nTop) * s * dpr);
    for (let r0 = 0; r0 < rowsN; r0 += bandH) {
      const hh = Math.min(bandH, rowsN - r0), yd = nTop + (r0 + hh / 2) / k, w = neckW(yd);
      const nextY = Math.round(top0 + (r0 + hh) + st.L * neckW(nTop + (r0 + hh) / k) * s * dpr);
      const xd = left0 + fx * st.B * w * s * dpr;
      if (nextY > yDst) g.drawImage(neckCv, 0, r0, neckCv.width, hh, xd, yDst, neckCv.width, nextY - yDst);
      yDst = nextY;
    }

    // glava: jedna slika, zarotirana i okrenuta
    const mirrored = fx * cY < 0;
    headMatrix();
    g.drawImage(mirrored ? headCvM : headCv, HB[0], HB[1], HB[2], HB[3]);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    // zelene riječi
    if (o.words && intro > 1.2) {
      g.font = '700 ' + fontPx + 'px "Space Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (const [wd, x, y] of words) { neckPt(x, y, neckW(y), tmp); const m = g.measureText(wd).width; g.fillStyle = 'rgba(0,0,0,.88)'; g.fillRect(tmp[0] - m / 2 - 4, tmp[1] - fontPx * 0.75, m + 8, fontPx * 1.5); g.fillStyle = GREEN; g.fillText(wd, tmp[0], tmp[1] + 0.5); }
    }

    // obrisi (crtaju se nakon što se znakovi slože)
    const op = intro >= 1.8 ? 1 : Math.max(0, (intro - 1.2) / 0.6);
    if (op <= 0) return;
    const lw = Math.max(1, s / 0.93);
    if (!LEN.neck) LEN.neck = pathLenD(G.neck) * s;
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
    // obris vrata, ali ne preko glave
    g.save();
    headMatrix(); const clip = new Path2D(); clip.rect(-5000, -5000, 10000, 10000); clip.addPath(P_HEAD); g.clip(clip, 'evenodd');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.setLineDash(dash(LEN.neck)); g.lineWidth = 1.6 * lw; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke(neckPath(G.neck));
    g.restore();
    // glava: uho, rogovi, obris, oko, trepavice, nozdrva, usta (sve u prostoru glave)
    headMatrix();
    const u = 1 / s;                                   // jedan piksel ekrana u prostoru glave
    g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = '#fff'; g.fillStyle = '#0a0a0a';
    g.lineWidth = 2.2 * lw * u; g.setLineDash(dash(200));
    g.fill(P_EAR); g.stroke(P_EAR);
    for (let q = 0; q < 2; q++) {
      g.fillStyle = '#0a0a0a'; g.fill(P_HORNS[q]); g.stroke(P_HORNS[q]);
      g.globalAlpha = o.alpha * op; g.fillStyle = '#fff'; g.beginPath(); g.arc(HORNS[q][2], HORNS[q][3], 12, 0, 6.2832); g.fill(); g.globalAlpha = o.alpha;
    }
    g.setLineDash(dash(LEN.head)); g.lineWidth = 2.4 * lw * u; g.stroke(P_HEAD);
    g.setLineDash([]);
    g.globalAlpha = o.alpha * op;
    let bl = 1; if (blinkT >= 0) { const q = (now - blinkT) / 160; bl = q >= 1 ? 1 : 1 - 0.9 * Math.sin(q * Math.PI); }
    g.save(); g.translate(EYE_C[0], EYE_C[1]); g.scale(1, bl); g.translate(-EYE_C[0], -EYE_C[1]); g.fillStyle = '#fff'; g.fill(P_EYE); g.restore();
    g.lineWidth = 1.6 * lw * u; g.beginPath();
    for (const [a, b, c, d] of LASHES) { g.moveTo(a, b); g.lineTo(c, d); }
    g.stroke();
    g.lineWidth = 2.2 * lw * u; g.stroke(P_NOSTRIL);
    g.lineWidth = 1.8 * lw * u; g.stroke(P_MOUTH);
    // zjenica prema kursoru (na ekranu), linija pogleda
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    headPt(EYE_C[0], EYE_C[1], tmp); const ex = tmp[0], ey = tmp[1], ac = Math.abs(cY);
    if (bl > 0.4 && ac > 0.25) {
      let dx, dy = 0; if (ptr.x >= 0) { const d = Math.hypot(ptr.x - ex, ptr.y - ey) || 1; dx = (ptr.x - ex) / d; dy = (ptr.y - ey) / d; } else { dx = -fx; }
      const px = ex + dx * 3.5 * s * ac, py = ey + dy * 2.5 * s;
      g.fillStyle = '#000'; g.beginPath(); g.ellipse(px, py, 5 * s * bl * ac, 5 * s * bl, 0, 0, 6.2832); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(px - 1.5 * s * ac, py - 1.5 * s, 1.5 * s, 0, 6.2832); g.fill();
    }
    if (o.sight && ptr.inside) { g.setLineDash([3, 6]); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ptr.x, ptr.y); g.stroke(); g.setLineDash([]); }
    g.globalAlpha = 1;
  }

  function tick(now) {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.max(0.001, (now - last) / 1000); last = now;
    // slabiji računar: ako su kadrovi duži od 24 ms dvije sekunde, slika se crta u manjoj rezoluciji (jednom)
    slow = dt > 0.024 ? slow + dt : Math.max(0, slow - dt);
    if (slow > 2 && dprCap > 1 && dpr > 1) { dprCap = 1; slow = 0; resize(); }
    physics(dt, now);
    if (drawnTo >= N && now - lastTick > 83) {          // kod "teče": 12 promjena u sekundi, prepisuju se samo ta polja
      lastTick = now;
      const n = Math.max(1, Math.round(N * 0.03));
      for (let q = 0; q < n; q++) { const i = (rr() * N) | 0; ch[i] = bk[i] ? (rr() * SPOT_CH.length) | 0 : SPOT_CH.length + ((rr() * GAP_CH.length) | 0); paintCell(i, true); }
    }
    if (now > blinkAt) { blinkT = now; blinkAt = now + 4000 + rr() * 3000; }
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
    },
    state: () => ({ B: st.B, T: st.T, Y: st.Y, faceLeft })
  };
}
