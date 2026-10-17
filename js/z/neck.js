/*
 * Vrat kroz dio "Radovi": dugačka traka od znakova koda koja raste nadolje dok se skrola.
 * Canvas je "sticky" (visok koliko ekran) i crta samo dio vrata koji se trenutno vidi.
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
  function buildAtlas() {
    const all = SPOT_CH + GAP_CH; cw = Math.ceil(11 * 0.8 * dpr) + 2; chh = Math.ceil(11 * 1.4 * dpr);
    atlas = document.createElement('canvas'); atlas.width = cw * all.length; atlas.height = chh;
    const a = atlas.getContext('2d'); a.fillStyle = '#fff'; a.font = (11 * dpr) + 'px "Space Mono", monospace'; a.textAlign = 'center'; a.textBaseline = 'middle';
    for (let i = 0; i < all.length; i++) a.fillText(all[i], i * cw + cw / 2, chh / 2);
  }
  function resize() {
    const rc = canvas.getBoundingClientRect(); W = rc.width; H = rc.height;
    dpr = Math.min(devicePixelRatio || 1, 1.5); canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    build(); buildAtlas(); measure(); reveal = reduced ? len : Math.min(reveal, target); draw();
  }
  function measure() {
    const top = host.getBoundingClientRect().top;
    target = reduced ? len : Math.max(0, Math.min(len, innerHeight * 0.72 - top));
  }
  const alpha = [0.16, ...Array.from({ length: 10 }, (_, k) => 0.55 + k / 22)];
  function draw() {
    const top = host.getBoundingClientRect().top;          // vrh trake u odnosu na ekran
    const cTop = canvas.getBoundingClientRect().top;       // sticky canvas
    const off = cTop - top;                                // koliko je trake iznad canvasa
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, canvas.width, canvas.height);
    const y0 = Math.max(0, Math.floor(off / STEP_Y) - 1), y1 = Math.min(rows, Math.ceil((off + H) / STEP_Y) + 1);
    const lim = reveal;
    let lastA = -1;
    for (let j = y0; j < y1; j++) {
      const y = j * STEP_Y + STEP_Y / 2; if (y > lim) break;
      const c = cx(y), sy = (y - off) * dpr;
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i, b = cellB[k];
        if (b !== lastA) { g.globalAlpha = alpha[b]; lastA = b; }
        const x = (c - half + STEP_X / 2 + i * STEP_X) * dpr;
        g.drawImage(atlas, cellCh[k] * cw, 0, cw, chh, x - cw / 2, sy - chh / 2, cw, chh);
      }
    }
    g.globalAlpha = 1; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // ivice vrata i griva
    const a = Math.max(0, off - 20), bEnd = Math.min(lim, off + H + 20);
    if (bEnd > a) {
      g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.6; g.beginPath();
      for (let y = a; y <= bEnd; y += 6) { const x = cx(y) - half - 4; if (y === a) g.moveTo(x, y - off); else g.lineTo(x, y - off); }
      g.stroke(); g.beginPath();
      for (let y = a; y <= bEnd; y += 6) { const x = cx(y) + half + 4; if (y === a) g.moveTo(x, y - off); else g.lineTo(x, y - off); }
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath();
      for (let y = Math.ceil(a / 14) * 14; y <= bEnd; y += 14) { const x = cx(y) + half + 6, l = 6 + ((y / 14) % 3) * 3; g.moveTo(x, y - off); g.lineTo(x + l, y - off - 2); }
      g.stroke();
      // čelo rasta: svijetla linija gdje vrat trenutno raste
      if (lim < len - 2 && lim > off && lim < off + H) {
        const y = lim - off, c = cx(lim), gr = g.createLinearGradient(c - half - 30, 0, c + half + 30, 0);
        gr.addColorStop(0, 'rgba(125,255,176,0)'); gr.addColorStop(0.5, 'rgba(125,255,176,.9)'); gr.addColorStop(1, 'rgba(125,255,176,0)');
        g.fillStyle = gr; g.fillRect(c - half - 30, y - 1, half * 2 + 60, 2);
      }
    }
  }
  function tick(now) {
    raf = 0; if (!running) return; raf = requestAnimationFrame(tick);
    measure();
    reveal += (target - reveal) * 0.12;
    if (Math.abs(target - reveal) < 0.5) reveal = target;
    onReveal(reveal);
    if (now - lastTick > 83) { lastTick = now; const n = Math.round(cols * Math.min(rows, Math.ceil(H / STEP_Y)) * 0.04); const j0 = Math.max(0, Math.floor((canvas.getBoundingClientRect().top - host.getBoundingClientRect().top) / STEP_Y)); for (let q = 0; q < n; q++) { const k = (j0 + ((r() * (H / STEP_Y)) | 0)) * cols + ((r() * cols) | 0); if (k < cellCh.length) cellCh[k] = cellB[k] ? (r() * SPOT_CH.length) | 0 : SPOT_CH.length + ((r() * GAP_CH.length) | 0); } }
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
