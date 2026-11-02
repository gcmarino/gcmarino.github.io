// Stack: each category is an orbit, each technology a pixel chip travelling on it.
import * as THREE from "three";
import {
  createStage, palette, onPalette, reducedMotion, disposeScene, fontsReady, canvasTexture, chipCanvas,
} from "./core.js";

const ACCENTS = ["accent", "accent2", "accent3"];
const BASE_DIR = new THREE.Vector3(0, 10, 13).normalize();
const BASE_DIST = 16;

export function mountStack(canvas, { categories, onSelect }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.copy(BASE_DIR).multiplyScalar(BASE_DIST);
  camera.lookAt(0, 0, 0);

  let fitDist = BASE_DIST;
  const outerR = 2.0 + (categories.length - 1) * 0.62;
  const stage = createStage(canvas, {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    onResize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // fit the outer orbit (+ chip width) horizontally
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      fitDist = Math.max(BASE_DIST, ((outerR + 1.6) * (camera.aspect < 1 ? 1.25 : 1)) / (t * camera.aspect));
    },
  });

  const system = new THREE.Group();
  scene.add(system);

  // core
  const coreMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.9 });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), coreMat);
  system.add(core);

  const orbits = categories.map((cat, i) => {
    const r = 2.0 + i * 0.62;
    const ring = new THREE.Group();
    ring.rotation.x = (i % 2 ? 1 : -1) * (0.12 + i * 0.045);
    ring.rotation.z = Math.sin(i * 2.1) * 0.32;
    system.add(ring);

    const pts = [];
    for (let k = 0; k <= 128; k++) {
      const a = (k / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    const lineMat = new THREE.LineDashedMaterial({ dashSize: 0.16, gapSize: 0.12, transparent: true, opacity: 0.35 });
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
    line.computeLineDistances();
    line.userData.cat = i;
    ring.add(line);

    const spinner = new THREE.Group();
    ring.add(spinner);
    const sprites = cat.items.map((name, j) => {
      const a = (j / cat.items.length) * Math.PI * 2 + i * 0.7;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
      sprite.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      sprite.userData = { cat: i, name, base: new THREE.Vector2(1, 1), grow: 1 };
      spinner.add(sprite);
      return sprite;
    });

    return {
      r, ring, line, lineMat, spinner, sprites, opacity: 1,
      speed: (0.16 / (1 + i * 0.18)) * (i % 2 ? -1 : 1),
    };
  });

  const allSprites = orbits.flatMap((o) => o.sprites);
  const pickables = [...allSprites, ...orbits.map((o) => o.line)];

  function paint(P) {
    coreMat.color.copy(P.accent2);
    orbits.forEach((o, i) => {
      const key = ACCENTS[i % 3];
      o.lineMat.color.copy(P[key]);
      o.sprites.forEach((s) => {
        const c = chipCanvas(s.userData.name, P.hex[key], P);
        if (s.material.map) s.material.map.dispose();
        s.material.map = canvasTexture(c);
        s.material.needsUpdate = true;
        const hWorld = 0.5;
        s.userData.base.set((c.width / c.height) * hWorld, hWorld);
        s.scale.set(s.userData.base.x, s.userData.base.y, 1);
      });
    });
  }
  paint(palette());
  fontsReady().then(() => paint(palette())); // redraw once pixel fonts are in
  const offPalette = onPalette(paint);

  // --- selection
  let selected = null;
  function select(i) {
    selected = i == null ? null : i;
  }

  // --- pointer: hover, click, horizontal drag to spin
  const ray = new THREE.Raycaster();
  ray.params.Line.threshold = 0.12;
  const ndc = new THREE.Vector2();
  let hovered = null, drag = null, spinVel = 0;

  function pick(e) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, false)
      .find((h) => orbits[h.object.userData.cat].opacity > 0.5 || selected == null);
    return hit ? hit.object : null;
  }
  const onDown = (e) => { drag = { x: e.clientX, y: e.clientY, moved: 0 }; };
  const onMove = (e) => {
    if (drag) {
      const dx = e.clientX - drag.x;
      drag.moved += Math.abs(dx) + Math.abs(e.clientY - drag.y);
      drag.x = e.clientX; drag.y = e.clientY;
      system.rotation.y += dx * 0.006;
      spinVel = dx * 0.3;
    }
    hovered = pick(e);
    canvas.style.cursor = drag && drag.moved > 6 ? "grabbing" : hovered ? "pointer" : "grab";
  };
  const onUp = (e) => {
    if (drag && drag.moved < 6) {
      const hit = pick(e);
      const cat = hit ? hit.userData.cat : null;
      onSelect && onSelect(cat === selected ? null : cat);
    }
    drag = null;
  };
  const onLeave = () => { hovered = null; drag = null; };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointercancel", onLeave);

  // --- frame
  const normal = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  stage.setFrame((dt) => {
    const still = reducedMotion.matches;
    const k = still ? 1 : 1 - Math.exp(-dt * 5);

    if (!still) {
      if (!drag) system.rotation.y += dt * (0.05 + spinVel * 0.01);
      spinVel *= Math.exp(-dt * 3);
      core.rotation.x += dt * 0.3;
      core.rotation.y += dt * 0.45;
    }

    orbits.forEach((o, i) => {
      if (!still) o.spinner.rotation.y += dt * o.speed * (selected === i ? 0.35 : 1);
      const target = selected == null || selected === i ? 1 : 0.14;
      o.opacity += (target - o.opacity) * k;
      o.lineMat.opacity = (selected === i ? 0.95 : 0.35) * o.opacity;
      o.sprites.forEach((s) => {
        s.material.opacity = o.opacity;
        const g = (s === hovered ? 1.3 : 1) * (selected === i ? 1.25 : 1);
        s.userData.grow += (g - s.userData.grow) * k;
        s.scale.set(s.userData.base.x * s.userData.grow, s.userData.base.y * s.userData.grow, 1);
      });
    });

    // camera: tilt toward the selected orbit's plane and move in
    if (selected != null) {
      const o = orbits[selected];
      normal.set(0, 1, 0).applyQuaternion(o.ring.getWorldQuaternion(new THREE.Quaternion()));
      if (normal.dot(BASE_DIR) < 0) normal.negate();
      const dist = Math.min(fitDist, (o.r * 2.6 + 3) * Math.max(1, 1.2 / camera.aspect));
      camTarget.copy(BASE_DIR).lerp(normal, 0.55).normalize().multiplyScalar(dist);
    } else {
      camTarget.copy(BASE_DIR).multiplyScalar(fitDist);
    }
    camera.position.lerp(camTarget, still ? 1 : 1 - Math.exp(-dt * 2.5));
    camera.lookAt(0, 0, 0);

    stage.renderer.render(scene, camera);
  });

  return {
    select,
    dispose() {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
      offPalette();
      stage.dispose();
      disposeScene(scene);
    },
  };
}
