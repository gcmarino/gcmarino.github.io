// Hero: infinite synthwave terrain + striped sun + stars, rendered at low resolution.
import * as THREE from "three";
import { createStage, palette, onPalette, reducedMotion, disposeScene } from "./core.js";

const TERRAIN_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  varying vec2 vGrid;
  varying float vH;
  varying float vDepth;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec3 p = position;
    float z = p.z - uTime * uSpeed;           // scrolling world coordinate
    float side = smoothstep(2.5, 9.0, abs(p.x)); // flat road in the middle
    float h = noise(vec2(p.x * 0.22, z * 0.22)) * 0.8
            + noise(vec2(p.x * 0.6, z * 0.6)) * 0.25;
    h *= side * (1.5 + abs(p.x) * 0.22);
    p.y += h;
    vGrid = vec2(p.x, z) * 0.5;
    vH = h;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const TERRAIN_FRAG = /* glsl */ `
  uniform vec3 uLine;
  uniform vec3 uPeak;
  uniform vec3 uBg;
  uniform float uFar;
  varying vec2 vGrid;
  varying float vH;
  varying float vDepth;

  void main() {
    vec2 w = fwidth(vGrid);
    vec2 a = abs(fract(vGrid - 0.5) - 0.5) / w;
    float line = 1.0 - min(min(a.x, a.y), 1.0);
    float k = clamp(vH / 6.0, 0.0, 1.0);
    vec3 fill = mix(uBg, uPeak * 0.25 + uBg, k);
    vec3 col = mix(fill, mix(uLine, uPeak, k), line);
    col = mix(col, uBg, smoothstep(uFar * 0.3, uFar, vDepth));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const SUN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const SUN_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBot;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c);
    float y = vUv.y;
    // glow halo
    if (d > 0.32) {
      float g = smoothstep(0.5, 0.32, d) * 0.35;
      if (g <= 0.0) discard;
      gl_FragColor = vec4(uBot, g);
      #include <colorspace_fragment>
      return;
    }
    // retro stripes in the lower half, thicker toward the bottom
    float yy = (y - 0.18) / 0.64;
    float band = fract(yy * 10.0 - uTime * 0.25);
    float gap = smoothstep(0.55, 0.0, yy) * 0.7;
    if (yy < 0.55 && band < gap) discard;
    gl_FragColor = vec4(mix(uBot, uTop, smoothstep(0.15, 0.85, yy)), 1.0);
    #include <colorspace_fragment>
  }
`;

export function mountHero(canvas) {
  const P = palette();
  const scene = new THREE.Scene();
  scene.background = P.bg.clone();

  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 200);
  const LOOK = new THREE.Vector3(0, 3.2, -30);

  const stage = createStage(canvas, {
    pixelRatio: 0.5, // chunky pixels: 1 render pixel = 2 CSS px
    alpha: false,
    onResize(w, h) {
      camera.aspect = w / h;
      // keep the horizon wide on portrait screens
      camera.fov = w / h < 1 ? 78 : 62;
      camera.updateProjectionMatrix();
    },
  });

  // --- terrain
  const W = 70, D = 120;
  const terrainGeo = new THREE.PlaneGeometry(W, D, 70, 120);
  terrainGeo.rotateX(-Math.PI / 2);
  terrainGeo.translate(0, 0, -D / 2 + 8);
  const terrainU = {
    uTime: { value: 0 },
    uSpeed: { value: 5 },
    uLine: { value: P.accent.clone() },
    uPeak: { value: P.accent2.clone() },
    uBg: { value: P.bg.clone() },
    uFar: { value: 105 },
  };
  scene.add(new THREE.Mesh(terrainGeo, new THREE.ShaderMaterial({
    uniforms: terrainU, vertexShader: TERRAIN_VERT, fragmentShader: TERRAIN_FRAG,
  })));

  // --- sun
  const sunU = { uTop: { value: P.accent3.clone() }, uBot: { value: P.accent2.clone() }, uTime: terrainU.uTime };
  const sun = new THREE.Mesh(
    new THREE.PlaneGeometry(52, 52),
    new THREE.ShaderMaterial({ uniforms: sunU, vertexShader: SUN_VERT, fragmentShader: SUN_FRAG, transparent: true, depthWrite: false })
  );
  sun.position.set(0, 9, -95);
  scene.add(sun);

  // --- stars
  const N = 420, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 220;
    pos[i * 3 + 1] = 4 + Math.random() * 70;
    pos[i * 3 + 2] = -100 - Math.random() * 20;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const starMat = new THREE.PointsMaterial({ color: P.ink.clone(), size: 1.5, sizeAttenuation: false, transparent: true, opacity: 0.7 });
  scene.add(new THREE.Points(starGeo, starMat));

  const offPalette = onPalette((p) => {
    scene.background.copy(p.bg);
    terrainU.uLine.value.copy(p.accent);
    terrainU.uPeak.value.copy(p.accent2);
    terrainU.uBg.value.copy(p.bg);
    sunU.uTop.value.copy(p.accent3);
    sunU.uBot.value.copy(p.accent2);
    starMat.color.copy(p.ink);
  });

  // --- mouse parallax
  const mouse = { x: 0, y: 0 };
  const onMove = (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  let time = 0;
  camera.position.set(0, 2.6, 8);
  stage.setFrame((dt) => {
    const still = reducedMotion.matches;
    if (!still) time += dt;
    terrainU.uTime.value = time;

    const k = still ? 1 : 1 - Math.exp(-dt * 3);
    const scroll = Math.min(window.scrollY / window.innerHeight, 1);
    camera.position.x += (mouse.x * 1.6 - camera.position.x) * k;
    camera.position.y += (2.6 - mouse.y * 0.5 + scroll * 2.5 - camera.position.y) * k;
    camera.lookAt(LOOK.x + mouse.x * 2, LOOK.y, LOOK.z);
    stage.renderer.render(scene, camera);
  });

  return {
    dispose() {
      window.removeEventListener("pointermove", onMove);
      offPalette();
      stage.dispose();
      disposeScene(scene);
    },
  };
}
