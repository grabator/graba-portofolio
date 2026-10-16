/*
 * Završna obrada slike: bloom (sjaj akvarijuma i ekrana), filmsko zrno, vinjeta i blaga
 * hromatska aberacija. Vlastiti mali "composer": scena se crta u HalfFloat bafer, svijetli
 * dijelovi se izdvoje u četvrtinu rezolucije, zamute i dodaju u završnom prolazu.
 */
import * as THREE from 'three';

const quadVS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

export function createPost(renderer, o = {}) {
  const size = new THREE.Vector2();
  const opts = { type: THREE.HalfFloatType, depthBuffer: true };
  const sceneRT = new THREE.WebGLRenderTarget(1, 1, { ...opts, samples: o.samples || 4 });
  const halfOpts = { type: THREE.HalfFloatType, depthBuffer: false };
  const rtA = new THREE.WebGLRenderTarget(1, 1, halfOpts);
  const rtB = new THREE.WebGLRenderTarget(1, 1, halfOpts);

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  const qScene = new THREE.Scene(); qScene.add(quad);

  const bright = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, uThreshold: { value: 0.9 } },
    vertexShader: quadVS,
    fragmentShader: 'uniform sampler2D tDiffuse; uniform float uThreshold; varying vec2 vUv; void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; float l = max(c.r, max(c.g, c.b)); float k = smoothstep(uThreshold, uThreshold + 0.9, l); gl_FragColor = vec4(c * k, 1.0); }'
  });
  const blur = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() } },
    vertexShader: quadVS,
    fragmentShader: 'uniform sampler2D tDiffuse; uniform vec2 uDir; varying vec2 vUv; void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb * 0.227; c += texture2D(tDiffuse, vUv + uDir * 1.385).rgb * 0.316; c += texture2D(tDiffuse, vUv - uDir * 1.385).rgb * 0.316; c += texture2D(tDiffuse, vUv + uDir * 3.231).rgb * 0.07; c += texture2D(tDiffuse, vUv - uDir * 3.231).rgb * 0.07; gl_FragColor = vec4(c, 1.0); }'
  });
  const final = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null }, tBloom: { value: null }, uBloom: { value: 1.0 }, uTime: { value: 0 },
      uExposure: { value: 1.0 }, uGrain: { value: 0.055 }, uVignette: { value: 1.0 }, uAberr: { value: 0.0018 }, uFade: { value: 1 }
    },
    vertexShader: quadVS,
    fragmentShader: [
      'uniform sampler2D tDiffuse; uniform sampler2D tBloom; uniform float uBloom; uniform float uTime; uniform float uExposure; uniform float uGrain; uniform float uVignette; uniform float uAberr; uniform float uFade; varying vec2 vUv;',
      'vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }',
      'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
      'void main(){',
      '  vec2 d = vUv - 0.5; float r2 = dot(d, d);',
      '  vec2 off = d * uAberr * (0.4 + r2 * 4.0);',
      '  vec3 c; c.r = texture2D(tDiffuse, vUv + off).r; c.g = texture2D(tDiffuse, vUv).g; c.b = texture2D(tDiffuse, vUv - off).b;',
      '  c += texture2D(tBloom, vUv).rgb * uBloom;',
      '  c = aces(c * uExposure);',
      '  c *= mix(1.0, smoothstep(0.95, 0.15, r2 * 2.2), uVignette * 0.85);',
      '  c = pow(c, vec3(1.0/2.2));',
      '  float n = hash(vUv * 1000.0 + fract(uTime) * 91.0) - 0.5;',
      '  c += n * uGrain;',
      '  gl_FragColor = vec4(c * uFade, 1.0);',
      '}'
    ].join('\n')
  });
  // kad je bloom ugašen (slabiji uređaji), isti završni prolaz sa crnom bloom teksturom
  const black = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); black.needsUpdate = true;

  let bloomOn = true;
  function setSize(w, h, dpr) {
    size.set(Math.max(1, Math.round(w * dpr)), Math.max(1, Math.round(h * dpr)));
    sceneRT.setSize(size.x, size.y);
    const bw = Math.max(1, size.x >> 2), bh = Math.max(1, size.y >> 2);
    rtA.setSize(bw, bh); rtB.setSize(bw, bh);
  }
  function pass(material, target) { quad.material = material; renderer.setRenderTarget(target); renderer.render(qScene, cam); }
  function render(scene, camera, t) {
    renderer.setRenderTarget(sceneRT); renderer.render(scene, camera);
    if (bloomOn) {
      bright.uniforms.tDiffuse.value = sceneRT.texture; pass(bright, rtA);
      for (let i = 0; i < 2; i++) {
        blur.uniforms.tDiffuse.value = rtA.texture; blur.uniforms.uDir.value.set((1 + i) / rtA.width, 0); pass(blur, rtB);
        blur.uniforms.tDiffuse.value = rtB.texture; blur.uniforms.uDir.value.set(0, (1 + i) / rtA.height); pass(blur, rtA);
      }
    }
    final.uniforms.tDiffuse.value = sceneRT.texture;
    final.uniforms.tBloom.value = bloomOn ? rtA.texture : black;
    final.uniforms.uTime.value = t;
    pass(final, null);
  }
  return {
    setSize, render, uniforms: final.uniforms,
    setBloom(on) { bloomOn = on; },
    get bloom() { return bloomOn; },
    dispose() { sceneRT.dispose(); rtA.dispose(); rtB.dispose(); }
  };
}
