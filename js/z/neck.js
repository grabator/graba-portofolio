/*
 * Vrat kroz dio "Radovi": dugačka traka od znakova koda koja raste nadolje dok se skrola.
 * Cijela traka se iscrta jednom u visoku sliku; "sticky" canvas (visok koliko ekran) iz nje svaki kadar
 * prepiše samo dio koji se trenutno vidi.
 */
const SPOT_CH = '01{}[]<>/=+*;:$#&', GAP_CH = '·.:';

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function inPoly(poly, x, y) { let c = false; for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) { const xi = poly[i], yi = poly[i + 1], xj = poly[j], yj = poly[j + 1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; }

/**
 * host: element koji nosi canvas (visok koliko cijela traka vrata)
 * canvas: sticky canvas unutar hosta
 * onReveal(y): javlja dokle je vrat narastao (u pikselima od vrha hosta)
 */
export function createNeckStrip(host, canvas, onReveal) {
  const g = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, len = 0, half = 75, atlas = null, cw = 0, chh = 0;
  let cols = 0, rows = 0, cellCh = null, cellB = null, reveal = 0, target = 0, raf = 0, running = false, lastTick = 0;
  const STEP_X = 7.6, STEP_Y = 12;
  const r = rng(5);
  const cx = (y) => W / 2 + Math.sin(y * 0.0016) * 18;

  function build() {
    const rect = host.getBoundingClientRect();
    len = rect.height; half = innerWidth < 768 ? 45 : 75;
    const D3 = globalThis.d3;
    // mrlje u traci (tačke relativno na sredinu vrata)
    const rr = rng(7), arr = [], grid = new Map(), C = 30, key = (i, j) => i * 100000 + j;
    const tries = Math.ceil((half * 2 * len) / (C * C)) * 30;
    for (let t = 0; t < tries; t++) {
      const x = (rr() * 2 - 1) * half, y = rr() * len, gi = Math.floor((x + half) / C), gj = Math.floor(y / C);
      let ok = true;
      for (let di = -1; di <= 1 && ok; di++) for (let dj = -1; dj <= 1 && ok; dj++) { const q = grid.get(key(gi + di, gj + dj)); if (q) for (const [px, py] of q) if (Math.hypot(px - x, py - y) < C) { ok = false; break; } }
      if (!ok) continue;
      const k = key(gi, gj); if (!grid.has(k)) grid.set(k, []); grid.get(k).push([x, y]); arr.push([x, y]);
    }
    const flat = Float64Array.from(arr.flat());
    const del = new D3.Delaunay(flat), vor = del.voronoi([-half - 10, -10, half + 10, len + 10]);
    const spots = arr.map(([px, py], i) => { const poly = vor.cellPolygon(i); if (!poly) return null; const k = 0.72 + rr() * 0.08; return Float32Array.from(poly.flatMap(([x, y]) => [px + (x - px) * k, py + (y - py) * k])); });
    cols = Math.floor((half * 2) / STEP_X); rows = Math.ceil(len / STEP_Y);
    cellCh = new Uint8Array(cols * rows); cellB = new Uint8Array(cols * rows);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = -half + STEP_X / 2 + i * STEP_X, y = j * STEP_Y + STEP_Y / 2, k = j * cols + i;
      const si = del.find(x, y), sp = spots[si];
      cellB[k] = sp && inPoly(sp, x, y) ? 1 + ((si * 37) % 10) : 0;
      cellCh[k] = cellB[k] ? (r() * SPOT_CH.length) | 0 : SPOT_CH.length + ((r() * GAP_CH.length) | 0);
    }
  }
  let strip = null, sdpr = 1;
  function buildAtlas() {
    const all = SPOT_CH + GAP_CH; cw = Math.ceil(11 * 0.8 * dpr) + 2; chh = Math.ceil(11 * 1.4 * dpr);
    atlas = document.createElement('canvas'); atlas.width = cw * all.length; atlas.height = chh;
    const a = atlas.getContext('2d'); a.fillStyle = '#fff'; a.font = (11 * dpr) + 'px "Space Mono", monospace'; a.textAlign = 'center'; a.textBaseline = 'middle';
    for (let i = 0; i < all.length; i++) a.fillText(all[i], i * cw + cw / 2, chh / 2);
  }
  // cijela traka (znakovi, ivice, griva) se iscrta jednom u jednu visoku sliku
  const cwC = () => Math.floor(STEP_X * sdpr), chC = () => Math.floor(STEP_Y * sdpr);
  function paint(k, clear) {
    const j = (k / cols) | 0, i = k - j * cols, y = j * STEP_Y + STEP_Y / 2, x = cx(y) - half + STEP_X / 2 + i * STEP_X;
    const c = strip.getContext('2d'), w = cwC(), h = chh > chC() ? chC() : chh, px = Math.round(x * sdpr - w / 2), py = Math.round(y * sdpr - h / 2);
    if (clear) c.clearRect(px, py, w, h);
    c.globalAlpha = alpha[cellB[k]];
    c.drawImage(atlas, cellCh[k] * cw + ((cw - w) >> 1), (chh - h) >> 1, w, h, px, py, w, h);
  }
  function buildStrip() {
    sdpr = Math.min(dpr, 16000 / Math.max(1, len));
    strip = document.createElement('canvas'); strip.width = Math.ceil(W * sdpr); strip.height = Math.ceil(len * sdpr);
    const c = strip.getContext('2d');
    for (let k = 0; k < cols * rows; k++) paint(k, false);
    c.globalAlpha = 1; c.setTransform(sdpr, 0, 0, sdpr, 0, 0);
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.6;
    for (const side of [-1, 1]) { c.beginPath(); for (let y = 0; y <= len; y += 6) { const x = cx(y) + side * (half + 4); if (y) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); }
    c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath();
    for (let y = 0; y <= len; y += 14) { const x = cx(y) + half + 6, l = 6 + ((y / 14) % 3) * 3; c.moveTo(x, y); c.lineTo(x + l, y - 2); }
    c.stroke(); c.setTransform(1, 0, 0, 1, 0, 0);
  }
  function resize() {
    const rc = canvas.getBoundingClientRect(); W = rc.width; H = rc.height;
    dpr = Math.min(devicePixelRatio || 1, 1.5); canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    build(); buildAtlas(); buildStrip(); measure(); reveal = reduced ? len : Math.min(reveal, target); draw();
  }
  function measure() {
    const top = host.getBoundingClientRect().top;
    target = reduced ? len : Math.max(0, Math.min(len, innerHeight * 0.72 - top));
  }
  const alpha = [0.16, ...Array.from({ length: 10 }, (_, k) => 0.55 + k / 22)];
  let off = 0;
  function draw() {
    off = canvas.getBoundingClientRect().top - host.getBoundingClientRect().top;   // koliko je trake iznad sticky canvasa
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, canvas.width, canvas.height);
    const lim = reveal, y0 = Math.max(0, off), y1 = Math.min(lim, off + H);
    if (y1 > y0) {
      const k = dpr / sdpr;
      g.drawImage(strip, 0, y0 * sdpr, strip.width, (y1 - y0) * sdpr, 0, (y0 - off) * dpr, strip.width * k, (y1 - y0) * dpr);
    }
    // čelo rasta: svijetla linija gdje vrat trenutno raste
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (lim < len - 2 && lim > off && lim < off + H) {
      const y = lim - off, c = cx(lim), gr = g.createLinearGradient(c - half - 30, 0, c + half + 30, 0);
      gr.addColorStop(0, 'rgba(125,255,176,0)'); gr.addColorStop(0.5, 'rgba(125,255,176,.9)'); gr.addColorStop(1, 'rgba(125,255,176,0)');
      g.fillStyle = gr; g.fillRect(c - half - 30, y - 1, half * 2 + 60, 2);
    }
  }
  function tick(now) {
    raf = 0; if (!running) return; raf = requestAnimationFrame(tick);
    measure();
    reveal += (target - reveal) * 0.12;
    if (Math.abs(target - reveal) < 0.5) reveal = target;
    onReveal(reveal);
    if (now - lastTick > 83) {
      lastTick = now; const j0 = Math.max(0, Math.floor(off / STEP_Y)), vis = Math.min(rows - j0, Math.ceil(H / STEP_Y)), n = Math.round(cols * vis * 0.03);
      for (let q = 0; q < n; q++) { const k = (j0 + ((r() * vis) | 0)) * cols + ((r() * cols) | 0); if (k < cellCh.length) { cellCh[k] = cellB[k] ? (r() * SPOT_CH.length) | 0 : SPOT_CH.length + ((r() * GAP_CH.length) | 0); paint(k, true); } }
    }
    draw();
  }
  let visible = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
  function sync() {
    const want = visible && !document.hidden;
    if (want && !running) { running = true; raf = requestAnimationFrame(tick); }
    if (!want && running) { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  }
  const ro = new ResizeObserver(() => resize());
  const onVis = () => sync();
  return {
    start() { resize(); ro.observe(host); io.observe(host); document.addEventListener('visibilitychange', onVis); if (reduced) onReveal(len); },
    stop() { running = false; if (raf) cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis); }
  };
}
