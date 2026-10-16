/*
 * Teksture nacrtane na canvasu: plakat "SKOČI." (skakač sa Starog mosta), brojčanik sata,
 * ceduljice na monitoru, prozorčić kasete i ekran telefonske sekretarice.
 */
import * as THREE from 'three';

function tex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData.canvas = c; t.userData.ctx = g;
  return t;
}

function poster() {
  return tex(512, 728, (g, w, h) => {
    // nebo u sumrak, Neretva tirkizna, most bijeli kamen
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0b1030'); sky.addColorStop(0.5, '#1b2a5c'); sky.addColorStop(0.72, '#3a4f86'); sky.addColorStop(0.74, '#0f6b78'); sky.addColorStop(1, '#063a46');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(220,230,255,' + (0.2 + Math.random() * 0.5) + ')'; g.fillRect(Math.random() * w, Math.random() * h * 0.45, 1.5, 1.5); }
    // obale
    g.fillStyle = '#121a33';
    g.beginPath(); g.moveTo(0, 470); g.lineTo(70, 440); g.lineTo(120, 480); g.lineTo(140, 540); g.lineTo(0, 560); g.fill();
    g.beginPath(); g.moveTo(w, 455); g.lineTo(w - 80, 438); g.lineTo(w - 118, 482); g.lineTo(w - 140, 540); g.lineTo(w, 560); g.fill();
    // Stari most: jedan luk između dvije kule
    g.fillStyle = '#d9d2c0';
    g.fillRect(40, 380, 70, 110); g.fillRect(w - 110, 372, 70, 118);
    g.beginPath(); g.moveTo(96, 420); g.quadraticCurveTo(w / 2, 300, w - 96, 420); g.lineTo(w - 96, 440); g.quadraticCurveTo(w / 2, 335, 96, 440); g.fill();
    g.beginPath(); g.moveTo(110, 490); g.quadraticCurveTo(w / 2, 330, w - 110, 490); g.lineTo(w - 110, 470); g.quadraticCurveTo(w / 2, 318, 110, 470); g.fill();
    g.fillStyle = '#b6ae9b'; g.fillRect(44, 372, 62, 10); g.fillRect(w - 106, 364, 62, 10);
    // odsjaj u vodi
    g.fillStyle = 'rgba(217,210,192,0.18)'; for (let i = 0; i < 9; i++) g.fillRect(150 + Math.random() * 210, 560 + i * 16, 40 + Math.random() * 60, 3);
    // skakač u lastavičjem skoku
    g.save(); g.translate(w / 2, 225); g.rotate(-0.15); g.fillStyle = '#f2ece0';
    g.beginPath(); g.ellipse(0, 0, 9, 46, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(0, -56, 10, 0, Math.PI * 2); g.fill();
    g.lineWidth = 7; g.lineCap = 'round'; g.strokeStyle = '#f2ece0';
    g.beginPath(); g.moveTo(-4, -30); g.lineTo(-70, -48); g.moveTo(4, -30); g.lineTo(70, -48); g.stroke();
    g.beginPath(); g.moveTo(-3, 40); g.lineTo(-6, 92); g.moveTo(3, 40); g.lineTo(6, 92); g.stroke();
    g.restore();
    // natpis
    g.fillStyle = '#e0303d'; g.font = '600 118px "Inter Tight", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
    g.fillText('SKOČI.', w / 2, 38);
    g.fillStyle = 'rgba(242,236,224,0.85)'; g.font = '500 22px "Inter Tight", sans-serif';
    g.fillText('STARI MOST · MOSTAR', w / 2, 168);
    g.fillStyle = 'rgba(242,236,224,0.6)'; g.font = '400 18px "Inter Tight", sans-serif'; g.fillText('GRABA', w / 2, h - 46);
    // patina
    for (let i = 0; i < 2600; i++) { g.fillStyle = 'rgba(0,0,0,' + Math.random() * 0.12 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  });
}

function clock() {
  // tamni brojčanik sa svijetlim crticama (uz neone pored sata)
  return tex(256, 256, (g, w) => {
    g.fillStyle = '#0b0e1f'; g.fillRect(0, 0, w, w);
    const r = g.createRadialGradient(w / 2, w / 2, 10, w / 2, w / 2, w / 2); r.addColorStop(0, '#151a33'); r.addColorStop(1, '#0b0e1f');
    g.fillStyle = r; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 8, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 60; i++) {
      const a = i / 60 * Math.PI * 2, r1 = w / 2 - 16, r2 = r1 - (i % 5 ? 6 : 18);
      g.strokeStyle = i % 5 ? 'rgba(160,190,230,0.45)' : '#bff6fb';
      g.lineWidth = i % 5 ? 2 : 6;
      g.beginPath(); g.moveTo(w / 2 + Math.sin(a) * r1, w / 2 - Math.cos(a) * r1); g.lineTo(w / 2 + Math.sin(a) * r2, w / 2 - Math.cos(a) * r2); g.stroke();
    }
    g.fillStyle = '#9ff6fb'; g.font = '500 20px "Inter Tight", sans-serif'; g.textAlign = 'center'; g.fillText('MOSTAR', w / 2, w / 2 + 52);
    g.fillStyle = '#ff4f5e'; g.beginPath(); g.arc(w / 2, w / 2, 6, 0, Math.PI * 2); g.fill();
  });
}

function note(label, i) {
  return tex(128, 128, (g, w, h) => {
    g.fillStyle = ['#f2dc5d', '#efd453', '#f4e06a', '#ecd04c'][i]; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, 0, w, 14);
    g.fillStyle = '#1b2050'; g.font = '30px VT323, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const parts = label.split(' ');
    parts.forEach((p, k) => g.fillText(p, w / 2, h / 2 + (k - (parts.length - 1) / 2) * 30));
    g.strokeStyle = 'rgba(27,32,80,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(24, h - 22); g.lineTo(w - 24, h - 26); g.stroke();
  });
}

function cassette() {
  return tex(256, 128, (g, w, h) => {
    g.fillStyle = '#d6d0c2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c2141f'; g.fillRect(0, 18, w, 14);
    g.fillStyle = '#1b1c26'; g.fillRect(40, 48, w - 80, 52);
    g.fillStyle = '#d6d0c2'; [80, w - 80].forEach((x) => { g.beginPath(); g.arc(x, 74, 18, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#1b1c26'; [80, w - 80].forEach((x) => { g.beginPath(); g.arc(x, 74, 7, 0, Math.PI * 2); g.fill(); });
    g.font = '22px VT323, monospace'; g.fillStyle = '#1b1c26'; g.textAlign = 'center'; g.fillText('GRABA MIX · 3 AM', w / 2, 16);
  });
}

function answering() {
  return tex(128, 64, (g, w, h) => {
    g.fillStyle = '#100406'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ff3b3b'; g.font = '52px VT323, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = '#ff3b3b'; g.shadowBlur = 10; g.fillText('01', w / 2, h / 2 + 2);
  });
}

export function makeTextures() {
  return {
    posterTexture: poster(),
    clockTexture: (() => { const t = clock(); t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; return t; })(),
    noteTextures: ['WEB SITES', 'FULL STACK', 'MOBILE APPS', 'SEO + CARE'].map(note),
    cassetteTexture: cassette(),
    amTexture: answering()
  };
}
