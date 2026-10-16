/*
 * Ekran starog računara: canvas 640x480 koji se crta kao tekstura na CRT monitor.
 * Stanja: meni programa, učitavanje, slika projekta (dithering), terminal i spisak za godinu.
 */
import * as THREE from 'three';

const W = 640, H = 480;
const GREEN = '#6dffa0', DIM = '#2f8f5a', BG = '#03120a', AMBER = '#ffc46b';
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export function createCRT(PF) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const texture = new THREE.CanvasTexture(cv);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter; texture.generateMipmaps = false;

  let lang = 'en';
  let state = 'menu', sel = 0, loadStart = 0, project = null, year = null, yearList = [];
  let termLines = [], termInput = '';
  let dirty = true, lastBlink = -1;
  const shots = {};   // id -> canvas sa ditheringom

  const font = (px) => px + 'px VT323, "JetBrains Mono", monospace';
  function text(s, x, y, px = 26, color = GREEN, align = 'left') {
    g.font = font(px); g.textAlign = align; g.textBaseline = 'top';
    g.fillStyle = color; g.shadowColor = color; g.shadowBlur = 8;
    g.fillText(s, x, y); g.shadowBlur = 0;
  }
  function frame(title) {
    g.fillStyle = BG; g.fillRect(0, 0, W, H);
    g.fillStyle = GREEN; g.fillRect(28, 26, W - 56, 32);
    g.font = font(26); g.fillStyle = BG; g.textBaseline = 'top'; g.textAlign = 'left'; g.fillText(title, 40, 29);
    g.textAlign = 'right'; g.fillText('GRABA OS', W - 40, 29);
  }
  function finish(t) {
    // linije skeniranja i tamnije ivice
    g.fillStyle = 'rgba(0,0,0,0.28)';
    for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    const roll = (t * 60) % (H + 80) - 40;
    const r = g.createLinearGradient(0, roll - 40, 0, roll + 40);
    r.addColorStop(0, 'rgba(110,255,160,0)'); r.addColorStop(0.5, 'rgba(110,255,160,0.05)'); r.addColorStop(1, 'rgba(110,255,160,0)');
    g.fillStyle = r; g.fillRect(0, roll - 40, W, 80);
  }
  const L = () => PF[lang].room;
  const blinkOn = (t) => Math.floor(t * 2) % 2 === 0;

  function drawMenu(t) {
    frame('C:\\GRABA\\' + L().programs.toUpperCase());
    PF.work.forEach((w, i) => {
      const y = 78 + i * 38, on = i === sel;
      if (on) { g.fillStyle = 'rgba(109,255,160,0.16)'; g.fillRect(36, y - 3, W - 72, 34); }
      text((on ? '> ' : '  ') + (i + 1) + '. ' + PF.exe[w.id], 44, y, 30, on ? GREEN : DIM);
      text(w.year, W - 48, y, 26, on ? AMBER : DIM, 'right');
    });
    text('C:\\GRABA>' + (blinkOn(t) ? '_' : ''), 44, 430, 28, GREEN);
  }
  function drawLoading(t) {
    frame('C:\\GRABA');
    const p = Math.min(1, (performance.now() - loadStart) / 900);
    text(L().loadingExe + ' ' + PF.exe[project], 60, 150, 36);
    g.strokeStyle = GREEN; g.lineWidth = 2; g.strokeRect(60, 220, W - 120, 36);
    const n = Math.floor(p * 28);
    g.fillStyle = GREEN; for (let i = 0; i < n; i++) g.fillRect(66 + i * 18.5, 226, 14, 24);
    text(Math.round(p * 100) + '%', W / 2, 280, 30, DIM, 'center');
    if (p >= 1) { state = 'project'; }
    dirty = true;
  }
  function drawProject(t) {
    const w = PF.work.find((x) => x.id === project);
    const it = PF[lang].items[project];
    frame(PF.exe[project]);
    const shot = shots[project];
    if (shot) {
      g.imageSmoothingEnabled = false;
      g.drawImage(shot, 36, 70, W - 72, (W - 72) * 9 / 16);
      g.imageSmoothingEnabled = true;
    } else {
      art(w, 36, 70, W - 72, (W - 72) * 9 / 16);
    }
    text(it[0].toUpperCase(), 40, 402, 34);
    text(it[1] + ' · ' + w.year, 40, 436, 24, DIM);
    if (blinkOn(t)) text('_', W - 50, 436, 26);
  }
  // za projekte bez slike: ASCII crtež na ekranu
  function art(w, x, y, ww, hh) {
    g.strokeStyle = DIM; g.lineWidth = 2; g.strokeRect(x, y, ww, hh);
    if (w.art === 'map') {
      text('+  +  +  +  +  +  +  +', x + ww / 2, y + 40, 30, DIM, 'center');
      text('[+] 24h', x + ww / 2, y + 110, 70, GREEN, 'center');
      text('+  +  +  +  +  +  +  +', x + ww / 2, y + 220, 30, DIM, 'center');
    } else {
      const cols = [4, 7, 5, 9, 6, 8, 10];
      cols.forEach((c, i) => { g.fillStyle = i === 6 ? AMBER : GREEN; g.fillRect(x + 50 + i * 70, y + hh - 30 - c * 20, 44, c * 20); });
      text('PTS', x + ww - 30, y + 24, 34, AMBER, 'right');
    }
  }
  function drawTerm(t) {
    frame('C:\\GRABA\\TERMINAL');
    const max = 11, lines = termLines.slice(-max);
    lines.forEach((l, i) => text(l, 44, 74 + i * 30, 26, l.startsWith('C:\\') ? DIM : GREEN));
    text('C:\\GRABA>' + termInput + (blinkOn(t) ? '_' : ''), 44, 74 + lines.length * 30 + 4, 28, GREEN);
  }
  function drawYear(t) {
    frame('A:\\' + year);
    text(L().disk + ' ' + year, 44, 78, 40, AMBER);
    yearList.forEach((w, i) => {
      const y = 140 + i * 40;
      text(PF.exe[w.id], 44, y, 30);
      text(PF[lang].items[w.id][1].split(' · ')[0], W - 48, y, 24, DIM, 'right');
    });
    text('A:\\>' + (blinkOn(t) ? '_' : ''), 44, 430, 28);
  }

  function update(t) {
    const b = Math.floor(t * 2);
    if (b !== lastBlink) { lastBlink = b; dirty = true; }
    if (!dirty) return;
    dirty = false;
    if (state === 'menu') drawMenu(t);
    else if (state === 'loading') drawLoading(t);
    else if (state === 'project') drawProject(t);
    else if (state === 'term') drawTerm(t);
    else if (state === 'year') drawYear(t);
    finish(t);
    texture.needsUpdate = true;
  }

  // slika projekta u smanjenoj rezoluciji, uređena (Bayer) dithering paleta
  function dither(id, src) {
    if (shots[id] || !src) return;
    const img = new Image();
    img.onload = () => {
      const w = 224, h = 126, c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h), a = d.data, lv = 4, step = 255 / (lv - 1);
      for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
        const i = (yy * w + xx) * 4, th = (BAYER[(yy & 3) * 4 + (xx & 3)] / 16 - 0.5) * step;
        for (let k = 0; k < 3; k++) a[i + k] = Math.round(Math.min(255, Math.max(0, a[i + k] + th)) / step) * step;
      }
      x.putImageData(d, 0, 0);
      shots[id] = c; dirty = true;
    };
    img.src = src;
  }

  return {
    texture, update,
    setLang(l) { lang = l; dirty = true; },
    menu(i) { state = 'menu'; if (i != null) sel = i; dirty = true; },
    select(i) { sel = (i + PF.work.length) % PF.work.length; if (state === 'menu') dirty = true; },
    get selected() { return sel; },
    open(id) {
      const w = PF.work.find((x) => x.id === id); if (!w) return;
      project = id; sel = PF.work.indexOf(w); state = 'loading'; loadStart = performance.now(); dirty = true;
      dither(id, w.img);
    },
    term(lines, input) { state = 'term'; termLines = lines; termInput = input; dirty = true; },
    year(y, list) { state = 'year'; year = y; yearList = list; dirty = true; },
    get state() { return state; },
    preload() { PF.work.forEach((w) => dither(w.id, w.img)); }
  };
}
