/*
 * Soba: zidovi, krovni prozor, sto, stolice i svi predmeti. Sve je napravljeno u kodu (geometrija,
 * materijali i teksture nacrtane na canvasu), bez preuzetih modela.
 * Mjere su u metrima: pod je na y = 0, zadnji zid na z = -3, sto ispred akvarijuma.
 */
import * as THREE from 'three';

const TAU = Math.PI * 2;

/* ---------- pomoćne funkcije za teksture ---------- */
function canvas(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/* rebrasti zid: tamne okomite letvice */
function ribTexture() {
  return canvas(256, 64, (g, w, h) => {
    g.fillStyle = '#0d1230'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) {
      const grd = g.createLinearGradient(x, 0, x + 16, 0);
      grd.addColorStop(0, '#070a1d'); grd.addColorStop(0.18, '#1a2150'); grd.addColorStop(0.55, '#121840'); grd.addColorStop(1, '#080b20');
      g.fillStyle = grd; g.fillRect(x, 0, 16, h);
    }
  });
}
function ribBump() {
  const t = canvas(256, 8, (g, w, h) => {
    for (let x = 0; x < w; x += 16) {
      const grd = g.createLinearGradient(x, 0, x + 16, 0);
      grd.addColorStop(0, '#000'); grd.addColorStop(0.3, '#fff'); grd.addColorStop(0.7, '#ddd'); grd.addColorStop(1, '#000');
      g.fillStyle = grd; g.fillRect(x, 0, 16, h);
    }
  });
  t.colorSpace = THREE.NoColorSpace;
  return t;
}
/* tepih: tamno crven, sa sitnim šumom */
function carpetTexture() {
  const r = rng(7);
  return canvas(256, 256, (g, w, h) => {
    g.fillStyle = '#4c0d14'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const v = r(); g.fillStyle = v > 0.5 ? 'rgba(140,34,40,0.35)' : 'rgba(30,2,6,0.35)'; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
  });
}

/* ---------- materijali ---------- */
function mat(color, rough = 0.6, metal = 0, extra = {}) { return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }); }

/* zaobljena kutija (ekstruzija zaobljenog pravougaonika) */
function roundedBox(w, h, d, r, seg = 3) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - r * 2, bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.9, bevelSegments: seg, curveSegments: seg * 2 });
  g.translate(0, 0, -(d - r * 2) / 2);
  return g;
}

export function buildRoom(opts) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060f);
  scene.fog = new THREE.FogExp2(0x070a1c, 0.075);
  const items = {};      // interaktivni predmeti: { group, hit, mats }
  const anim = [];       // funkcije koje se zovu svaki kadar: (t, dt) => {}
  const shadows = opts.shadows;

  /* ---------- prostorija ---------- */
  const W = 7.2, D = 7, H = 3.3, BACK = -3;
  const rib = ribTexture(), bump = ribBump();
  const wallMat = (rep) => { const m = mat(0xffffff, 0.85, 0, { map: rib.clone(), bumpMap: bump.clone(), bumpScale: 2.5 }); m.map.wrapS = m.bumpMap.wrapS = THREE.RepeatWrapping; m.map.repeat.set(rep, 1); m.bumpMap.repeat.set(rep, 1); m.map.needsUpdate = m.bumpMap.needsUpdate = true; return m; };
  // zadnji zid sa otvorom za akvarijum (x -1.15..1.15, y 0.95..1.85)
  const AQ = { x0: -1.15, x1: 1.15, y0: 0.95, y1: 1.85 };
  const back = new THREE.Group();
  const bw = wallMat(1);
  function wallPiece(x0, x1, y0, y1) {
    const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0);
    const m = bw.clone(); m.map = bw.map.clone(); m.bumpMap = bw.bumpMap.clone();
    m.map.repeat.set((x1 - x0) * 3.2, 1); m.bumpMap.repeat.set((x1 - x0) * 3.2, 1); m.map.needsUpdate = m.bumpMap.needsUpdate = true;
    const p = new THREE.Mesh(g, m); p.position.set((x0 + x1) / 2, (y0 + y1) / 2, BACK); p.receiveShadow = shadows; back.add(p);
  }
  wallPiece(-W / 2, AQ.x0, 0, H); wallPiece(AQ.x1, W / 2, 0, H); wallPiece(AQ.x0, AQ.x1, 0, AQ.y0); wallPiece(AQ.x0, AQ.x1, AQ.y1, H);
  scene.add(back);
  for (const side of [-1, 1]) {
    const m = wallMat(D * 3.2);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(D, H), m);
    p.rotation.y = -side * Math.PI / 2; p.position.set(side * W / 2, H / 2, BACK + D / 2); p.receiveShadow = shadows; scene.add(p);
  }
  const carpet = carpetTexture(); carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping; carpet.repeat.set(5, 5);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(0xffffff, 1, 0, { map: carpet }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, BACK + D / 2); floor.receiveShadow = shadows; scene.add(floor);

  /* strop sa krovnim prozorom (otvor x -1.8..1.8, z -2.7..-0.5) */
  const ceilM = mat(0x0b0e24, 0.95);
  const SK = { x0: -1.8, x1: 1.8, z0: -2.7, z1: -0.5 };
  // strop baca sjenu, pa mjesečina pada samo kroz prozor (svijetla mrlja na stolu i tepihu)
  const ceil = (x0, x1, z0, z1) => { const p = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.05, z1 - z0), ceilM); p.position.set((x0 + x1) / 2, H + 0.025, (z0 + z1) / 2); p.castShadow = shadows; scene.add(p); };
  ceil(-W / 2, SK.x0, BACK, BACK + D); ceil(SK.x1, W / 2, BACK, BACK + D); ceil(SK.x0, SK.x1, BACK, SK.z0); ceil(SK.x0, SK.x1, SK.z1, BACK + D);
  // nebo iznad prozora (boja se mijenja po dobu dana u Mostaru)
  const skyMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.68, 1.4), fog: false, toneMapped: false });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(SK.x1 - SK.x0 + 1, SK.z1 - SK.z0 + 1), skyMat);
  sky.rotation.x = Math.PI / 2; sky.position.set(0, H + 0.6, (SK.z0 + SK.z1) / 2); scene.add(sky);
  // okviri prozora (prečke)
  const frameM = mat(0x2a3260, 0.6, 0.2);
  for (let i = 0; i <= 6; i++) { const x = SK.x0 + (SK.x1 - SK.x0) * i / 6; const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, SK.z1 - SK.z0), frameM); b.position.set(x, H + 0.05, (SK.z0 + SK.z1) / 2); b.castShadow = shadows; scene.add(b); }
  for (const z of [SK.z0, (SK.z0 + SK.z1) / 2, SK.z1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(SK.x1 - SK.x0, 0.16, 0.07), frameM); b.position.set(0, H + 0.05, z); b.castShadow = shadows; scene.add(b); }
  // krovne grede
  for (const z of [0.4, 1.6, 2.8]) { const b = new THREE.Mesh(new THREE.BoxGeometry(W, 0.18, 0.14), mat(0x0a0d22, 0.9)); b.position.set(0, H - 0.09, z); scene.add(b); }

  /* kiša na krovnom prozoru (kapi klize niz staklo) */
  const rainN = 260, rainGeo = new THREE.BufferGeometry(), rainPos = new Float32Array(rainN * 3), rainSeed = new Float32Array(rainN);
  const rr = rng(11);
  for (let i = 0; i < rainN; i++) { rainPos[i * 3] = SK.x0 + rr() * (SK.x1 - SK.x0); rainPos[i * 3 + 1] = H + 0.02; rainPos[i * 3 + 2] = SK.z0 + rr() * (SK.z1 - SK.z0); rainSeed[i] = rr(); }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3)); rainGeo.setAttribute('seed', new THREE.BufferAttribute(rainSeed, 1));
  const rainMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uTime: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: 'attribute float seed; uniform float uTime; varying float vA; void main(){ vec3 p = position; float t = fract(uTime*0.12*(0.6+seed) + seed*7.0); p.z = mix(' + SK.z0.toFixed(2) + ', ' + SK.z1.toFixed(2) + ', fract(p.z*0.37 + t)); vA = smoothstep(0.0,0.1,t)*(1.0-t); vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = (3.0+seed*5.0)*(6.0/-mv.z); }',
    fragmentShader: 'uniform float uAmount; varying float vA; void main(){ vec2 c = gl_PointCoord-0.5; float d = length(c*vec2(1.0,0.6)); float a = smoothstep(0.5,0.1,d)*vA*uAmount; gl_FragColor = vec4(0.75,0.85,1.0,a*0.9); }'
  });
  const rain = new THREE.Points(rainGeo, rainMat); rain.frustumCulled = false; rain.visible = false; scene.add(rain);

  /* snopovi mjesečine kroz prozor (prozirni klinovi, aditivno) */
  const shaftMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uStrength: { value: 0.16 }, uColor: { value: new THREE.Color(0.45, 0.58, 1.0) }, uTime: { value: 0 }, uRain: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    // kad pada kiša, kroz snop svjetla klize tanke kapi (sjena kiše sa krovnog prozora)
    fragmentShader: 'uniform float uStrength; uniform vec3 uColor; uniform float uTime; uniform float uRain; varying vec2 vUv; void main(){ float a = pow(vUv.y,1.6)*smoothstep(0.0,0.25,vUv.x)*smoothstep(1.0,0.75,vUv.x)*uStrength; float col = floor(vUv.x*90.0); float s = fract(vUv.y*2.2 + uTime*(0.9+fract(col*0.618)*0.6) + fract(col*0.37)*7.0); float streak = smoothstep(0.0,0.02,s)*smoothstep(0.12,0.02,s)*step(0.58,fract(col*0.731)); a *= 1.0 + uRain*(streak*1.7 - 0.12); gl_FragColor = vec4(uColor*a, a); }'
  });
  for (let i = 0; i < 4; i++) {
    const g = new THREE.PlaneGeometry(1.2 + i * 0.3, H + 0.2, 1, 1);
    const p = new THREE.Mesh(g, shaftMat);
    p.position.set(-1.2 + i * 0.85, H / 2 - 0.05, -1.7 + (i % 2) * 0.4);
    p.rotation.set(0, 0.35 - i * 0.22, 0.12 - i * 0.05);
    scene.add(p);
  }

  /* ---------- svjetla ---------- */
  const hemi = new THREE.HemisphereLight(0x2a3570, 0x1a0508, 0.55); scene.add(hemi);
  const moon = new THREE.DirectionalLight(0x7f9bff, 1.6);
  moon.position.set(0.8, 7, -1.0); moon.target.position.set(0, 0, -1.0);
  if (shadows) { moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); moon.shadow.camera.left = -3; moon.shadow.camera.right = 3; moon.shadow.camera.top = 3; moon.shadow.camera.bottom = -3; moon.shadow.camera.near = 2; moon.shadow.camera.far = 10; moon.shadow.bias = -0.0015; moon.shadow.radius = 3; }
  scene.add(moon, moon.target);
  const aqLight = new THREE.PointLight(0x2fe0ee, 9, 9, 1.6); aqLight.position.set(0, 1.45, -2.55); scene.add(aqLight);
  const aqFill = new THREE.PointLight(0x1aa9c8, 3.5, 6, 1.8); aqFill.position.set(0, 2.4, -2.2); scene.add(aqFill);
  const crtLight = new THREE.PointLight(0x7cffb6, 0.55, 1.6, 2); crtLight.position.set(0.25, 1.06, -0.82); scene.add(crtLight);
  const lampLight = new THREE.SpotLight(0xdfe6ff, 0, 4, 0.75, 0.6, 1.5); lampLight.position.set(0.95, 1.38, -1.12); lampLight.target.position.set(0.35, 0.78, -0.9); scene.add(lampLight, lampLight.target);
  const roomFill = new THREE.AmbientLight(0x8090c0, 0); scene.add(roomFill);

  /* ---------- akvarijum ---------- */
  const aq = new THREE.Group(); scene.add(aq);
  const aqDepth = 0.55, aqBack = BACK - aqDepth;
  const aqBg = canvas(256, 128, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#7fe9f6'); grd.addColorStop(0.3, '#1fb4cc'); grd.addColorStop(1, '#063f5a');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const rad = g.createRadialGradient(w * 0.5, h * 0.2, 4, w * 0.5, h * 0.2, w * 0.6); rad.addColorStop(0, 'rgba(220,255,255,0.35)'); rad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rad; g.fillRect(0, 0, w, h);
  });
  const aqBackM = new THREE.MeshBasicMaterial({ map: aqBg, color: new THREE.Color(1, 1, 1), fog: false, toneMapped: false });
  const aqBackP = new THREE.Mesh(new THREE.PlaneGeometry(AQ.x1 - AQ.x0, AQ.y1 - AQ.y0), aqBackM);
  aqBackP.position.set(0, (AQ.y0 + AQ.y1) / 2, aqBack + 0.01); aq.add(aqBackP);
  const recM = mat(0x0a0f22, 0.8);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(aqDepth, AQ.y1 - AQ.y0), recM); p.rotation.y = s * Math.PI / 2; p.position.set(s > 0 ? AQ.x0 : AQ.x1, (AQ.y0 + AQ.y1) / 2, BACK - aqDepth / 2); aq.add(p); }
  const lid = new THREE.Mesh(new THREE.BoxGeometry(AQ.x1 - AQ.x0 + 0.08, 0.07, aqDepth + 0.06), mat(0x14182c, 0.5, 0.3)); lid.position.set(0, AQ.y1 + 0.03, BACK - aqDepth / 2 + 0.02); aq.add(lid);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(AQ.x1 - AQ.x0 - 0.1, 0.012, 0.05), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.6, 2.8), toneMapped: false })); strip.position.set(0, AQ.y1 - 0.01, BACK - 0.08); aq.add(strip);
  const sill = new THREE.Mesh(new THREE.BoxGeometry(AQ.x1 - AQ.x0 + 0.3, 0.05, 0.12), mat(0x161b33, 0.5, 0.2)); sill.position.set(0, AQ.y0 - 0.025, BACK + 0.05); aq.add(sill);
  const sand = new THREE.Mesh(new THREE.BoxGeometry(AQ.x1 - AQ.x0, 0.09, aqDepth), mat(0xb9c3c0, 1)); sand.position.set(0, AQ.y0 + 0.045, BACK - aqDepth / 2); aq.add(sand);
  const rockM = mat(0x8c8a80, 0.9, 0, { flatShading: true });
  [[0.38, 0.13, 0.2], [0.55, 0.09, 0.14], [-0.6, 0.07, 0.12]].forEach(([x, s, h]) => { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockM); r.scale.set(1.3, h / s * 1.4, 1); r.position.set(x, AQ.y0 + 0.09 + h * 0.5, aqBack + 0.22); r.rotation.y = x * 3; aq.add(r); });
  // mala maketa Starog mosta u akvarijumu
  const arch = new THREE.Shape();
  arch.moveTo(-0.22, 0); arch.lineTo(-0.2, 0.05); arch.quadraticCurveTo(0, 0.2, 0.2, 0.05); arch.lineTo(0.22, 0); arch.lineTo(0.22, 0.09); arch.quadraticCurveTo(0, 0.22, -0.22, 0.09); arch.closePath();
  const hole = new THREE.Path(); hole.moveTo(-0.17, 0); hole.quadraticCurveTo(0, 0.24, 0.17, 0); hole.closePath();
  const bridge = new THREE.Mesh(new THREE.ExtrudeGeometry(arch, { depth: 0.05, bevelEnabled: false }), mat(0xd7d0bf, 0.85));
  bridge.position.set(-0.22, AQ.y0 + 0.09, aqBack + 0.28); aq.add(bridge);
  for (const s of [-1, 1]) { const tw = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.13, 0.06), mat(0xd7d0bf, 0.85)); tw.position.set(-0.22 + s * 0.25, AQ.y0 + 0.155, aqBack + 0.3); aq.add(tw); }
  // biljke: listovi kao instance, njišu se
  const leafShape = new THREE.Shape(); leafShape.moveTo(0, 0); leafShape.quadraticCurveTo(0.03, 0.03, 0, 0.07); leafShape.quadraticCurveTo(-0.03, 0.03, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape);
  const plantClusters = [[-0.95, 0.42], [-0.82, 0.34], [0.86, 0.46], [0.98, 0.36], [0.72, 0.28], [-0.4, 0.2]];
  const leaves = []; const pr = rng(3);
  plantClusters.forEach(([x, hgt], ci) => { const n = Math.round(hgt * 70); for (let i = 0; i < n; i++) { const y = (i / n) * hgt; leaves.push({ x: x + (pr() - 0.5) * 0.06, y, z: aqBack + 0.12 + pr() * 0.3, a: pr() * TAU, s: 0.7 + pr() * 0.8, ph: ci + y * 6, side: i % 2 ? 1 : -1, light: pr() > 0.75 }); } });
  const leafM = new THREE.MeshStandardMaterial({ color: 0x163a2a, roughness: 0.7, side: THREE.DoubleSide, emissive: 0x0a2a1c, emissiveIntensity: 0.4 });
  const leafInst = new THREE.InstancedMesh(leafGeo, leafM, leaves.length);
  const lc = new THREE.Color();
  leaves.forEach((l, i) => leafInst.setColorAt(i, lc.set(l.light ? 0x9bd36a : 0x1c3a26)));
  leafInst.frustumCulled = false; aq.add(leafInst);
  const dummy = new THREE.Object3D();
  anim.push((t) => {
    leaves.forEach((l, i) => {
      const sway = Math.sin(t * 0.9 + l.ph) * 0.05 * (l.y * 3);
      dummy.position.set(l.x + sway, AQ.y0 + 0.09 + l.y, l.z);
      dummy.rotation.set(0, l.a, l.side * (0.9 + Math.sin(t * 1.3 + l.ph) * 0.15));
      dummy.scale.setScalar(l.s); dummy.updateMatrix(); leafInst.setMatrixAt(i, dummy.matrix);
    });
    leafInst.instanceMatrix.needsUpdate = true;
  });
  // ribice: prate kursor/prst, kucanje po staklu ih rasprši
  const fishGeo = new THREE.SphereGeometry(0.03, 10, 6); fishGeo.scale(1.8, 0.7, 0.5);
  const tailGeo = new THREE.ConeGeometry(0.02, 0.03, 4); tailGeo.rotateZ(Math.PI / 2); tailGeo.translate(-0.065, 0, 0);
  const fishGeom = mergeTwo(fishGeo, tailGeo);
  const fishM = new THREE.MeshStandardMaterial({ color: 0xc9d6e6, roughness: 0.35, metalness: 0.5, emissive: 0x0c2a33, emissiveIntensity: 0.6 });
  const fish = []; const fr = rng(19);
  const fishInst = new THREE.InstancedMesh(fishGeom, fishM, 9);
  for (let i = 0; i < 9; i++) fish.push({ p: new THREE.Vector3(AQ.x0 + 0.2 + fr() * 1.9, AQ.y0 + 0.25 + fr() * 0.5, aqBack + 0.15 + fr() * 0.35), v: new THREE.Vector3((fr() - 0.5) * 0.2, 0, 0), ph: fr() * 10, s: 0.7 + fr() * 0.6 });
  fishInst.frustumCulled = false; aq.add(fishInst);
  const fishGoal = { x: null, y: null, until: 0, scatter: 0 };
  anim.push((t, dt) => {
    fish.forEach((f, i) => {
      const tx = fishGoal.x != null && t < fishGoal.until ? fishGoal.x + Math.sin(t + i) * 0.12 : Math.sin(t * 0.18 + f.ph) * 0.95;
      const ty = fishGoal.y != null && t < fishGoal.until ? fishGoal.y + Math.cos(t * 1.3 + i) * 0.06 : AQ.y0 + 0.45 + Math.sin(t * 0.3 + f.ph * 2) * 0.22;
      const k = t < fishGoal.scatter ? -2.4 : 0.9;
      f.v.x += ((tx - f.p.x) * k - f.v.x * 0.9) * dt; f.v.y += ((ty - f.p.y) * k * 0.7 - f.v.y * 0.9) * dt;
      f.v.clampLength(0, t < fishGoal.scatter ? 1.4 : 0.45);
      f.p.addScaledVector(f.v, dt);
      f.p.x = THREE.MathUtils.clamp(f.p.x, AQ.x0 + 0.08, AQ.x1 - 0.08); f.p.y = THREE.MathUtils.clamp(f.p.y, AQ.y0 + 0.16, AQ.y1 - 0.08);
      dummy.position.copy(f.p); dummy.rotation.set(0, f.v.x < 0 ? Math.PI : 0, Math.sin(t * 6 + f.ph) * 0.12 + f.v.y * 0.6);
      dummy.scale.setScalar(f.s); dummy.updateMatrix(); fishInst.setMatrixAt(i, dummy.matrix);
    });
    fishInst.instanceMatrix.needsUpdate = true;
  });
  // mjehurići
  const bubN = 70, bubGeo = new THREE.BufferGeometry(), bubP = new Float32Array(bubN * 3), bubS = new Float32Array(bubN);
  const br = rng(5); for (let i = 0; i < bubN; i++) { bubP[i * 3] = (br() < 0.5 ? -0.75 : 0.62) + (br() - 0.5) * 0.08; bubP[i * 3 + 1] = AQ.y0; bubP[i * 3 + 2] = aqBack + 0.15 + br() * 0.25; bubS[i] = br(); }
  bubGeo.setAttribute('position', new THREE.BufferAttribute(bubP, 3)); bubGeo.setAttribute('seed', new THREE.BufferAttribute(bubS, 1));
  const bubMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uTime: { value: 0 } },
    vertexShader: 'attribute float seed; uniform float uTime; varying float vA; void main(){ vec3 p = position; float t = fract(uTime*(0.12+seed*0.12)+seed); p.y += t*' + (AQ.y1 - AQ.y0 - 0.1).toFixed(2) + '; p.x += sin(uTime*2.0+seed*20.0)*0.012; vA = smoothstep(0.0,0.08,t)*smoothstep(1.0,0.85,t); vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = (2.0+seed*3.5)*(4.0/-mv.z); }',
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.35,d)-smoothstep(0.32,0.1,d)*0.6; gl_FragColor = vec4(0.8,1.0,1.0,a*vA*0.9); }'
  });
  const bubbles = new THREE.Points(bubGeo, bubMat); bubbles.frustumCulled = false; aq.add(bubbles);
  // prednje staklo (blagi odsjaj)
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(AQ.x1 - AQ.x0, AQ.y1 - AQ.y0), new THREE.MeshPhysicalMaterial({ color: 0x9fe8f0, transparent: true, opacity: 0.08, roughness: 0.05, metalness: 0, depthWrite: false }));
  glass.position.set(0, (AQ.y0 + AQ.y1) / 2, BACK + 0.005); aq.add(glass);
  const aqHit = new THREE.Mesh(new THREE.BoxGeometry(AQ.x1 - AQ.x0, AQ.y1 - AQ.y0, 0.1), new THREE.MeshBasicMaterial({ visible: false })); aqHit.position.set(0, (AQ.y0 + AQ.y1) / 2, BACK); aq.add(aqHit);
  items.aquarium = { group: aq, hit: aqHit, mats: [], anchor: new THREE.Vector3(0.9, AQ.y1 + 0.08, BACK) };

  /* ---------- sto i stolice ---------- */
  const deskY = 0.78, deskZ = -1.05;
  const deskM = mat(0xbfc4d2, 0.4, 0);
  const top = new THREE.Mesh(roundedBox(2.5, 0.06, 1.05, 0.02), deskM); top.rotation.x = -Math.PI / 2; top.rotation.x = 0;
  top.position.set(0, deskY - 0.03, deskZ); top.receiveShadow = shadows; top.castShadow = shadows; scene.add(top);
  const apron = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 0.95), mat(0xc9ccd8, 0.5)); apron.position.set(0, deskY - 0.12, deskZ); scene.add(apron);
  const legM = mat(0x0c0e18, 0.5, 0.5);
  for (const x of [-0.95, 0.95]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, deskY - 0.18, 0.75), legM); l.position.set(x, (deskY - 0.18) / 2, deskZ); l.castShadow = shadows; scene.add(l); }
  const chairM = mat(0x0b0c14, 0.45, 0.3);
  for (const s of [-1, 1]) {
    const ch = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 28), mat(0x241c22, 0.8)); seat.position.y = 0.47; ch.add(seat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.018, 8, 40, Math.PI * 1.3), chairM); ring.rotation.x = Math.PI / 2; ring.rotation.z = Math.PI * 0.85; ring.position.y = 0.72; ch.add(ring);
    for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.4; const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.48, 6), chairM); leg.position.set(Math.cos(a) * 0.17, 0.235, Math.sin(a) * 0.17); leg.rotation.set(Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18); ch.add(leg); }
    for (const a of [Math.PI * 0.95, Math.PI * 1.6]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 6), chairM); p.position.set(Math.cos(a) * 0.25, 0.6, Math.sin(a) * 0.25); ch.add(p); }
    ch.position.set(s * 1.45, 0, deskZ + 0.45); ch.rotation.y = s * 0.7 + Math.PI; ch.traverse((o) => { if (o.isMesh) o.castShadow = shadows; });
    scene.add(ch);
  }

  /* ---------- predmeti na stolu ---------- */
  const beige = () => mat(0xb8b2a2, 0.55);
  function reg(key, group, hitSize, hitPos, anchor) {
    const hit = new THREE.Mesh(new THREE.BoxGeometry(...hitSize), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.copy(hitPos); group.add(hit);
    const mats = []; group.traverse((o) => { if (o.isMesh && o !== hit && o.material && o.material.isMeshStandardMaterial && !mats.includes(o.material)) mats.push(o.material); });
    group.traverse((o) => { if (o.isMesh && o !== hit) { o.castShadow = shadows; o.receiveShadow = shadows; } });
    items[key] = { group, hit, mats, anchor };
  }

  // monitor (CRT) na kućištu računara
  const crt = new THREE.Group(); crt.position.set(0.22, deskY, deskZ - 0.18); scene.add(crt);
  const crtBody = new THREE.Mesh(roundedBox(0.5, 0.42, 0.44, 0.03), beige()); crtBody.position.set(0, 0.25, -0.02); crt.add(crtBody);
  const crtBack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.3, 0.2), beige()); crtBack.position.set(0, 0.24, -0.3); crt.add(crtBack);
  const bezel = new THREE.Mesh(roundedBox(0.43, 0.34, 0.02, 0.008), mat(0x2a2a2e, 0.6)); bezel.position.set(0, 0.26, 0.205); crt.add(bezel);
  const scrGeo = new THREE.PlaneGeometry(0.37, 0.28, 16, 12);
  { const p = scrGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) / 0.185, y = p.getY(i) / 0.14; p.setZ(i, (1 - x * x * 0.5 - y * y * 0.5) * 0.012); } scrGeo.computeVertexNormals(); }
  const screenMat = new THREE.MeshBasicMaterial({ map: opts.crtTexture, color: new THREE.Color(1.5, 1.5, 1.5), toneMapped: false, fog: false });
  const screen = new THREE.Mesh(scrGeo, screenMat); screen.position.set(0, 0.26, 0.215); crt.add(screen);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.38), beige()); base.position.set(0, 0.02, -0.04); crt.add(base);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12), mat(0x333, 0.4)); knob.rotation.x = Math.PI / 2; knob.position.set(0.2, 0.08, 0.21); crt.add(knob);
  // ceduljice (usluge) na rubu monitora
  const notes = new THREE.Group(); crt.add(notes);
  const noteM = (i) => mat(0xd8cf86, 0.85, 0, { side: THREE.DoubleSide, map: opts.noteTextures[i] });
  [[-0.25, 0.4, -0.25], [-0.27, 0.27, 0.12], [0.255, 0.43, 0.2], [0.27, 0.3, -0.1]].forEach(([x, y, rz], i) => { const n = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.075), noteM(i)); n.position.set(x, y, 0.218); n.rotation.z = rz; notes.add(n); });
  reg('monitor', crt, [0.42, 0.34, 0.12], new THREE.Vector3(0, 0.26, 0.2), new THREE.Vector3(0.22, deskY + 0.56, deskZ - 0.0));
  const notesHit = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.05), new THREE.MeshBasicMaterial({ visible: false })); notesHit.position.set(-0.26, 0.34, 0.23); crt.add(notesHit);
  items.notes = { group: notes, hit: notesHit, mats: [], anchor: new THREE.Vector3(0.22 - 0.3, deskY + 0.5, deskZ + 0.02) };

  // tastatura (tehnologije)
  const kb = new THREE.Group(); kb.position.set(0.22, deskY, deskZ + 0.27); scene.add(kb);
  const kbBody = new THREE.Mesh(roundedBox(0.5, 0.045, 0.18, 0.012), beige()); kbBody.position.y = 0.025; kbBody.rotation.x = -0.08; kb.add(kbBody);
  const keyGeo = new THREE.BoxGeometry(0.027, 0.012, 0.027);
  const keyM = new THREE.MeshStandardMaterial({ color: 0x2b2a2e, roughness: 0.6 });
  const keyCount = 14 * 4; const keys = new THREE.InstancedMesh(keyGeo, keyM, keyCount); const kc = new THREE.Color();
  let ki = 0; for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) { dummy.position.set(-0.205 + c * 0.0315 + r * 0.006, 0.054 - r * 0.004, -0.05 + r * 0.032); dummy.rotation.set(-0.08, 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); keys.setMatrixAt(ki, dummy.matrix); keys.setColorAt(ki, kc.set(0x2b2a2e)); ki++; }
  keys.frustumCulled = false; kb.add(keys);
  reg('keyboard', kb, [0.52, 0.08, 0.2], new THREE.Vector3(0, 0.04, 0), new THREE.Vector3(0.22, deskY + 0.12, deskZ + 0.3));
  items.keyboard.keys = keys;

  // disk-drajv sa zelenom lampicom + kutija sa disketama (vremenska linija)
  const dd = new THREE.Group(); dd.position.set(-0.32, deskY, deskZ - 0.2); scene.add(dd);
  const ddBody = new THREE.Mesh(roundedBox(0.3, 0.1, 0.32, 0.012), beige()); ddBody.position.y = 0.05; dd.add(ddBody);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.008, 0.01), mat(0x111, 0.8)); slot.position.set(-0.02, 0.06, 0.161); dd.add(slot);
  const ledM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 3, 0.8), toneMapped: false });
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.006, 0.006), ledM); led.position.set(0.11, 0.06, 0.162); dd.add(led);
  const floppyBox = new THREE.Group(); floppyBox.position.set(-0.78, deskY, deskZ + 0.22); scene.add(floppyBox);
  const fbox = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.13), mat(0x1a1c2a, 0.4, 0.1, { transparent: true, opacity: 0.85 })); fbox.position.y = 0.04; floppyBox.add(fbox);
  const floppies = [];
  for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.09, 0.09), mat(i % 2 ? 0x22253a : 0x2b2f4a, 0.5)); f.position.set(-0.06 + i * 0.028, 0.085, 0); f.rotation.z = (i - 2) * 0.06; floppyBox.add(f); floppies.push(f); }
  const flyFloppy = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.004, 0.09), mat(0x2b2f4a, 0.5)); flyFloppy.visible = false; scene.add(flyFloppy);
  reg('floppies', floppyBox, [0.22, 0.2, 0.2], new THREE.Vector3(0, 0.08, 0), new THREE.Vector3(-0.78, deskY + 0.22, deskZ + 0.22));
  const ddHit = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.34), new THREE.MeshBasicMaterial({ visible: false })); ddHit.position.y = 0.06; dd.add(ddHit);
  items.drive = { group: dd, hit: ddHit, mats: [], led: ledM, anchor: new THREE.Vector3(-0.32, deskY + 0.2, deskZ - 0.2) };
  items.floppies.fly = flyFloppy; items.floppies.drive = dd;

  // crveni telefon na brojčanik
  const ph = new THREE.Group(); ph.position.set(-0.62, deskY, deskZ - 0.12); ph.rotation.y = 0.35; scene.add(ph);
  const redM = new THREE.MeshPhysicalMaterial({ color: 0x9e0e18, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const phBodyShape = new THREE.Shape(); phBodyShape.moveTo(-0.11, 0); phBodyShape.lineTo(0.11, 0); phBodyShape.quadraticCurveTo(0.12, 0.09, 0.07, 0.11); phBodyShape.lineTo(-0.07, 0.11); phBodyShape.quadraticCurveTo(-0.12, 0.09, -0.11, 0);
  const phBody = new THREE.Mesh(new THREE.ExtrudeGeometry(phBodyShape, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 4, curveSegments: 10 }), redM);
  phBody.position.set(0, 0, -0.08); ph.add(phBody);
  const dialTex = canvas(128, 128, (g, w) => { g.fillStyle = '#e9ecf4'; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, TAU); g.fill(); g.fillStyle = '#9e0e18'; for (let i = 0; i < 10; i++) { const a = -Math.PI * 0.35 + i * (Math.PI * 1.55 / 10); g.beginPath(); g.arc(w / 2 + Math.cos(a) * 44, w / 2 + Math.sin(a) * 44, 9, 0, TAU); g.fill(); } g.fillStyle = '#c9ced9'; g.beginPath(); g.arc(w / 2, w / 2, 22, 0, TAU); g.fill(); });
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.01, 32), [mat(0xdfe2ea, 0.4), new THREE.MeshStandardMaterial({ map: dialTex, roughness: 0.4 }), mat(0xdfe2ea, 0.4)]);
  dial.rotation.x = -0.55; dial.position.set(0, 0.105, 0.075); ph.add(dial);
  const handset = new THREE.Group(); handset.position.set(0, 0.15, 0); ph.add(handset);
  const hsCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.13, 0, 0), new THREE.Vector3(-0.08, 0.035, 0), new THREE.Vector3(0.08, 0.035, 0), new THREE.Vector3(0.13, 0, 0)]);
  handset.add(new THREE.Mesh(new THREE.TubeGeometry(hsCurve, 20, 0.022, 10), redM));
  for (const s of [-1, 1]) { const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.03, 0.05, 18), redM); cup.position.set(s * 0.13, -0.012, 0); handset.add(cup); }
  const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.12, 0.02, -0.05), new THREE.Vector3(-0.2, 0.0, 0.0), new THREE.Vector3(-0.22, -0.0, 0.12), new THREE.Vector3(-0.15, 0.0, 0.16)]), 20, 0.005, 6), mat(0x5e0a10, 0.6)); ph.add(cord);
  reg('phone', ph, [0.36, 0.24, 0.3], new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(-0.62, deskY + 0.3, deskZ - 0.12));
  items.phone.handset = handset; items.phone.dial = dial;

  // telefonska sekretarica (O meni) sa crvenom lampicom
  const am = new THREE.Group(); am.position.set(-0.93, deskY, deskZ - 0.3); am.rotation.y = 0.25; scene.add(am);
  const amBody = new THREE.Mesh(roundedBox(0.26, 0.075, 0.19, 0.012), mat(0x2a2b36, 0.4, 0.15)); amBody.position.y = 0.0375; am.add(amBody);
  const amLedM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.15, 0.2), toneMapped: false });
  const amLed = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 12), amLedM); amLed.position.set(0.095, 0.077, 0.055); am.add(amLed);
  const amScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.036), new THREE.MeshBasicMaterial({ map: opts.amTexture, toneMapped: false })); amScreen.rotation.x = -Math.PI / 2; amScreen.position.set(0.035, 0.0765, 0.045); am.add(amScreen);
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.004, 0.06), mat(0x0a0a10, 0.2, 0.3)); tape.position.set(-0.06, 0.077, -0.03); am.add(tape);
  [-0.09, -0.06, -0.03].forEach((x, i) => { const bt = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.008, 0.016), mat(i === 0 ? 0x9e0e18 : 0x5a5d6c, 0.5)); bt.position.set(x, 0.078, 0.055); am.add(bt); });
  const grill = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.05), mat(0x111218, 0.9)); grill.rotation.x = -Math.PI / 2; grill.position.set(0.075, 0.0765, -0.035); am.add(grill);
  reg('answering', am, [0.3, 0.15, 0.24], new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(-0.93, deskY + 0.2, deskZ - 0.3));
  items.answering.led = amLedM;

  // džezva i fildžan na tacni, sa parom
  const cf = new THREE.Group(); cf.position.set(0.82, deskY, deskZ + 0.22); scene.add(cf);
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 40), mat(0x8a8f9e, 0.35, 0.8)); tray.position.y = 0.005; cf.add(tray);
  const dz = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.045, 0], [0.05, 0.02], [0.045, 0.06], [0.036, 0.09], [0.04, 0.1], [0.038, 0.1]].map(([x, y]) => new THREE.Vector2(x, y)), 28), mat(0x8c6d5e, 0.35, 0.85));
  dz.position.set(-0.05, 0.01, -0.02); cf.add(dz);
  const dzHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 8), mat(0x1a1a1e, 0.5)); dzHandle.rotation.z = Math.PI / 2 - 0.35; dzHandle.position.set(-0.14, 0.09, -0.02); cf.add(dzHandle);
  const cup = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.022, 0], [0.032, 0.012], [0.036, 0.05], [0.034, 0.05]].map(([x, y]) => new THREE.Vector2(x, y)), 28), mat(0xf2f3f7, 0.3));
  cup.position.set(0.06, 0.012, 0.03); cf.add(cup);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.031, 24), mat(0x1a0c06, 0.2)); coffee.rotation.x = -Math.PI / 2; coffee.position.set(0.06, 0.056, 0.03); cf.add(coffee);
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.006, 28), mat(0xf2f3f7, 0.3)); saucer.position.set(0.06, 0.012, 0.03); cf.add(saucer);
  const steamN = 26, stGeo = new THREE.BufferGeometry(), stP = new Float32Array(steamN * 3), stS = new Float32Array(steamN);
  const sr = rng(23); for (let i = 0; i < steamN; i++) { stP[i * 3] = 0.06; stP[i * 3 + 1] = 0.06; stP[i * 3 + 2] = 0.03; stS[i] = sr(); }
  stGeo.setAttribute('position', new THREE.BufferAttribute(stP, 3)); stGeo.setAttribute('seed', new THREE.BufferAttribute(stS, 1));
  const steamMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, uniforms: { uTime: { value: 0 } },
    vertexShader: 'attribute float seed; uniform float uTime; varying float vA; void main(){ vec3 p = position; float t = fract(uTime*0.25+seed); p.y += t*0.22; p.x += sin(t*6.0+seed*9.0)*0.02*t; p.z += cos(t*5.0+seed*7.0)*0.015*t; vA = smoothstep(0.0,0.2,t)*(1.0-t); vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = (14.0+t*40.0)*(1.0/-mv.z); }',
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.0,d)*vA*0.22; gl_FragColor = vec4(0.85,0.9,1.0,a); }'
  });
  const steam = new THREE.Points(stGeo, steamMat); steam.frustumCulled = false; cf.add(steam);
  reg('coffee', cf, [0.34, 0.2, 0.34], new THREE.Vector3(0, 0.08, 0), new THREE.Vector3(0.82, deskY + 0.24, deskZ + 0.22));

  // kasetofon (zvuk)
  const cs = new THREE.Group(); cs.position.set(0.98, deskY, deskZ - 0.3); cs.rotation.y = -0.3; scene.add(cs);
  const csBody = new THREE.Mesh(roundedBox(0.26, 0.12, 0.08, 0.012), mat(0x17181f, 0.45, 0.2)); csBody.position.y = 0.06; cs.add(csBody);
  const csWin = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.05), new THREE.MeshBasicMaterial({ map: opts.cassetteTexture, toneMapped: false })); csWin.position.set(-0.04, 0.065, 0.041); cs.add(csWin);
  const spk = new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), mat(0x0a0a0e, 0.9)); spk.position.set(0.075, 0.06, 0.041); cs.add(spk);
  const csLedM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 0.4, 0.45), toneMapped: false });
  const csLed = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.006, 0.004), csLedM); csLed.position.set(0.075, 0.105, 0.041); cs.add(csLed);
  reg('cassette', cs, [0.3, 0.18, 0.14], new THREE.Vector3(0, 0.06, 0), new THREE.Vector3(0.98, deskY + 0.2, deskZ - 0.3));
  items.cassette.led = csLedM;

  // stona lampa (prekidač za svjetlo)
  const lp = new THREE.Group(); lp.position.set(1.08, deskY, deskZ - 0.05); scene.add(lp);
  const lpM = mat(0x0e0f16, 0.4, 0.6);
  const lpBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 24), lpM); lpBase.position.y = 0.01; lp.add(lpBase);
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.38, 8), lpM); arm1.position.set(0, 0.2, -0.04); arm1.rotation.x = -0.25; lp.add(arm1);
  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8), lpM); arm2.position.set(-0.06, 0.4, -0.06); arm2.rotation.z = 1.0; lp.add(arm2);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0x0e0f16, roughness: 0.4, metalness: 0.6, side: THREE.DoubleSide })); head.position.set(-0.17, 0.43, -0.07); head.rotation.z = 0.9; lp.add(head);
  const bulbM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.25, 0.3), toneMapped: false });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), bulbM); bulb.position.set(-0.19, 0.41, -0.07); lp.add(bulb);
  reg('lamp', lp, [0.3, 0.5, 0.2], new THREE.Vector3(-0.08, 0.24, -0.05), new THREE.Vector3(1.0, deskY + 0.56, deskZ - 0.1));
  items.lamp.bulb = bulbM;

  /* ---------- zidni predmeti ---------- */
  // plakat "SKOČI." (lijevo od akvarijuma)
  const poster = new THREE.Group(); poster.position.set(-2.25, 1.72, BACK + 0.02); scene.add(poster);
  const pFrame = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.14, 0.03), mat(0x8c7a52, 0.5, 0.4)); poster.add(pFrame);
  const pImg = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.08), new THREE.MeshStandardMaterial({ map: opts.posterTexture, roughness: 0.75, emissiveMap: opts.posterTexture, emissive: 0xffffff, emissiveIntensity: 0.28 })); pImg.position.z = 0.017; poster.add(pImg);
  reg('poster', poster, [0.85, 1.18, 0.08], new THREE.Vector3(0, 0, 0.03), new THREE.Vector3(-2.25, 2.35, BACK + 0.1));
  // zidni sat (mostarsko vrijeme)
  const clock = new THREE.Group(); clock.position.set(2.1, 2.1, BACK + 0.03); scene.add(clock);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 40), [mat(0x101326, 0.5), new THREE.MeshStandardMaterial({ map: opts.clockTexture, roughness: 0.5, emissiveMap: opts.clockTexture, emissive: 0xffffff, emissiveIntensity: 0.12 }), mat(0x101326, 0.5)]);
  face.rotation.x = Math.PI / 2; clock.add(face);
  const hourH = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.1, 0.006), mat(0x0d0f1c, 0.4)); hourH.geometry.translate(0, 0.045, 0); hourH.position.z = 0.02; clock.add(hourH);
  const minH = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.15, 0.006), mat(0x0d0f1c, 0.4)); minH.geometry.translate(0, 0.07, 0); minH.position.z = 0.024; clock.add(minH);

  /* ---------- raspored: širok ekran ili uspravan mobitel ---------- */
  // stolni predmeti: [x, z, okret]; zidni: [x, y, veličina]
  const LAYOUT = {
    wide: { monitor: [0.22, deskZ - 0.18, 0], keyboard: [0.22, deskZ + 0.27, 0], drive: [-0.32, deskZ - 0.2, 0], floppies: [-0.78, deskZ + 0.22, 0], phone: [-0.62, deskZ - 0.12, 0.35], answering: [-0.93, deskZ - 0.3, 0.25], coffee: [0.82, deskZ + 0.22, 0], cassette: [0.98, deskZ - 0.3, -0.3], lamp: [1.08, deskZ - 0.05, 0], poster: [-2.25, 1.72, 1], clock: [2.1, 2.1, 1] },
    tall: { monitor: [0, deskZ - 0.2, 0], keyboard: [0, deskZ + 0.26, 0], drive: [-0.43, deskZ - 0.36, 0.12], floppies: [-0.62, deskZ + 0.36, 0.2], phone: [-0.5, deskZ + 0.06, 0.3], answering: [-0.72, deskZ - 0.38, 0.3], coffee: [0.5, deskZ + 0.3, 0], cassette: [0.48, deskZ - 0.34, -0.25], lamp: [0.74, deskZ - 0.04, 0], poster: [-0.7, 2.3, 0.6], clock: [0.75, 2.38, 0.7] }
  };
  const groups = { monitor: crt, keyboard: kb, drive: dd, floppies: floppyBox, phone: ph, answering: am, coffee: cf, cassette: cs, lamp: lp, poster, clock };
  let layoutName = '';
  function setLayout(name) {
    if (name === layoutName) return;
    layoutName = name;
    const L = LAYOUT[name];
    for (const k in L) {
      const g = groups[k], [a, b, c] = L[k];
      if (k === 'poster' || k === 'clock') { g.position.set(a, b, g.position.z); g.scale.setScalar(c); }
      else { g.position.set(a, deskY, b); g.rotation.y = c; }
    }
    crtLight.position.set(crt.position.x + 0.03, deskY + 0.28, crt.position.z + 0.23);
    lampLight.position.set(lp.position.x - 0.13, deskY + 0.6, lp.position.z - 0.07);
    lampLight.target.position.set(lp.position.x - 0.73, deskY, lp.position.z + 0.15);
    scene.updateMatrixWorld(true);
  }
  setLayout(opts.layout || 'wide');

  /* ---------- prašina u zraku ---------- */
  const dustN = opts.mobile ? 260 : 520, dGeo = new THREE.BufferGeometry(), dP = new Float32Array(dustN * 3), dS = new Float32Array(dustN);
  const dr = rng(42); for (let i = 0; i < dustN; i++) { dP[i * 3] = (dr() - 0.5) * 5.5; dP[i * 3 + 1] = dr() * H; dP[i * 3 + 2] = BACK + dr() * 5.5; dS[i] = dr(); }
  dGeo.setAttribute('position', new THREE.BufferAttribute(dP, 3)); dGeo.setAttribute('seed', new THREE.BufferAttribute(dS, 1));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uTime: { value: 0 }, uPx: { value: 1 } },
    vertexShader: 'attribute float seed; uniform float uTime; uniform float uPx; varying float vA; void main(){ vec3 p = position; p.y = mod(p.y + uTime*0.02*(0.3+seed), 3.3); p.x += sin(uTime*0.2+seed*30.0)*0.15; p.z += cos(uTime*0.17+seed*20.0)*0.15; float shaft = smoothstep(2.4,0.6,abs(p.x))*smoothstep(-0.2,-1.6,p.z); float aq = smoothstep(1.8,0.2,length(p.xz-vec2(0.0,-2.5))); vA = (0.25+shaft*0.9+aq*0.8)*(0.4+0.6*sin(uTime*1.5+seed*40.0)*0.5+0.5); vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = (1.2+seed*1.8)*uPx*(3.0/-mv.z); }',
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.0,d)*vA*0.55; gl_FragColor = vec4(0.75,0.85,1.0,a); }'
  });
  const dust = new THREE.Points(dGeo, dustMat); dust.frustumCulled = false; scene.add(dust);

  /* ---------- svaki kadar ---------- */
  anim.push((t) => {
    rainMat.uniforms.uTime.value = t; shaftMat.uniforms.uTime.value = t; bubMat.uniforms.uTime.value = t; steamMat.uniforms.uTime.value = t; dustMat.uniforms.uTime.value = t;
    // akvarijum lagano "diše", monitor treperi
    aqLight.intensity = env.aq * (1 + Math.sin(t * 1.7) * 0.04);
    crtLight.intensity = 0.55 * (0.92 + Math.random() * 0.08);
    amLedM.color.setScalar(0).r = (Math.sin(t * 4) > 0 ? 3 : 0.3); amLedM.color.g = 0.12; amLedM.color.b = 0.15;
  });

  /* stanje svjetla (doba dana, lampa) */
  const env = { aq: 9 };
  function setLighting({ day = 0, dusk = 0, lit = false, intro = 1, aqIntro = 1 }) {
    // day 0..1 (noć..dan), dusk 0..1 (toplije nebo u svitanje/sumrak), lit = upaljena lampa
    const sk = new THREE.Color().setRGB(0.35 + day * 1.4, 0.45 + day * 1.4, 1.0 + day * 1.2);
    sk.lerp(new THREE.Color(1.4, 0.9, 0.9), dusk * 0.5);
    skyMat.color.copy(sk).multiplyScalar(intro);
    moon.intensity = (shadows ? 3.2 + day * 2.4 : 1.5 + day * 2.2) * intro;
    // noć hladno plava, dan skoro bijel, svitanje i sumrak ljubičasti
    moon.color.set(0x7f9bff).lerp(new THREE.Color(0xe4eaff), day).lerp(new THREE.Color(0xb592ff), dusk * 0.6);
    hemi.intensity = (0.45 + day * 1.5 + (lit ? 0.5 : 0)) * intro;
    hemi.color.set(0x2a3570).lerp(new THREE.Color(0x5a6cb0), day);
    scene.fog.color.set(0x070a1c).lerp(new THREE.Color(0x1a2348), day * 0.8);
    scene.background.set(0x05060f).lerp(new THREE.Color(0x141b3a), day);
    shaftMat.uniforms.uStrength.value = (0.2 + day * 0.18) * intro;
    shaftMat.uniforms.uColor.value.setRGB(0.45, 0.58, 1.0).lerp(new THREE.Color(0.75, 0.62, 1.0), dusk * 0.6);
    env.aq = 7.5 * aqIntro;
    aqBackM.color.setScalar(0.95 * aqIntro); aqFill.intensity = 3.5 * aqIntro;
    strip.material.color.setRGB(2.2 * aqIntro, 2.6 * aqIntro, 2.8 * aqIntro);
    lampLight.intensity = lit ? 6 : 0;
    roomFill.intensity = lit ? 0.9 : 0;
    bulbM.color.setScalar(lit ? 3 : 0.25);
    scene.fog.density = (lit ? 0.045 : 0.075) * (1 - day * 0.4);
  }

  function setClock(h, m) {
    minH.rotation.z = -m / 60 * TAU;
    hourH.rotation.z = -((h % 12) + m / 60) / 12 * TAU;
  }
  function setRain(on) { rain.visible = on; rainMat.uniforms.uAmount.value = on ? 1 : 0; shaftMat.uniforms.uRain.value = on ? 1 : 0; }
  function poke(point) {
    // kucanje po staklu: ribe se rasprše; inače prate tačku
    const t = performance.now() / 1000;
    if (point) { fishGoal.x = THREE.MathUtils.clamp(point.x, AQ.x0, AQ.x1); fishGoal.y = THREE.MathUtils.clamp(point.y, AQ.y0 + 0.15, AQ.y1); fishGoal.until = t + 4; }
  }
  function scatter() { fishGoal.scatter = performance.now() / 1000 + 1.2; }

  return { scene, items, groups, setLayout, anim, setLighting, setClock, setRain, poke, scatter, dustMat, shadows, lights: { moon, aqLight, lampLight }, deskY, deskZ, aqRect: { ...AQ, z: BACK } };
}

/* spoji dvije geometrije (tijelo ribe i rep) bez dodatnih biblioteka */
function mergeTwo(a, b) {
  const g = new THREE.BufferGeometry();
  a = a.toNonIndexed(); b = b.toNonIndexed();
  for (const name of ['position', 'normal']) {
    const A = a.attributes[name].array, B = b.attributes[name].array, out = new Float32Array(A.length + B.length);
    out.set(A); out.set(B, A.length); g.setAttribute(name, new THREE.BufferAttribute(out, 3));
  }
  return g;
}
