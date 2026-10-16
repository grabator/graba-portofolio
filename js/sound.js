/*
 * Zvuk sobe, sav napravljen u WebAudio (bez audio fajlova): tihi ambijent, mjehurići u akvarijumu,
 * kiša, zujanje monitora, zvono telefona, pištanje sekretarice, disketa i tipke.
 * Isključen je po defaultu; izbor se pamti u localStorage.
 */
let ctx = null, master = null, rainGain = null, on = false, bubbleTimer = 0, raining = false;

function noiseBuffer(sec = 2) {
  const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function start() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  // ambijent: dva niska, malo raštimana tona kroz filter koji polako diše
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320; lp.Q.value = 0.7;
  const amb = ctx.createGain(); amb.gain.value = 0.07; lp.connect(amb); amb.connect(master);
  [55, 82.4, 110.6].forEach((f, i) => { const o = ctx.createOscillator(); o.type = i === 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = (i - 1) * 7; const gg = ctx.createGain(); gg.gain.value = i === 2 ? 0.25 : 0.6; o.connect(gg); gg.connect(lp); o.start(); });
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lfoG = ctx.createGain(); lfoG.gain.value = 140; lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();
  // zujanje monitora
  const hum = ctx.createOscillator(); hum.type = 'sawtooth'; hum.frequency.value = 50;
  const humF = ctx.createBiquadFilter(); humF.type = 'lowpass'; humF.frequency.value = 180;
  const humG = ctx.createGain(); humG.gain.value = 0.012; hum.connect(humF); humF.connect(humG); humG.connect(master); hum.start();
  // kiša: šum kroz dva filtera
  const rn = ctx.createBufferSource(); rn.buffer = noiseBuffer(3); rn.loop = true;
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 700;
  const bp = ctx.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 5200;
  rainGain = ctx.createGain(); rainGain.gain.value = raining ? 0.09 : 0;
  rn.connect(hp); hp.connect(bp); bp.connect(rainGain); rainGain.connect(master); rn.start();
}
function bubble() {
  if (!on || !ctx) return;
  const t = ctx.currentTime, o = ctx.createOscillator(), gg = ctx.createGain();
  const f = 380 + Math.random() * 520;
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 2.2, t + 0.06);
  gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(0.035, t + 0.008); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  o.connect(gg); gg.connect(master); o.start(t); o.stop(t + 0.1);
  bubbleTimer = setTimeout(bubble, 120 + Math.random() * (Math.random() < 0.2 ? 2400 : 500));
}
function tone(freq, dur, vol = 0.05, type = 'sine', when = 0) {
  if (!on || !ctx) return;
  const t = ctx.currentTime + when, o = ctx.createOscillator(), gg = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(vol, t + 0.01); gg.gain.setValueAtTime(vol, t + dur - 0.02); gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(gg); gg.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
function click(vol = 0.06, when = 0, f = 2400) {
  if (!on || !ctx) return;
  const t = ctx.currentTime + when, s = ctx.createBufferSource(); s.buffer = noiseBuffer(0.03);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 2;
  const gg = ctx.createGain(); gg.gain.value = vol; s.connect(bp); bp.connect(gg); gg.connect(master); s.start(t);
}

export const sound = {
  get on() { return on; },
  set(v) {
    on = !!v;
    try { localStorage.setItem('graba-sound', on ? '1' : '0'); } catch (e) { /* privatni prozor */ }
    if (on) { start(); if (!ctx) { on = false; return; } ctx.resume(); master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4); clearTimeout(bubbleTimer); bubble(); }
    else if (ctx) { master.gain.setTargetAtTime(0, ctx.currentTime, 0.15); clearTimeout(bubbleTimer); }
  },
  saved() { try { return localStorage.getItem('graba-sound') === '1'; } catch (e) { return false; } },
  rain(v) { raining = v; if (rainGain && ctx) rainGain.gain.setTargetAtTime(v ? 0.09 : 0, ctx.currentTime, 1); },
  // evropsko zvono: 425 Hz sa brzim treperenjem, dva kratka zvonjenja
  ring() { for (let k = 0; k < 2; k++) for (let i = 0; i < 18; i++) { tone(425 + (i % 2) * 55, 0.045, 0.045, 'square', k * 0.9 + i * 0.05); } },
  beep() { tone(1100, 0.35, 0.05, 'sine'); },
  dial(n) { for (let i = 0; i < n; i++) click(0.05, i * 0.07, 1800); },
  floppy() { for (let i = 0; i < 9; i++) click(0.07, i * 0.09 + (i > 4 ? 0.2 : 0), 900 + (i % 3) * 300); },
  key() { click(0.04, 0, 3200); },
  // klokotanje vode u nargili dok se vuče
  gurgle(v = 0.5) { for (let i = 0; i < 3; i++) tone(90 + Math.random() * 90 + v * 40, 0.06, 0.025 + v * 0.02, 'sine', i * 0.05); },
  splash() { click(0.08, 0, 600); click(0.05, 0.05, 1200); },
  lamp() { click(0.09, 0, 1500); }
};
