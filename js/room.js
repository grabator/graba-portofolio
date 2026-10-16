/*
 * 3D soba: kamera (široki kadar, paralaksa, filmski prilaz predmetu), oznake predmeta,
 * paneli (projekti, kontakt, o meni, kafa, usluge, vremenska linija, tehnologije),
 * terminal na CRT ekranu, zvono telefona, lampa, kvalitet koji se sam prilagođava.
 */
import * as THREE from 'three';
import { buildRoom } from './scene.js';
import { createPost } from './post.js';
import { createCRT } from './crt.js';
import { makeTextures } from './textures.js';
import { mostarTime, dayPhase, mostarRain } from './mostar.js';
import { creditHTML } from './classic.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const em = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const ext = 'target="_blank" rel="noopener"';

// redoslijed za Tab i oznake: [predmet, grupa, tačka u grupi, strana natpisa]
const HOTS = [
  ['monitor', 'monitor', V(0.18, 0.42, 0.22), 't'],
  ['notes', 'monitor', V(-0.26, 0.39, 0.23), 'l'],
  ['keyboard', 'keyboard', V(0.08, 0.08, 0.02), 'r'],
  ['phone', 'phone', V(0.02, 0.21, 0), 'l'],
  ['answering', 'answering', V(-0.02, 0.1, 0), 'l'],
  ['floppies', 'floppies', V(0, 0.15, 0), 'l'],
  ['coffee', 'coffee', V(-0.02, 0.15, 0), 'r'],
  ['cassette', 'cassette', V(0, 0.19, 0), 'r'],
  ['lamp', 'lamp', V(-0.18, 0.48, -0.07), 'r'],
  ['aquarium', null, V(0.75, 1.72, -3.0), 'r'],
  ['poster', 'poster', V(0.25, 0.45, 0.03), 'r']
];
// krupni kadrovi: [grupa, tačka gledanja u grupi, smjer kamere, udaljenost]
const CLOSE = {
  monitor: ['monitor', V(0, 0.27, 0.2), V(0, 0.08, 1), 0.92],
  notes: ['monitor', V(-0.02, 0.3, 0.2), V(-0.12, 0.05, 1), 1.1],
  phone: ['phone', V(-0.04, 0.08, 0), V(0.2, 0.5, 1), 0.95],
  answering: ['answering', V(0.01, 0.04, 0), V(0.2, 0.7, 1), 0.78],
  coffee: ['coffee', V(-0.02, 0.08, -0.03), V(-0.15, 0.5, 1), 0.78],
  floppies: [null, null, V(0.1, 0.75, 1), 1.15],
  keyboard: ['keyboard', V(0, 0.06, -0.05), V(0, 0.9, 1), 0.8],
  poster: ['poster', V(0, 0, 0), V(0.3, -0.02, 1), 1.65]
};
const ACTIONS = new Set(['aquarium', 'lamp', 'cassette']);

export async function createRoom(o) {
  const { PF, sound, toast, progress, reduced } = o;
  let lang = o.lang;
  const T = () => PF[lang], L = () => PF[lang].room, TT = () => PF[lang].term;
  const canvas = document.getElementById('gl');
  const mobileish = o.coarse || Math.min(innerWidth, innerHeight) < 600;
  const html = document.documentElement;

  try { await Promise.race([Promise.all([document.fonts.load('30px VT323'), document.fonts.load('600 60px "Inter Tight"')]), wait(1500)]); } catch (e) { /* bez fonta */ }
  progress(0.65);

  /* ---------- renderer i scena ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'default', stencil: false });
  renderer.toneMapping = THREE.NoToneMapping;
  // sjene su statične (mjesec i namještaj se ne pomjeraju), pa se mapa sjena crta rijetko i radi i na mobitelu
  const shadowsWanted = true;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = mobileish ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
  const crt = createCRT(PF); crt.setLang(lang);
  const tallNow = () => (canvas.clientWidth || innerWidth) / (canvas.clientHeight || innerHeight) < 0.85;
  const room = buildRoom({ shadows: shadowsWanted, mobile: mobileish, layout: tallNow() ? 'tall' : 'wide', crtTexture: crt.texture, ...makeTextures() });
  const { scene, items } = room;
  const post = createPost(renderer);
  const camera = new THREE.PerspectiveCamera(46, 1, 0.05, 40);
  progress(0.8);

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); running = false; o.onLost(); });

  /* ---------- veličina i kvalitet ---------- */
  let W = 1, H = 1, dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, mobileish ? 1.5 : 2));
  const portrait = () => W / H < 0.85;
  function resize() {
    W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    post.setSize(W, H, dpr);
    camera.aspect = W / H;
    room.setLayout(portrait() ? 'tall' : 'wide');
    room.dustMat.uniforms.uPx.value = dpr;
    if (typeof introP !== 'undefined') lighting();
    if (!focusKey && !tween) setRig(wideView());
    if (focusKey && !tween) setRig(closeView(focusKey), panelOffset());
  }
  const stats = { frames: 0, sum: 0, steps: [] };
  function degrade() {
    if (dpr > 1) { dpr = Math.max(1, dpr - 0.25); stats.steps.push('dpr ' + dpr); resize(); }
    else if (post.bloom) { post.setBloom(false); stats.steps.push('bloom off'); }
    else if (renderer.shadowMap.enabled) {
      renderer.shadowMap.enabled = false; room.lights.moon.castShadow = false; room.flags.shadowsLive = false; lighting();
      scene.traverse((m) => { if (m.material) [].concat(m.material).forEach((x) => { x.needsUpdate = true; }); });
      stats.steps.push('shadows off');
    }
  }
  // prosjek ~90 kadrova (ili 3 sekunde na vrlo sporom uređaju); ako je kadar duži od 25 ms, spusti kvalitet korak po korak
  function quality(ms) {
    if (introP < 1 || ms > 1500) return;
    stats.frames++; stats.sum += ms;
    if (stats.frames >= 90 || stats.sum > 3000) { const avg = stats.sum / stats.frames; stats.avg = Math.round(avg * 10) / 10; stats.frames = 0; stats.sum = 0; if (avg > 25) degrade(); }
  }
  window.grabaRoom = { stats, get dpr() { return dpr; }, get bloom() { return post.bloom; }, get shadows() { return renderer.shadowMap.enabled; } };

  /* ---------- kamera ---------- */
  const rig = { pos: V(0, 1.4, 3), look: V(0, 1.1, -1.5), fov: 46, off: new THREE.Vector2() };
  let tween = null;
  function baseView() {
    return portrait() ? { pos: V(0, 2.25, 1.1), look: V(0, 1.16, -1.3), fov: 70 } : { pos: V(0, 1.36, 1.85), look: V(0, 1.16, -1.6), fov: 50 };
  }
  // pogled i par koraka po sobi: okret glave i pomak su ograničeni da se ne izađe iz kadra
  const UP = V(0, 1, 0), LIM = { yaw: 1.3, pitch: 0.4, x: 1.6, zMin: 0.2, zMax: 3.1 };
  const walk = { x: 0, z: 0, yaw: 0, pitch: 0, tyaw: 0, tpitch: 0, vx: 0, vz: 0, moved: false, reset: false };
  const keysDown = new Set(), joy = { x: 0, y: 0 };
  function wideView() {
    const b = baseView();
    const pos = b.pos.clone().add(V(walk.x, 0, walk.z));
    const dir = b.look.clone().sub(b.pos).applyAxisAngle(UP, walk.yaw);
    const right = V(0, 0, 0).crossVectors(dir, UP).normalize();
    dir.applyAxisAngle(right, walk.pitch);
    return { pos, look: pos.clone().add(dir), fov: b.fov };
  }
  function stepWalk(dt) {
    if (focusKey || tween || !running) return;
    const b = baseView();
    let fx = joy.x, fz = joy.y;
    if (keysDown.has('w') || keysDown.has('arrowup')) fz -= 1;
    if (keysDown.has('s') || keysDown.has('arrowdown')) fz += 1;
    if (keysDown.has('a') || keysDown.has('arrowleft')) fx -= 1;
    if (keysDown.has('d') || keysDown.has('arrowright')) fx += 1;
    const len = Math.hypot(fx, fz); if (len > 1) { fx /= len; fz /= len; }
    if (len > 0.05) { walk.reset = false; markMoved(); }
    const sp = 1.2, c = Math.cos(walk.yaw), sn = Math.sin(walk.yaw), k = Math.min(1, dt * 7);
    walk.vx += ((fz * sn + fx * c) * sp - walk.vx) * k;
    walk.vz += ((fz * c - fx * sn) * sp - walk.vz) * k;
    walk.x += walk.vx * dt; walk.z += walk.vz * dt;
    if (walk.reset) { const r = Math.min(1, dt * 4); walk.x -= walk.x * r; walk.z -= walk.z * r; walk.tyaw -= walk.tyaw * r; walk.tpitch -= walk.tpitch * r; if (Math.abs(walk.x) + Math.abs(walk.z) + Math.abs(walk.tyaw) < 0.003) { walk.reset = false; walk.moved = false; tools.classList.remove('moved'); } }
    walk.x = THREE.MathUtils.clamp(walk.x, -LIM.x, LIM.x);
    walk.z = THREE.MathUtils.clamp(walk.z, LIM.zMin - b.pos.z, LIM.zMax - b.pos.z);
    walk.tyaw = THREE.MathUtils.clamp(walk.tyaw, -LIM.yaw, LIM.yaw); walk.tpitch = THREE.MathUtils.clamp(walk.tpitch, -LIM.pitch, LIM.pitch);
    const r = Math.min(1, dt * 9);
    walk.yaw += (walk.tyaw - walk.yaw) * r; walk.pitch += (walk.tpitch - walk.pitch) * r;
    setRig(wideView());
    // ribice prate onoga ko hoda po sobi
    if (Math.hypot(walk.vx, walk.vz) > 0.08) room.poke(V(THREE.MathUtils.clamp(camera.position.x * 0.7, -1, 1), 1.4, -3));
  }
  function markMoved() { if (!walk.moved) { walk.moved = true; tools.classList.add('moved'); hideHint(); } }
  function closeView(key) {
    const [gk, off, dir, dist0] = CLOSE[key];
    const p = portrait();
    let look, dist = dist0;
    if (gk) { const g = room.groups[gk]; look = g.localToWorld(off.clone()); if (key === 'poster') dist *= g.scale.x; }
    else look = room.groups.floppies.position.clone().add(room.groups.drive.position).multiplyScalar(0.5).add(V(0, 0.06, 0));
    return { pos: look.clone().add(dir.clone().normalize().multiplyScalar(dist * (p ? 1.45 : 1))), look, fov: p ? 62 : 46 };
  }
  function panelOffset() {
    if (W >= 760) return new THREE.Vector2(Math.min(460, W * 0.4) / 2 + 8, 0);
    return new THREE.Vector2(0, H * 0.27);
  }
  function setRig(v, off = new THREE.Vector2()) { rig.pos.copy(v.pos); rig.look.copy(v.look); rig.fov = v.fov; rig.off.copy(off); }
  function moveTo(v, off, ms) {
    return new Promise((res) => {
      if (!ms) { setRig(v, off); tween = null; return res(); }
      tween = { from: { pos: rig.pos.clone(), look: rig.look.clone(), fov: rig.fov, off: rig.off.clone() }, to: { ...v, off }, t0: performance.now(), ms, res };
    });
  }
  function stepTween(now) {
    if (!tween) return;
    const k = Math.min(1, (now - tween.t0) / tween.ms), e = ease(k), f = tween.from, t = tween.to;
    rig.pos.lerpVectors(f.pos, t.pos, e);
    // blagi luk: kamera se malo podigne na pola puta
    rig.pos.y += Math.sin(k * Math.PI) * 0.12 * f.pos.distanceTo(t.pos) / 3;
    rig.look.lerpVectors(f.look, t.look, e);
    rig.fov = f.fov + (t.fov - f.fov) * e;
    rig.off.lerpVectors(f.off, t.off, e);
    if (k >= 1) { const r = tween.res; tween = null; r(); }
  }
  // paralaksa: miš, nagib telefona ili lagano lebdenje kad nema ničega
  const par = { x: 0, y: 0, tx: 0, ty: 0, last: 0, orient: false };
  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { par.tx = (e.clientX / W) * 2 - 1; par.ty = (e.clientY / H) * 2 - 1; par.last = performance.now(); } }, { passive: true });
  let base = null;
  function onOrient(e) {
    if (e.gamma == null) return;
    if (!base) base = { g: e.gamma, b: e.beta };
    par.orient = true; par.last = performance.now();
    par.tx = THREE.MathUtils.clamp((e.gamma - base.g) / 25, -1, 1);
    par.ty = THREE.MathUtils.clamp((e.beta - base.b) / 25, -1, 1);
  }
  function listenOrientation(gesture) {
    const D = window.DeviceOrientationEvent;
    if (!D || !o.coarse) return;
    if (typeof D.requestPermission === 'function') {
      if (gesture) D.requestPermission().then((s) => { if (s === 'granted') addEventListener('deviceorientation', onOrient); }).catch(() => {});
    } else addEventListener('deviceorientation', onOrient);
  }
  const lookV = V(0, 0, 0);
  function applyCamera(t) {
    const idle = performance.now() - par.last > 4000 && !walk.moved;
    const tx = idle ? Math.sin(t * 0.21) * 0.45 : par.tx, ty = idle ? Math.sin(t * 0.13) * 0.3 : par.ty;
    const k = reduced ? 0 : 1;
    par.x += (tx - par.x) * 0.05; par.y += (ty - par.y) * 0.05;
    const amt = focusKey ? 0.025 : walk.moved ? 0.04 : 0.12;
    camera.position.set(rig.pos.x + par.x * amt * k, rig.pos.y - par.y * amt * 0.5 * k, rig.pos.z);
    lookV.copy(rig.look);
    camera.lookAt(lookV);
    if (camera.fov !== rig.fov) { camera.fov = rig.fov; }
    if (rig.off.lengthSq() > 0.25) camera.setViewOffset(W, H, rig.off.x, rig.off.y, W, H); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }

  /* ---------- svjetlo: doba dana u Mostaru, lampa, kiša ---------- */
  let lit = false; try { lit = localStorage.getItem('graba-lamp') === '1'; } catch (e) { /* nema */ }
  let phase = dayPhase(mostarTime()), introP = 0, introT0 = 0;
  function lighting() {
    const aqIntro = Math.min(1, introP * 2.2), intro = Math.max(0, Math.min(1, (introP - 0.3) / 0.7));
    room.setLighting({ day: phase.day, dusk: phase.dusk, lit, intro, aqIntro });
    post.uniforms.uFade.value = Math.min(1, introP * 4);
    post.uniforms.uExposure.value = (portrait() ? 0.92 : 1.0) + (lit ? 0.1 : 0);
    // na uskom ekranu sjaj je blaži, da soba ne izgleda kao u magli
    post.uniforms.uBloom.value = portrait() ? 0.5 : 0.9;
  }
  function clockTick() {
    const mt = mostarTime(); room.setClock(mt.h, mt.m); phase = dayPhase(mt); lighting();
  }
  clockTick(); setInterval(clockTick, 30000);
  mostarRain().then((r) => { room.setRain(r); sound.rain(r); });

  /* ---------- oznake (dugmad preko scene) ---------- */
  const hots = document.getElementById('hots');
  const hotBtns = {};
  HOTS.forEach(([key, , , side]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hot side-' + side; b.dataset.key = key; b.dataset.side = side;
    b.innerHTML = '<i class="hot-dot" aria-hidden="true"></i><span class="hot-t"></span>';
    b.addEventListener('click', () => activate(key, b));
    b.addEventListener('mouseenter', () => setHover(key)); b.addEventListener('mouseleave', () => setHover(null));
    b.addEventListener('focus', () => setHover(key)); b.addEventListener('blur', () => setHover(null));
    hots.appendChild(b); hotBtns[key] = b;
  });
  function labelHots() {
    HOTS.forEach(([key]) => {
      const b = hotBtns[key], name = L().names[key];
      b.querySelector('.hot-t').textContent = ringing && key === 'phone' ? L().ring : name; b._lw = 0;
      b.setAttribute('aria-label', name + ', ' + L().objs[key]);
      if (key === 'lamp') b.setAttribute('aria-pressed', String(lit));
      if (key === 'cassette') b.setAttribute('aria-pressed', String(sound.on));
    });
    hots.setAttribute('aria-label', L().hintD);
  }
  const pv = V(0, 0, 0);
  function placeHots() {
    for (const [key, gk, p] of HOTS) {
      if (gk) room.groups[gk].localToWorld(pv.copy(p)); else pv.copy(p);
      pv.project(camera);
      const b = hotBtns[key], vis = pv.z < 1 && Math.abs(pv.x) < 1.02 && Math.abs(pv.y) < 1.02;
      const x = (pv.x + 1) / 2 * W, y = (1 - pv.y) / 2 * H;
      b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      b.classList.toggle('off', !vis);
      b._x = x; b._y = y; b._vis = vis;
    }
    placeLabels();
  }
  // natpisi se ne smiju preklapati: svaki ide desno, lijevo, iznad ili ispod, gdje ima mjesta
  const SIDES = ['r', 'l', 't', 'b'];
  const overlap = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  function placeLabels() {
    const now = performance.now(), all = now < showAllUntil, placed = [];
    const always = true;
    // ime se vidi kad je predmet na sredini pogleda (najviše dva), pod mišem, u fokusu ili kad se traže sva imena
    const R = Math.min(W, H) * 0.26;
    const near = HOTS.map(([k]) => hotBtns[k]).filter((b) => b._vis).map((b) => [b, Math.hypot(b._x - W / 2, b._y - H * 0.52)]).filter(([, d]) => d < R).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([b]) => b);
    for (const [key] of HOTS) { const b = hotBtns[key]; const want = all || near.includes(b) || b.classList.contains('is-hover') || b === document.activeElement; b.classList.toggle('lbl', want); b._want = want; }
    if (always) for (const [key] of HOTS) { const b = hotBtns[key]; if (b._vis) placed.push([b._x - 9, b._y - 9, b._x + 9, b._y + 9]); }
    // prvo predmeti uz rub ekrana (imaju najmanje mjesta), pa oni u sredini
    const order0 = HOTS.map(([k]) => hotBtns[k]).filter((b) => b._vis).sort((a, b) => (b.dataset.key === 'monitor') - (a.dataset.key === 'monitor') || Math.abs(b._x - W / 2) - Math.abs(a._x - W / 2));
    for (const b of order0) {
      if (!b._want) continue;
      const tEl = b.querySelector('.hot-t');
      if (!b._lw) b._lw = tEl.offsetWidth || 90;
      const w = b._lw, h = 30, x = b._x, y = b._y;
      const cx = Math.max(4, Math.min(W - 4 - w, x - w / 2));
      const cand = { r: [x + 12, y - h / 2], l: [x - 12 - w, y - h / 2], t: [cx, y - 16 - h], b: [cx, y + 16] };
      const pref = b.dataset.side;
      const order = [pref, pref === 'l' ? 'r' : 'l', 't', 'b'];
      let side = null;
      for (const s of order) {
        const [rx, ry] = cand[s], rect = [rx, ry, rx + w, ry + h];
        if (rx < 4 || rx + w > W - 4 || ry < 58 || ry + h > H - 4) continue;
        if (always && placed.some((p) => overlap(p, rect))) continue;
        side = s; placed.push(rect); b._shift = s === 't' || s === 'b' ? cx - (x - w / 2) : 0; break;
      }
      const cur = side || 'x';
      tEl.style.marginLeft = b._shift ? b._shift + 'px' : '';
      if (b.dataset.cur !== cur) { b.dataset.cur = cur; SIDES.forEach((s) => b.classList.toggle('side-' + s, s === side)); b.classList.toggle('nolabel', !side); }
    }
  }

  /* ---------- sjaj predmeta pod mišem ---------- */
  let hovered = null;
  const glowColor = new THREE.Color(0x2a3c8a);
  function glow(key, on) {
    const it = items[key]; if (!it) return;
    it.mats.forEach((m) => {
      if (on) { if (!m.userData.e0) m.userData.e0 = { c: m.emissive.clone(), i: m.emissiveIntensity }; m.emissive.copy(glowColor); m.emissiveIntensity = 0.55; }
      else if (m.userData.e0) { m.emissive.copy(m.userData.e0.c); m.emissiveIntensity = m.userData.e0.i; }
    });
  }
  function setHover(key) {
    if (key === 'drive') key = 'floppies';
    if (hovered === key) return;
    if (hovered) { glow(hovered, false); if (hovered === 'floppies') glow('drive', false); hotBtns[hovered] && hotBtns[hovered].classList.remove('is-hover'); }
    hovered = key;
    if (key) { glow(key, true); if (key === 'floppies') glow('drive', true); hotBtns[key] && hotBtns[key].classList.add('is-hover'); }
  }

  /* ---------- pokazivač: hover, klik, ribice ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hitList = Object.entries(items).map(([k, it]) => { it.hit.userData.key = k; return it.hit; });
  const nameTip = document.getElementById('hovername');
  function pick(x, y) {
    ndc.set((x / W) * 2 - 1, -(y / H) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(hitList, false)[0];
    return h ? { key: h.object.userData.key, point: h.point } : null;
  }
  let down = null;
  const ptrs = new Map();
  let pinch = 0;
  canvas.addEventListener('pointermove', (e) => {
    // prevlačenje okreće pogled, dva prsta (štipanje) idu naprijed i nazad
    if (ptrs.has(e.pointerId) && running && !focusKey) {
      const pr = ptrs.get(e.pointerId), dx = e.clientX - pr.x, dy = e.clientY - pr.y;
      pr.x = e.clientX; pr.y = e.clientY;
      if (ptrs.size === 1 && down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) {
        walk.tyaw += dx * (o.coarse ? 0.0062 : 0.0042); walk.tpitch += dy * (o.coarse ? 0.0045 : 0.003); walk.reset = false; markMoved();
      } else if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) { const bz = baseView().pos.z; walk.z = THREE.MathUtils.clamp(walk.z - (d - pinch) * 0.006, LIM.zMin - bz, LIM.zMax - bz); walk.reset = false; markMoved(); }
        pinch = d;
      }
    }
    if (!running || focusKey) { nameTip.classList.remove('on'); return; }
    const h = pick(e.clientX, e.clientY);
    if (h && h.key === 'aquarium') room.poke(h.point);
    if (e.pointerType !== 'mouse') return;
    setHover(h ? h.key : null);
    canvas.style.cursor = h ? 'pointer' : '';
    if (h) {
      const k = h.key === 'drive' ? 'floppies' : h.key;
      nameTip.textContent = L().names[k] + ' · ' + L().objs[k];
      nameTip.style.transform = 'translate(' + (e.clientX + 18) + 'px,' + (e.clientY + 16) + 'px)';
      nameTip.classList.add('on');
    } else nameTip.classList.remove('on');
  });
  canvas.addEventListener('pointerleave', () => { nameTip.classList.remove('on'); if (!focusKey) setHover(null); });
  canvas.addEventListener('pointerdown', (e) => {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); pinch = 0;
    if (ptrs.size === 1) down = { x: e.clientX, y: e.clientY, t: performance.now() }; else down = null;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* nije bitno */ }
    canvas.classList.add('grab');
  });
  const lift = (e) => { ptrs.delete(e.pointerId); pinch = 0; if (!ptrs.size) canvas.classList.remove('grab'); };
  canvas.addEventListener('pointercancel', lift);
  canvas.addEventListener('wheel', (e) => {
    if (!running || focusKey) return;
    e.preventDefault();
    const bz = baseView().pos.z; walk.z = THREE.MathUtils.clamp(walk.z + Math.sign(e.deltaY) * Math.min(0.25, Math.abs(e.deltaY) * 0.0016), LIM.zMin - bz, LIM.zMax - bz);
    walk.reset = false; markMoved();
  }, { passive: false });
  // tipke za hodanje (desktop): WASD i strelice
  const WALK_KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);
  addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    if (!WALK_KEYS.has(k) || focusKey || !running || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target && e.target.closest && e.target.closest('input, textarea, .panel')) return;
    e.preventDefault(); keysDown.add(k);
  });
  addEventListener('keyup', (e) => keysDown.delete((e.key || '').toLowerCase()));
  addEventListener('blur', () => keysDown.clear());
  canvas.addEventListener('pointerup', (e) => {
    lift(e);
    if (!down || !running) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
    if (moved > 10) return;
    if (focusKey) { if (!busy) back(); return; }
    const h = pick(e.clientX, e.clientY);
    if (h) activate(h.key, hotBtns[h.key === 'drive' ? 'floppies' : h.key]);
  });

  /* ---------- panel ---------- */
  const panel = document.getElementById('panel'), panelIn = document.getElementById('panel-in');
  let focusKey = null, opener = null, busy = false;
  const sub = { project: null, year: null, term: { lines: TT().boot.slice(), hist: [] } };
  const hint = document.getElementById('room-hint');
  function hideHint() { hint.classList.add('gone'); }

  /* ---------- alati u uglu: vrati pogled, prikaži imena; krug za kretanje na mobitelu ---------- */
  const roomEl = document.getElementById('room');
  const tools = document.createElement('div'); tools.className = 'room-tools';
  tools.innerHTML = '<button type="button" class="rt-reset" data-r="reset"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg></button><button type="button" class="rt-names" data-r="names">?</button>';
  roomEl.appendChild(tools);
  let showAllUntil = 0;
  tools.querySelector('[data-r="reset"]').addEventListener('click', () => { walk.reset = true; keysDown.clear(); });
  tools.querySelector('[data-r="names"]').addEventListener('click', () => { showAllUntil = performance.now() + 3500; });
  const joyEl = document.createElement('div'); joyEl.className = 'joy'; joyEl.setAttribute('aria-hidden', 'true');
  joyEl.innerHTML = '<i class="joy-knob"></i>';
  if (o.coarse) roomEl.appendChild(joyEl);
  const knob = joyEl.firstChild; let joyId = null, joyC = null;
  const JR = 44;
  joyEl.addEventListener('pointerdown', (e) => { if (focusKey) return; joyId = e.pointerId; const r = joyEl.getBoundingClientRect(); joyC = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; try { joyEl.setPointerCapture(e.pointerId); } catch (err) { /* nije bitno */ } joyEl.classList.add('on'); moveJoy(e); e.preventDefault(); });
  function moveJoy(e) {
    if (e.pointerId !== joyId) return;
    let dx = e.clientX - joyC.x, dy = e.clientY - joyC.y; const d = Math.hypot(dx, dy);
    if (d > JR) { dx *= JR / d; dy *= JR / d; }
    knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    const k = d < 6 ? 0 : 1; joy.x = dx / JR * k; joy.y = dy / JR * k;
  }
  joyEl.addEventListener('pointermove', moveJoy);
  const joyEnd = (e) => { if (e.pointerId !== joyId) return; joyId = null; joy.x = joy.y = 0; knob.style.transform = ''; joyEl.classList.remove('on'); };
  joyEl.addEventListener('pointerup', joyEnd); joyEl.addEventListener('pointercancel', joyEnd);
  function labelTools() {
    const r = tools.querySelector('[data-r="reset"]'), n = tools.querySelector('[data-r="names"]');
    r.setAttribute('aria-label', L().reset); r.title = L().reset;
    n.setAttribute('aria-label', L().showNames); n.title = L().showNames;
  }

  function activate(key, btn) {
    if (key === 'drive') key = 'floppies';
    if (busy || !running) return;
    hideHint();
    if (key === 'aquarium') { room.scatter(); sound.splash(); toast(L().fish); return; }
    if (key === 'lamp') { lit = !lit; try { localStorage.setItem('graba-lamp', lit ? '1' : '0'); } catch (e) { /* nema */ } lighting(); sound.lamp(); toast(lit ? L().lampOn : L().lampOff); labelHots(); return; }
    if (key === 'cassette') { o.toggleSound(); return; }
    if (focusKey) return;
    opener = btn || null;
    focusKey = key; busy = true; setHover(null); nameTip.classList.remove('on');
    html.classList.add('is-focus');
    onOpen(key);
    moveTo(closeView(key), panelOffset(), reduced ? 0 : 1200).then(() => { busy = false; showPanel(key); });
  }
  function showPanel(key) {
    render(key);
    panel.hidden = false; panel.dataset.key = key;
    requestAnimationFrame(() => panel.classList.add('on'));
    const f = panel.querySelector('[data-autofocus]') || panel.querySelector('h2');
    if (f) { if (f.tagName === 'H2') f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
    afterRender(key);
  }
  function hidePanel() {
    panel.classList.remove('on'); panel.style.transform = '';
    panel.hidden = true;
  }
  function back() {
    if (!focusKey || busy) return;
    const k = focusKey;
    hidePanel(); onClose(k);
    focusKey = null; busy = true;
    moveTo(wideView(), new THREE.Vector2(), reduced ? 0 : 1000).then(() => {
      busy = false; html.classList.remove('is-focus');
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    });
  }
  function switchTo(key) {
    // iz jednog panela u drugi (npr. disketa -> projekat na monitoru)
    hidePanel(); onClose(focusKey); focusKey = key; busy = true; onOpen(key);
    moveTo(closeView(key), panelOffset(), reduced ? 0 : 1000).then(() => { busy = false; showPanel(key); });
  }
  panel.querySelector('.panel-back').addEventListener('click', back);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && focusKey) { e.preventDefault(); back(); return; }
    if (e.key === 'Tab' && focusKey && !panel.hidden) {
      const f = [...panel.querySelectorAll('button, a[href], input, [tabindex="0"]')].filter((x) => !x.hidden && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    }
  });
  // prevlačenje panela nadolje zatvara ga (mobitel)
  let sw = null;
  panel.addEventListener('touchstart', (e) => { if (panel.scrollTop <= 0 && W < 760) sw = { y: e.touches[0].clientY, dy: 0 }; }, { passive: true });
  panel.addEventListener('touchmove', (e) => { if (!sw) return; sw.dy = Math.max(0, e.touches[0].clientY - sw.y); if (sw.dy > 0) panel.style.transform = 'translateY(' + sw.dy + 'px)'; }, { passive: true });
  panel.addEventListener('touchend', () => { if (!sw) return; const d = sw.dy; sw = null; panel.style.transform = ''; if (d > 90) back(); });

  /* ---------- sadržaj panela ---------- */
  const C = PF.contact;
  const btn = (href, label, cls = '') => '<a class="p-btn ' + cls + '" href="' + href + '"' + (href.startsWith('http') ? ' ' + ext : '') + '>' + esc(label) + (href.startsWith('http') ? ' <span aria-hidden="true">↗</span>' : '') + '</a>';
  const copyBtn = (cls = '') => '<button type="button" class="p-btn ' + cls + '" data-copy="' + C.email + '">' + esc(L().copyEmail) + ' <small>' + esc(C.email) + '</small></button>';
  function head(k, h) { return '<p class="p-k">' + esc(k) + '</p><h2 id="panel-h">' + em(h) + '</h2>'; }

  function render(key) {
    const t = T(), l = L();
    let h = '';
    if (key === 'monitor') {
      h += head('C:\\GRABA', l.names.monitor);
      if (sub.project) {
        const w = PF.work.find((x) => x.id === sub.project), [name, kind, desc] = t.items[w.id];
        h += '<button type="button" class="p-link" data-list><span aria-hidden="true">←</span> ' + esc(l.all) + '</button>'
          + '<article class="p-proj"><p class="p-exe-n">' + PF.exe[w.id] + ' · ' + w.year + '</p><h3>' + esc(name) + '</h3><p class="p-kind">' + esc(kind) + '</p><p>' + esc(desc) + '</p>'
          + '<ul class="p-tags">' + w.tags.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>'
          + '<p class="p-actions">' + (w.live ? btn(w.live, l.run, 'p-main') : '<span class="p-note">' + esc(l.noLive) + '</span>') + (w.src ? btn(w.src, l.source) : '') + '</p></article>';
      } else {
        h += '<ol class="p-exe" aria-label="' + esc(l.programs) + '">' + PF.work.map((w, i) => '<li><button type="button" data-open="' + w.id + '" data-i="' + i + '"><b>' + PF.exe[w.id] + '</b><span>' + esc(t.items[w.id][0]) + '</span><em>' + w.year + '</em></button></li>').join('') + '</ol>';
      }
      if (!o.coarse) {
        h += '<form class="p-term" autocomplete="off"><div class="p-out" role="log" aria-live="polite" aria-label="Terminal" tabindex="0"></div>'
          + '<p class="p-prompt"><label for="term-in">C:\\GRABA&gt;</label><input id="term-in" name="cmd" spellcheck="false" autocapitalize="off" aria-label="' + esc(l.termLabel) + '" placeholder="' + esc(l.termHint) + '"' + (sub.project ? '' : ' data-autofocus') + '></p></form>';
      }
    } else if (key === 'phone') {
      h += head(l.ring, l.callH)
        + '<p class="p-dial"><span class="sr-only">' + esc(C.phone) + '</span><span id="dial" aria-hidden="true"></span><i class="p-caret" aria-hidden="true"></i></p>'
        + '<p class="p-actions p-grid">' + btn('tel:' + C.tel, l.call + ' ' + C.phone, 'p-main') + btn(C.viber, t.viber) + btn(C.whatsapp, t.whatsapp) + copyBtn() + btn(C.github, t.github) + '</p>';
    } else if (key === 'answering' || key === 'poster') {
      const full = t.aboutP.join(' ');
      h += (key === 'poster'
        ? head(l.names.poster, t.aboutH) + '<p class="p-lead">' + esc(l.posterP) + '</p>'
        : '<p class="p-k p-lcd">' + esc(l.amNew) + '</p><h2 id="panel-h">' + em(t.aboutH) + '</h2><p class="p-from">' + esc(l.amFrom) + '</p>')
        + '<div class="p-msg"><p class="sr-only">' + esc(full) + '</p><p class="p-typed" aria-hidden="true"></p></div>'
        + (key === 'answering' ? '<button type="button" class="p-link" data-replay><span aria-hidden="true">▶</span> ' + esc(l.amPlay) + '</button>' : '')
        + '<dl class="p-facts">' + t.facts.map(([a, b]) => '<div><dt>' + esc(a) + '</dt><dd>' + esc(b) + '</dd></div>').join('') + '</dl>'
        + '<p class="p-credit">' + creditHTML(PF, lang) + '</p>';
    } else if (key === 'coffee') {
      h += head('Mostar', l.coffeeH) + '<p class="p-lead">' + esc(l.coffeeP) + '</p>'
        + '<p class="p-actions p-grid">' + btn(C.viber, t.viber, 'p-main') + btn(C.whatsapp, t.whatsapp) + copyBtn() + btn('tel:' + C.tel, l.call + ' ' + C.phone) + '</p>';
    } else if (key === 'notes') {
      h += head(t.servK, t.servH) + '<p class="p-lead">' + esc(l.servP) + '</p>'
        + '<ul class="p-notes">' + t.services.map(([a, b], i) => '<li style="--r:' + [-1.5, 1, -0.6, 1.4][i] + 'deg"><h3>' + esc(a) + '</h3><p>' + esc(b) + '</p></li>').join('') + '</ul>'
        + '<h3 class="p-sub">' + em(t.procH) + '</h3><ol class="p-steps">' + t.process.map(([a, b]) => '<li><b>' + esc(a) + '</b> ' + esc(b) + '</li>').join('') + '</ol>';
    } else if (key === 'floppies') {
      const years = [...new Set(PF.work.map((w) => w.year))].sort().reverse();
      if (!sub.year) sub.year = years[0];
      h += head('A:\\', l.timelineH) + '<p class="p-lead">' + esc(l.timelineP) + '</p>'
        + '<p class="p-disks" role="group" aria-label="' + esc(l.timelineH) + '">' + years.map((y) => '<button type="button" class="p-disk" data-year="' + y + '" aria-pressed="' + (y === sub.year) + '"><i aria-hidden="true"></i><span>' + y + '</span></button>').join('') + '</p>'
        + '<ol class="p-exe">' + PF.work.filter((w) => w.year === sub.year).map((w) => '<li><button type="button" data-run="' + w.id + '"><b>' + PF.exe[w.id] + '</b><span>' + esc(t.items[w.id][0]) + '</span><em>' + esc(t.items[w.id][1].split(' · ')[0]) + '</em></button></li>').join('') + '</ol>';
    } else if (key === 'keyboard') {
      h += head(l.names.keyboard, t.stackK) + '<p class="p-lead">' + esc(l.stackP) + '</p>'
        + '<ul class="p-keys">' + PF.stack.map((s, i) => '<li><button type="button" data-key-i="' + i + '">' + esc(s) + '</button></li>').join('') + '</ul>';
    }
    panelIn.innerHTML = h;
    panel.setAttribute('aria-labelledby', 'panel-h');
  }

  function afterRender(key) {
    if (key === 'monitor') bindMonitor();
    if (key === 'phone') dialNumber();
    if (key === 'answering' || key === 'poster') typeAbout(key === 'answering');
    if (key === 'floppies') bindFloppies();
    if (key === 'keyboard') bindKeys();
  }
  function rerender() { if (focusKey && !panel.hidden) { const a = document.activeElement && document.activeElement.id; render(focusKey); afterRender(focusKey, true); if (a) { const el = document.getElementById(a); if (el) el.focus({ preventScroll: true }); } } }

  /* ---------- monitor: programi i terminal ---------- */
  function bindMonitor() {
    panelIn.querySelectorAll('[data-open]').forEach((b) => {
      b.addEventListener('click', () => openProject(b.dataset.open, true));
      const sel = () => { if (crt.state === 'menu') { crt.select(+b.dataset.i); sound.key(); } };
      b.addEventListener('mouseenter', sel); b.addEventListener('focus', sel);
    });
    const lb = panelIn.querySelector('[data-list]');
    if (lb) lb.addEventListener('click', () => { sub.project = null; crt.menu(); render('monitor'); afterRender('monitor'); const f = panelIn.querySelector('[data-open]'); if (f) f.focus(); });
    const form = panelIn.querySelector('.p-term');
    if (form) {
      const inp = form.querySelector('input');
      paintOut();
      inp.addEventListener('input', () => { crt.term(sub.term.lines, inp.value); sound.key(); });
      inp.addEventListener('focus', () => crt.term(sub.term.lines, inp.value));
      let hi = -1;
      inp.addEventListener('keydown', (e) => {
        const hs = sub.term.hist;
        if (e.key === 'ArrowUp' && hs.length) { e.preventDefault(); hi = hi < 0 ? hs.length - 1 : Math.max(0, hi - 1); inp.value = hs[hi]; }
        if (e.key === 'ArrowDown' && hs.length) { e.preventDefault(); hi = hi < 0 ? -1 : hi + 1; inp.value = hi >= 0 && hi < hs.length ? hs[hi] : ''; if (hi >= hs.length) hi = -1; }
      });
      form.addEventListener('submit', (e) => { e.preventDefault(); const v = inp.value; inp.value = ''; hi = -1; run(v); });
    }
  }
  function paintOut() {
    const out = panelIn.querySelector('.p-out'); if (!out) return;
    out.innerHTML = sub.term.lines.slice(-40).map((x) => '<div>' + (esc(x) || '&nbsp;') + '</div>').join('');
    out.scrollTop = out.scrollHeight;
  }
  function wrap(s, n = 46) {
    const out = []; let line = '';
    String(s).split(' ').forEach((w) => { if ((line + ' ' + w).trim().length > n) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); });
    if (line) out.push(line); return out;
  }
  function say(...lines) { lines.flat().forEach((l) => sub.term.lines.push(...(l.length > 46 ? wrap(l) : [l]))); }
  function findProject(a) {
    a = a.toLowerCase().replace(/\.exe$/, '').trim(); if (!a) return null;
    const n = parseInt(a, 10);
    if (!isNaN(n) && PF.work[n - 1]) return PF.work[n - 1];
    return PF.work.find((w) => w.id === a || PF.exe[w.id].toLowerCase().replace('.exe', '') === a)
      || PF.work.find((w) => T().items[w.id][0].toLowerCase().replace(/\s+/g, '').startsWith(a.replace(/\s+/g, '')))
      || PF.work.find((w) => PF.exe[w.id].toLowerCase().startsWith(a));
  }
  function run(raw) {
    raw = raw.trim(); if (!raw) return;
    const tt = TT(), t = T();
    sub.term.hist.push(raw); say('C:\\GRABA>' + raw);
    const [cmd0, ...args] = raw.split(/\s+/), cmd = cmd0.toLowerCase(), a = args.join(' ');
    let opened = null;
    switch (cmd) {
      case 'help': case '?': say(tt.help); break;
      case 'projects': case 'dir': case 'ls': PF.work.forEach((w, i) => say((i + 1) + '. ' + PF.exe[w.id].padEnd(15, ' ') + w.year)); break;
      case 'open': case 'run': case 'start': { const w = findProject(a); if (w) { say(tt.opening + PF.exe[w.id]); opened = w.id; } else say(tt.notFound + (a || '?')); break; }
      case 'whoami': say('Ahmed Grabus (Graba)', t.role, t.facts.map(([k, v]) => k + ': ' + v)); break;
      case 'contact': say(t.email + ': ' + C.email, t.phone + ': ' + C.phone, 'Viber / WhatsApp: ' + C.phone, t.github + ': github.com/grabator'); break;
      case 'services': t.services.forEach(([k]) => say('- ' + k)); break;
      case 'stack': say(PF.stack.join(', ')); break;
      case 'coffee': case 'kafa': say(tt.coffee); break;
      case 'skoci': case 'skoči': case 'jump': say(tt.skoci); sound.splash(); break;
      case 'lang': if (a === 'en' || a === 'bs') { o.setLang(a); say('OK: ' + a.toUpperCase()); } else say('lang en|bs'); break;
      case 'clear': case 'cls': sub.term.lines = []; break;
      case 'history': if (sub.term.hist.length) sub.term.hist.slice(-12).forEach((x, i) => say((i + 1) + '  ' + x)); else say(tt.empty); break;
      case 'exit': case 'quit': say(tt.bye); setTimeout(back, 350); break;
      default: { const w = findProject(raw); if (w) { say(tt.opening + PF.exe[w.id]); opened = w.id; } else say(tt.unknown + cmd0); }
    }
    paintOut();
    if (opened) openProject(opened, false);
    else crt.term(sub.term.lines, '');
  }
  function openProject(id, focusDetails) {
    sub.project = id; crt.open(id); sound.floppy();
    const keepTerm = !focusDetails;
    render('monitor'); afterRender('monitor');
    if (keepTerm) { const i = panelIn.querySelector('#term-in'); if (i) i.focus({ preventScroll: true }); }
    else { const h = panelIn.querySelector('.p-proj h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
  }

  /* ---------- telefon: biranje broja ---------- */
  let dialTimer = 0;
  const dial = { target: 0, rot: 0 };
  function dialNumber(instant) {
    clearInterval(dialTimer);
    const el = panelIn.querySelector('#dial'); if (!el) return;
    const num = C.phone;
    if (reduced || instant) { el.textContent = num; return; }
    let i = 0; el.textContent = '';
    dialTimer = setInterval(() => {
      if (!document.contains(el)) return clearInterval(dialTimer);
      const ch = num[i++]; el.textContent += ch;
      if (/\d/.test(ch)) { const d = +ch || 10; dial.target = d * 0.42; sound.dial(Math.min(d, 4)); }
      if (i >= num.length) clearInterval(dialTimer);
    }, 120);
  }

  /* ---------- sekretarica: titlovi poruke ---------- */
  let typeTimer = 0;
  function typeAbout(beep) {
    clearInterval(typeTimer);
    const el = panelIn.querySelector('.p-typed'); if (!el) return;
    const paras = T().aboutP;
    const rb = panelIn.querySelector('[data-replay]'); if (rb) rb.onclick = () => typeAbout(true);
    if (reduced) { el.innerHTML = paras.map(esc).join('<br><br>'); return; }
    if (beep) { sound.beep(); amHeard = true; }
    const full = paras.join('\n\n'); let i = 0; el.textContent = '';
    el.classList.add('typing');
    typeTimer = setInterval(() => {
      if (!document.contains(el)) return clearInterval(typeTimer);
      i += 2; el.textContent = full.slice(0, i);
      if (i >= full.length) { clearInterval(typeTimer); el.classList.remove('typing'); }
    }, 24);
  }
  let amHeard = false;

  /* ---------- diskete: godine ---------- */
  const flyState = { t0: -1 };
  function bindFloppies(skipAnim) {
    panelIn.querySelectorAll('[data-year]').forEach((b) => b.addEventListener('click', () => { sub.year = b.dataset.year; render('floppies'); bindFloppies(); loadYear(); const n = panelIn.querySelector('[data-year="' + sub.year + '"]'); if (n) n.focus(); }));
    panelIn.querySelectorAll('[data-run]').forEach((b) => b.addEventListener('click', () => { sub.project = b.dataset.run; crt.open(sub.project); switchTo('monitor'); }));
    if (!skipAnim && flyState.t0 < 0) loadYear();
  }
  function loadYear() {
    flyState.t0 = performance.now();
    sound.floppy();
    crt.year(sub.year, PF.work.filter((w) => w.year === sub.year));
  }

  /* ---------- tastatura: tipke svijetle ---------- */
  const keyCol = new THREE.Color(), keyBase = new THREE.Color(0x2b2a2e), keyLit = new THREE.Color(0.35, 2.4, 0.9);
  const keyGlow = new Float32Array(56);
  function bindKeys() {
    panelIn.querySelectorAll('[data-key-i]').forEach((b) => {
      const light = () => { const i = (+b.dataset.keyI * 7) % 56; keyGlow[i] = 1; keyGlow[(i + 1) % 56] = 0.7; sound.key(); };
      b.addEventListener('mouseenter', light); b.addEventListener('focus', light); b.addEventListener('click', light);
    });
  }

  /* ---------- otvaranje i zatvaranje: 3D efekti ---------- */
  function onOpen(key) {
    if (key === 'monitor') { if (sub.project) crt.open(sub.project); else crt.menu(); }
    lastInput = performance.now();
    if (key === 'phone') { stopRing(); handsetUp = 1; }
    if (key === 'floppies') flyState.t0 = -1;
    hots.hidden = true;
  }
  function onClose(key) {
    clearInterval(dialTimer); clearInterval(typeTimer);
    if (key === 'phone') handsetUp = 0;
    if (key === 'monitor' || key === 'floppies') { crt.menu(); }
    if (key === 'floppies') flyState.t0 = -1;
    hots.hidden = false;
    scheduleRing();
  }

  /* ---------- zvono telefona ---------- */
  let ringing = 0, ringTimer = 0, handsetUp = 0, handsetK = 0;
  function scheduleRing() { clearTimeout(ringTimer); ringTimer = setTimeout(ring, 40000 + Math.random() * 30000); }
  function ring() {
    if (!running || focusKey || document.hidden) return scheduleRing();
    ringing = performance.now() + 3600; sound.ring(); hotBtns.phone.classList.add('is-ringing'); labelHots();
    setTimeout(() => { if (ringing) stopRing(); scheduleRing(); }, 3700);
  }
  function stopRing() { ringing = 0; hotBtns.phone.classList.remove('is-ringing'); labelHots(); }

  /* ---------- animacije koje zavise od stanja ---------- */
  const ph = items.phone, hsBase = ph.handset.position.clone(), hsRot = ph.handset.rotation.clone();
  const flyFrom = V(0, 0, 0), flyTo = V(0, 0, 0), flyV = V(0, 0, 0);
  room.anim.push((t, dt) => {
    // slušalica: zvoni (podrhtava) ili je podignuta dok je panel otvoren
    handsetK += ((handsetUp ? 1 : 0) - handsetK) * Math.min(1, dt * 6);
    const shake = ringing && performance.now() < ringing ? Math.abs(Math.sin(t * 38)) * 0.008 * (Math.sin(t * 6) > 0 ? 1 : 0) : 0;
    ph.handset.position.set(hsBase.x, hsBase.y + shake + handsetK * 0.05, hsBase.z + handsetK * 0.06);
    ph.handset.rotation.set(hsRot.x - handsetK * 0.3, hsRot.y, hsRot.z + handsetK * 0.12 + (shake ? Math.sin(t * 50) * 0.04 : 0));
    // brojčanik se okrene i vrati
    dial.rot += (dial.target - dial.rot) * Math.min(1, dt * 14); dial.target *= Math.pow(0.02, dt);
    ph.dial.rotation.y = -dial.rot;
    // sekretarica trepće dok poruka nije preslušana
    if (amHeard) items.answering.led.color.setRGB(0.5, 0.04, 0.05);
    // disketa leti u drajv
    const f = items.floppies.fly;
    if (flyState.t0 >= 0) {
      room.groups.floppies.localToWorld(flyFrom.set(0, 0.13, 0)); room.groups.drive.localToWorld(flyTo.set(-0.02, 0.06, 0.2));
      const k = Math.min(1, (performance.now() - flyState.t0) / 900), e = ease(k);
      f.visible = k < 1; flyV.lerpVectors(flyFrom, flyTo, e); flyV.y += Math.sin(e * Math.PI) * 0.18; f.position.copy(flyV);
      f.rotation.set(0, 0.35 * (1 - e), 0);
      items.drive.led.color.setRGB(0.3, k < 1 ? (Math.sin(t * 40) > 0 ? 3 : 0.4) : 3, 0.8);
    } else { f.visible = false; items.drive.led.color.setRGB(0.3, 3, 0.8); }
    // tastatura: tipke svijetle dok je panel otvoren
    const keys = items.keyboard.keys;
    if (focusKey === 'keyboard' && Math.random() < dt * 9) keyGlow[(Math.random() * 56) | 0] = 1;
    let any = false;
    for (let i = 0; i < 56; i++) {
      if (keyGlow[i] > 0.001) { keyGlow[i] *= Math.pow(0.08, dt); any = true; }
      keyCol.copy(keyBase).lerp(keyLit, keyGlow[i]); keys.setColorAt(i, keyCol);
    }
    if (any || keys.userData.dirty) { keys.instanceColor.needsUpdate = true; keys.userData.dirty = any; }
    // kasetofon: lampica kad je zvuk uključen
    items.cassette.led.color.setRGB(sound.on ? 3 : 0.35, sound.on ? 0.25 : 0.35, sound.on ? 0.2 : 0.4);
  });

  /* ---------- petlja ---------- */
  let running = false, paused = true, raf = 0, last = performance.now(), shadowTick = 0, lastInput = performance.now();
  ['pointerdown', 'keydown', 'wheel'].forEach((ev) => addEventListener(ev, () => { lastInput = performance.now(); if (crt.state === 'saver' && !focusKey) crt.menu(); }, { passive: true }));
  const clock0 = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dtMs = now - last; last = now;
    if (paused) return;
    const t = (now - clock0) / 1000, dt = Math.min(0.05, dtMs / 1000);
    if (introP < 1 && introT0) { introP = Math.min(1, (now - introT0) / (reduced ? 300 : 2800)); lighting(); }
    stepTween(now);
    stepWalk(dt);
    applyCamera(t);
    // mapa sjena: samo kad se nešto pomjeri (raspored, slušalica), inače svakih 20 kadrova
    if (renderer.shadowMap.enabled && (room.flags.shadowDirty || ++shadowTick % 20 === 0)) { renderer.shadowMap.needsUpdate = true; room.flags.shadowDirty = false; }
    if (!focusKey && crt.state === 'menu' && now - lastInput > 15000) crt.saver();
    for (const f of room.anim) f(t, dt);
    crt.update(t);
    if (!hots.hidden) placeHots();
    post.render(scene, camera, t);
    quality(dtMs);
  }
  function setPaused(p) {
    paused = p;
    if (!p) { last = performance.now(); }
  }
  document.addEventListener('visibilitychange', () => setPaused(document.hidden || html.classList.contains('is-classic') || !running));
  addEventListener('resize', () => resize());

  // prvi kadar iza boot ekrana: shaderi se kompajliraju dok korisnik čita
  resize(); setRig(wideView()); labelHots(); labelTools();
  hint.textContent = o.coarse ? L().hintM : L().hintD;
  applyCamera(0);
  lighting();
  try { renderer.compile(scene, camera); } catch (e) { /* nije bitno */ }
  post.render(scene, camera, 0);
  progress(0.95);
  cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);

  return {
    start(gesture) {
      running = true; introT0 = performance.now(); introP = reduced ? 1 : 0; lighting();
      html.classList.add('room-on');
      setPaused(document.hidden);
      listenOrientation(gesture);
      scheduleRing();
      setTimeout(hideHint, 9000);
      showAllUntil = performance.now() + (reduced ? 0 : 6500);
    },
    pause(p) { setPaused(p || !running); },
    setLang(l) {
      lang = l; crt.setLang(l); labelHots(); labelTools();
      hint.textContent = o.coarse ? L().hintM : L().hintD;
      if (crt.state === 'term') crt.term(sub.term.lines, '');
      rerender();
    },
    setSound() { labelHots(); },
    open: activate, back
  };
}
