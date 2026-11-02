// Projects: cartridges on a shelf. Click one and it flies into the console slot.
import * as THREE from "three";
import {
  createStage, palette, onPalette, reducedMotion, disposeScene, fontsReady, canvasTexture,
} from "./core.js";

const CART_W = 1.8, CART_H = 2.1, CART_D = 0.32;
const GAP_X = 2.2, GAP_Y = 2.75, PLANK_H = 0.18;
const CONSOLE_DROP = 2.9; // distance from lowest plank to console top
const CONSOLE_Z = 0.4;
const EXTRA_HUE = "#9b7dff";

function hueHex(P, hue) {
  return [P.hex.accent, P.hex.accent2, P.hex.accent3, EXTRA_HUE][hue % 4];
}

function wrap(g, text, maxW) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function labelCanvas(project, index, P) {
  const W = 360, H = 420;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  const hue = hueHex(P, project.hue);

  g.fillStyle = P.hex.line; // cartridge shell
  g.fillRect(0, 0, W, H);
  g.fillStyle = P.hex.bg3; // grip ridges
  for (let y = 14; y < 70; y += 12) g.fillRect(30, y, W - 60, 5);

  const lx = 30, ly = 84, lw = W - 60, lh = H - 110, b = 6;
  g.fillStyle = hue;
  g.fillRect(lx, ly, lw, lh);
  g.fillStyle = P.hex.bg2;
  g.fillRect(lx + b, ly + 52, lw - b * 2, lh - 52 - b);

  g.textBaseline = "middle";
  g.fillStyle = P.hex.bg;
  g.font = "22px Silkscreen, monospace";
  g.fillText((project.tags[0] || "").toUpperCase(), lx + 14, ly + 28);
  g.textAlign = "right";
  g.fillText(String(index + 1).padStart(2, "0"), lx + lw - 14, ly + 28);
  g.textAlign = "left";

  g.fillStyle = P.hex.ink;
  g.font = '24px "Press Start 2P", monospace';
  const lines = wrap(g, project.title.toUpperCase(), lw - 36).slice(0, 5);
  lines.forEach((l, i) => g.fillText(l, lx + 18, ly + 92 + i * 38));

  g.fillStyle = P.hex.muted;
  g.font = "16px Silkscreen, monospace";
  g.fillText("GC-SYSTEM  ►", lx + 20, ly + lh - 26);
  return c;
}

export function mountProjects(canvas, { projects, onSelect }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  let lookY = 0;

  const toonRamp = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
  toonRamp.minFilter = toonRamp.magFilter = THREE.NearestFilter;
  toonRamp.needsUpdate = true;
  const toon = (color) => new THREE.MeshToonMaterial({ color, gradientMap: toonRamp });

  scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 1.4));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(4, 8, 10);
  scene.add(sun);

  const P0 = palette();
  const shellMat = toon(P0.line.clone());
  const plankMat = toon(P0.bg3.clone());
  const consoleMat = toon(P0.bg3.clone());
  const trimMat = new THREE.MeshBasicMaterial({ color: P0.accent.clone() });
  const ledMat = new THREE.MeshBasicMaterial({ color: P0.line.clone() });

  // --- cartridges
  const cartGeo = new THREE.BoxGeometry(CART_W, CART_H, CART_D);
  const carts = projects.map((p, i) => {
    const front = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(cartGeo, [shellMat, shellMat, shellMat, shellMat, front, shellMat]);
    mesh.userData.index = i;
    scene.add(mesh);
    return { mesh, front, home: new THREE.Vector3(), waypoints: [], hover: 0, inserted: false, delay: 0 };
  });

  // --- shelves + console (rebuilt on layout change)
  const shelf = new THREE.Group();
  scene.add(shelf);
  const consoleGroup = new THREE.Group();
  scene.add(consoleGroup);
  const body = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.0, 2.6), consoleMat);
  body.position.y = -0.5;
  const slot = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.04, 0.5), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  slot.position.y = 0.01;
  const trim = new THREE.Mesh(new THREE.BoxGeometry(5.42, 0.12, 0.02), trimMat);
  trim.position.set(0, -0.55, 1.31);
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.04), ledMat);
  led.position.set(-2.2, -0.25, 1.31);
  const btnA = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 8), new THREE.MeshBasicMaterial({ color: P0.accent2.clone() }));
  btnA.position.set(1.7, 0.04, 0.75);
  const btnB = btnA.clone();
  btnB.material = new THREE.MeshBasicMaterial({ color: P0.accent3.clone() });
  btnB.position.x = 2.25;
  consoleGroup.add(body, slot, trim, led, btnA, btnB);

  let current = null;
  let pending = null; // selection requested before first layout
  const spots = { above: new THREE.Vector3(), inserted: new THREE.Vector3() };
  let cols = 0;

  function layout(aspect) {
    const nextCols = aspect > 1.6 ? 6 : 3;
    if (nextCols === cols) return fitCamera(aspect);
    cols = nextCols;
    const rows = Math.ceil(carts.length / cols);

    shelf.children.forEach((m) => m.geometry.dispose());
    shelf.clear();
    for (let r = 0; r < rows; r++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(cols * GAP_X + 0.4, PLANK_H, 1.1), plankMat);
      plank.position.set(0, -r * GAP_Y - PLANK_H / 2, 0);
      shelf.add(plank);
    }
    carts.forEach((c, i) => {
      const r = Math.floor(i / cols), col = i % cols;
      const inRow = Math.min(cols, carts.length - r * cols);
      c.home.set((col - (inRow - 1) / 2) * GAP_X, -r * GAP_Y + CART_H / 2, 0);
      if (!c.inserted && !c.waypoints.length && !c.positioned) { c.mesh.position.copy(c.home); c.positioned = true; }
    });

    const consoleTop = -(rows - 1) * GAP_Y - CONSOLE_DROP;
    consoleGroup.position.set(0, consoleTop, CONSOLE_Z);
    spots.above.set(0, consoleTop + CART_H / 2 + 0.5, CONSOLE_Z);
    spots.inserted.set(0, consoleTop + CART_H / 2 - 0.85, CONSOLE_Z);
    fitCamera(aspect);
    if (pending != null) { const p = pending; pending = null; select(p); }
  }

  function fitCamera(aspect) {
    const rows = Math.ceil(carts.length / cols);
    const top = CART_H + 0.2;
    const bottom = -(rows - 1) * GAP_Y - CONSOLE_DROP - 1.1;
    const width = cols * GAP_X + 0.8;
    const height = top - bottom;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(height / 2 / t, width / 2 / (t * aspect)) * 1.08 + 1;
    lookY = (top + bottom) / 2;
    camera.position.set(0, lookY + 1.6, dist);
    camera.lookAt(0, lookY, 0);
  }

  const stage = createStage(canvas, {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    onResize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      layout(camera.aspect);
    },
  });

  function paint(P) {
    shellMat.color.copy(P.line);
    plankMat.color.copy(P.bg3);
    consoleMat.color.copy(P.bg3);
    trimMat.color.copy(P.accent);
    btnA.material.color.copy(P.accent2);
    btnB.material.color.copy(P.accent3);
    carts.forEach((c, i) => {
      if (c.front.map) c.front.map.dispose();
      c.front.map = canvasTexture(labelCanvas(projects[i], i, P));
      c.front.needsUpdate = true;
    });
  }
  paint(P0);
  fontsReady().then(() => paint(palette()));
  const offPalette = onPalette(paint);

  // --- selection
  const pullOf = (c) => c.home.clone().add(new THREE.Vector3(0, 0.15, 1.1));
  function select(i) {
    if (i == null || i === current || !carts[i]) return;
    if (!cols) { pending = i; return; }
    const prev = current != null ? carts[current] : null;
    if (prev) {
      prev.inserted = false;
      prev.waypoints = [spots.above.clone(), pullOf(prev)];
    }
    const c = carts[i];
    c.inserted = true;
    c.delay = prev ? 0.55 : 0;
    c.waypoints = [pullOf(c), spots.above.clone()];
    current = i;
    if (reducedMotion.matches) carts.forEach((k) => { k.waypoints = []; k.delay = 0; });
  }

  // --- pointer
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered = null;
  function pick(e) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(carts.map((c) => c.mesh), false)[0];
    return hit ? carts[hit.object.userData.index] : null;
  }
  const onMove = (e) => {
    hovered = pick(e);
    canvas.style.cursor = hovered && !hovered.inserted ? "pointer" : "default";
  };
  const onClick = (e) => {
    const c = pick(e);
    if (c && !c.inserted) onSelect && onSelect(c.mesh.userData.index);
  };
  const onLeave = () => { hovered = null; };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("pointerleave", onLeave);

  // --- frame
  const target = new THREE.Vector3();
  const ledOff = new THREE.Color(), ledOn = new THREE.Color();
  let time = 0;
  stage.setFrame((dt) => {
    const still = reducedMotion.matches;
    if (!still) time += dt;
    const k = still ? 1 : 1 - Math.exp(-dt * 7);
    let loaded = false;

    carts.forEach((c) => {
      const isHover = c === hovered && !c.inserted;
      c.hover += ((isHover ? 1 : 0) - c.hover) * (still ? 1 : 1 - Math.exp(-dt * 10));

      if (c.delay > 0) { c.delay -= dt; target.copy(c.waypoints[0] || c.home); }
      else if (c.waypoints.length) {
        target.copy(c.waypoints[0]);
        if (c.mesh.position.distanceTo(target) < 0.08) c.waypoints.shift();
      } else if (c.inserted) {
        target.copy(spots.inserted);
        if (c.mesh.position.distanceTo(target) < 0.05) loaded = true;
      } else {
        target.copy(c.home).add(new THREE.Vector3(0, 0.18 * c.hover, 0.55 * c.hover));
      }
      c.mesh.position.lerp(target, k);

      const moving = c.waypoints.length > 0;
      c.mesh.rotation.y = Math.sin(time * 3) * 0.18 * c.hover;
      c.mesh.rotation.x += ((moving ? -0.25 : 0) - c.mesh.rotation.x) * k;
    });

    const P = palette();
    ledOff.copy(P.line);
    ledOn.copy(P.accent);
    ledMat.color.lerp(loaded && Math.sin(time * 6) > -0.6 ? ledOn : ledOff, still ? 1 : 0.25);

    stage.renderer.render(scene, camera);
  });

  return {
    select,
    dispose() {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("pointerleave", onLeave);
      offPalette();
      stage.dispose();
      disposeScene(scene);
      toonRamp.dispose();
    },
  };
}
