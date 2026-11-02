// Experience: voxel world map. Each job is a level node; scroll moves the player along the path.
import * as THREE from "three";
import {
  createStage, palette, onPalette, reducedMotion, disposeScene, fontsReady, canvasTexture, chipCanvas,
} from "./core.js";

const WORLD_GAP_X = 16.5;
const WORLD_ZIG_Z = 7;
const NODE_GAP = 4.2;
const FLOAT_LIFT = 3; // the "REMOTO" world floats above the sea
const CAM_OFFSET = new THREE.Vector3(0, 9, 11.5);
const ACCENTS = ["accent", "accent2", "accent3"];

const PLAYER = [
  "..XXXX..",
  ".XXXXXX.",
  ".XFFFFX.",
  ".XFEFEX.",
  ".XFFFFX.",
  "..XXXX..",
  ".AXXXXA.",
  "A.XXXX.A",
  "..X..X..",
  ".XX..XX.",
];

function hash(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function distToSegment(x, z, a, b) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t));
}

function playerCanvas(P) {
  const px = 8;
  const c = document.createElement("canvas");
  c.width = PLAYER[0].length * px;
  c.height = PLAYER.length * px;
  const g = c.getContext("2d");
  const colors = { X: P.hex.accent2, F: P.hex.ink, E: P.hex.bg, A: P.hex.accent };
  PLAYER.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!colors[ch]) return;
    g.fillStyle = colors[ch];
    g.fillRect(x * px, y * px, px, px);
  }));
  return c;
}

function makeSprite(canvas, height) {
  const mat = new THREE.SpriteMaterial({ map: canvasTexture(canvas), transparent: true, depthWrite: false });
  const s = new THREE.Sprite(mat);
  s.scale.set((canvas.width / canvas.height) * height, height, 1);
  return s;
}

function setSpriteCanvas(sprite, canvas, height) {
  sprite.material.map.dispose();
  sprite.material.map = canvasTexture(canvas);
  sprite.material.needsUpdate = true;
  sprite.scale.set((canvas.width / canvas.height) * height, height, 1);
}

/**
 * levels: [{ id: "1-1", world: 0, worldName: "COLOMBIA" }] in chronological order.
 * API: setProgress(p) with p in [0, levels.length - 1]; dispose().
 */
export function mountExperience(canvas, { levels, onSelect }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  let camScale = 1;

  const stage = createStage(canvas, {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    onResize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      camScale = Math.max(1, 1.1 / camera.aspect); // back off on tall canvases
    },
  });

  const toonRamp = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
  toonRamp.minFilter = toonRamp.magFilter = THREE.NearestFilter;
  toonRamp.needsUpdate = true;
  const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: toonRamp, ...opts });

  scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 1.3));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(6, 12, 8);
  scene.add(sun);

  // --- worlds + node positions
  const worldCount = Math.max(...levels.map((l) => l.world)) + 1;
  const worlds = Array.from({ length: worldCount }, (_, w) => {
    const members = levels.map((l, i) => (l.world === w ? i : -1)).filter((i) => i >= 0);
    const name = levels[members[0]].worldName;
    return {
      index: w,
      name,
      float: name === "REMOTO",
      center: new THREE.Vector3(w * WORLD_GAP_X, 0, w % 2 ? -WORLD_ZIG_Z : 0),
      members,
      radius: 3.2 + members.length * 1.6,
    };
  });

  const nodes = levels.map((l, i) => {
    const wd = worlds[l.world];
    const j = wd.members.indexOf(i);
    const m = wd.members.length;
    const pos = wd.center.clone().add(new THREE.Vector3((j - (m - 1) / 2) * NODE_GAP, 0, m > 1 ? (j % 2 ? 1.2 : -1.2) : 0));
    pos.y = 1.5 + (wd.float ? FLOAT_LIFT : 0); // top of a height-2 column
    return { level: l, world: wd, pos };
  });

  // --- voxel islands (one InstancedMesh). Cells under nodes and roads stay flat.
  const roads = nodes.slice(1).map((n, i) => [nodes[i], n]).filter(([a, b]) => a.world === b.world);
  const cells = [];
  worlds.forEach((wd) => {
    const R = wd.radius;
    for (let x = Math.floor(-R - 1); x <= R + 1; x++) {
      for (let z = Math.floor(-R - 1); z <= R + 1; z++) {
        const cx = Math.round(wd.center.x) + x, cz = Math.round(wd.center.z) + z;
        const ang = Math.atan2(z, x);
        const rEff = R * (0.82 + 0.25 * Math.sin(ang * 3 + wd.index) * 0.5 + 0.12 * hash(cx, cz));
        const d = Math.hypot(x, z) / rEff;
        if (d >= 1) continue;
        let h = 1 + Math.floor((1 - d) * 2.6 + hash(cz, cx) * 1.6);
        const nearNode = nodes.some((n) => n.world === wd && Math.hypot(n.pos.x - cx, n.pos.z - cz) < 1.6);
        const onRoad = roads.some(([a, b]) => a.world === wd && distToSegment(cx, cz, a.pos, b.pos) < 1.3);
        if (nearNode || onRoad) h = 2;
        const lift = wd.float ? FLOAT_LIFT : 0;
        const top = h - 0.5 + lift;
        const bottom = wd.float ? lift - 0.5 - Math.round((1 - d) * 3) : -0.6;
        cells.push({ x: cx, z: cz, top, bottom, h, d, world: wd.index });
      }
    }
  });
  const island = new THREE.InstancedMesh(new THREE.BoxGeometry(0.98, 1, 0.98), toon({ color: 0xffffff }), cells.length);
  const m4 = new THREE.Matrix4();
  cells.forEach((c, i) => {
    const hgt = c.top - c.bottom;
    m4.compose(new THREE.Vector3(c.x, c.bottom + hgt / 2, c.z), new THREE.Quaternion(), new THREE.Vector3(1, hgt, 1));
    island.setMatrixAt(i, m4);
  });
  scene.add(island);

  // --- sea: dark plane + grid lines
  const mapCenter = worlds.reduce((v, wd) => v.add(wd.center), new THREE.Vector3()).divideScalar(worldCount);
  const seaMat = new THREE.MeshBasicMaterial();
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), seaMat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(mapCenter.x, -0.35, mapCenter.z);
  scene.add(sea);
  const gridPts = [];
  for (let i = -80; i <= 80; i += 2) {
    gridPts.push(new THREE.Vector3(i, 0, -80), new THREE.Vector3(i, 0, 80), new THREE.Vector3(-80, 0, i), new THREE.Vector3(80, 0, i));
  }
  const gridMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 });
  const grid = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gridPts), gridMat);
  grid.position.set(mapCenter.x, -0.3, mapCenter.z);
  scene.add(grid);

  // --- path curve through nodes, arching over the sea between worlds
  const pts = [];
  const nodeT = [];
  nodes.forEach((n, i) => {
    nodeT.push(pts.length);
    pts.push(n.pos.clone().setY(n.pos.y + 0.25));
    const next = nodes[i + 1];
    if (!next) return;
    const a = n.pos, b = next.pos;
    if (n.world === next.world) {
      pts.push(a.clone().lerp(b, 0.5).setY(Math.max(a.y, b.y) + 0.35));
    } else {
      const top = Math.max(a.y, b.y) + 2.2;
      pts.push(a.clone().lerp(b, 0.3).setY(top), a.clone().lerp(b, 0.7).setY(top));
    }
  });
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const lastIdx = pts.length - 1;
  for (let i = 0; i < nodeT.length; i++) nodeT[i] = lastIdx ? nodeT[i] / lastIdx : 0;
  const progressToT = (p) => {
    const i = Math.min(Math.floor(p), nodeT.length - 1);
    const f = p - i;
    return i >= nodeT.length - 1 ? nodeT[nodeT.length - 1] : nodeT[i] + (nodeT[i + 1] - nodeT[i]) * f;
  };

  const DOTS = Math.max(40, Math.round(curve.getLength() * 2.2));
  const dots = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), new THREE.MeshBasicMaterial(), DOTS);
  const dotT = [];
  for (let i = 0; i < DOTS; i++) {
    const u = i / (DOTS - 1);
    dotT.push(curve.getUtoTmapping(u));
    m4.makeTranslation(curve.getPointAt(u));
    dots.setMatrixAt(i, m4);
  }
  scene.add(dots);

  // --- level nodes
  const nodeObjs = nodes.map((n, i) => {
    const g = new THREE.Group();
    g.position.copy(n.pos);
    const baseMat = toon({ color: 0xffffff });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.3, 8), baseMat);
    base.position.y = 0.15;
    base.userData.index = i;
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.5, 0.07), toon({ color: 0xffffff }));
    pole.position.set(0.35, 1.05, 0);
    const flagMat = new THREE.MeshBasicMaterial();
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.34, 0.05), flagMat);
    flag.position.set(0.65, 0.45, 0);
    const ringMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.9, 16), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.32;
    const label = makeSprite(chipCanvas(n.level.id, "#888", palette()), 0.42);
    label.position.set(0, 2.2, 0);
    g.add(base, pole, flag, ring, label);
    scene.add(g);
    return { g, base, baseMat, pole, flag, flagMat, ring, ringMat, label, unlock: 0, unlocked: false, pulse: 0 };
  });

  const worldLabels = worlds.map((wd) => {
    const s = makeSprite(chipCanvas(`MUNDO ${wd.index + 1} · ${wd.name}`, "#888", palette()), 0.55);
    s.position.copy(wd.center).setY((wd.float ? FLOAT_LIFT : 0) + 4.6);
    scene.add(s);
    return s;
  });

  // --- player
  const player = makeSprite(playerCanvas(palette()), 1.05);
  scene.add(player);
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.35, 12),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  // --- palette
  const tmpA = new THREE.Color();
  let litDots = -1;
  function paint(P) {
    cells.forEach((c, i) => {
      const k = Math.min(1, (c.h - 1) / 3);
      tmpA.copy(P.line).lerp(P[ACCENTS[c.world % 3]], 0.08 + k * 0.22);
      if (hash(c.x * 3, c.z * 7) > 0.8) tmpA.multiplyScalar(0.85); // pixel noise
      island.setColorAt(i, tmpA);
    });
    island.instanceColor.needsUpdate = true;
    seaMat.color.copy(P.bg);
    gridMat.color.copy(P.accent);
    nodeObjs.forEach((o, i) => {
      o.pole.material.color.copy(P.muted);
      o.ringMat.color.copy(P[ACCENTS[nodes[i].world.index % 3]]);
      setSpriteCanvas(o.label, chipCanvas(nodes[i].level.id, P.hex[ACCENTS[nodes[i].world.index % 3]], P), 0.42);
    });
    worldLabels.forEach((s, w) => setSpriteCanvas(s, chipCanvas(`MUNDO ${w + 1} · ${worlds[w].name}`, P.hex[ACCENTS[w % 3]], P), 0.55));
    setSpriteCanvas(player, playerCanvas(P), 1.05);
    litDots = -1; // force dot recolor
  }
  paint(palette());
  fontsReady().then(() => paint(palette()));
  const offPalette = onPalette(paint);

  // --- progress (driven by page scroll)
  let target = 0, shown = 0, first = true;
  function setProgress(p) {
    target = Math.max(0, Math.min(levels.length - 1, p));
  }

  // --- click a node to jump to that level
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const bases = nodeObjs.map((o) => o.base);
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(bases, false)[0];
    return hit ? hit.object.userData.index : null;
  }
  const onMove = (e) => { canvas.style.cursor = pick(e) != null ? "pointer" : "default"; };
  const onClick = (e) => { const i = pick(e); if (i != null && onSelect) onSelect(i); };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("click", onClick);

  // --- frame
  const pos = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  const look = new THREE.Vector3();
  let time = 0;
  stage.setFrame((dt) => {
    const P = palette();
    const still = reducedMotion.matches;
    if (!still) time += dt;
    const k = still || first ? 1 : 1 - Math.exp(-dt * 4);
    const prev = shown;
    shown += (target - shown) * k;
    if (Math.abs(target - shown) < 1e-3) shown = target;
    const moving = Math.abs(shown - prev) > 1e-4;

    const t = progressToT(shown);
    curve.getPoint(t, pos);
    const hop = moving && !still ? Math.abs(Math.sin(time * 12)) * 0.25 : Math.sin(time * 2) * 0.04;
    player.position.set(pos.x, pos.y + 0.55 + hop, pos.z);
    shadow.position.set(pos.x, pos.y - 0.2, pos.z);

    // dots: lit behind the player
    const lit = dotT.filter((dt_) => dt_ <= t + 1e-4).length;
    if (lit !== litDots) {
      litDots = lit;
      for (let i = 0; i < DOTS; i++) dots.setColorAt(i, i < lit ? P.accent3 : P.line);
      dots.instanceColor.needsUpdate = true;
    }

    // nodes: unlock when the player reaches them
    nodeObjs.forEach((o, i) => {
      const reached = shown >= i - 0.02;
      if (reached && !o.unlocked) o.pulse = 1;
      o.unlocked = reached;
      o.unlock += ((reached ? 1 : 0) - o.unlock) * (still ? 1 : 1 - Math.exp(-dt * 6));
      const col = P[ACCENTS[nodes[i].world.index % 3]];
      o.baseMat.color.copy(P.line).lerp(col, o.unlock * 0.85);
      o.flagMat.color.copy(P.muted).lerp(col, o.unlock);
      o.flag.position.y = 0.45 + o.unlock * 1.1;
      const bob = Math.round(shown) === i && !still ? Math.sin(time * 3) * 0.04 : 0;
      o.g.position.y = nodes[i].pos.y + bob;
      o.label.material.opacity = 0.45 + o.unlock * 0.55;
      if (o.pulse > 0) {
        o.pulse = still ? 0 : Math.max(0, o.pulse - dt * 1.2);
        const s = 1 + (1 - o.pulse) * 1.8;
        o.ring.scale.set(s, s, s);
        o.ringMat.opacity = o.pulse * 0.9;
      }
    });

    // camera follows the player
    look.copy(pos);
    camTarget.copy(pos).addScaledVector(CAM_OFFSET, camScale);
    if (first) { camera.position.copy(camTarget); first = false; }
    else camera.position.lerp(camTarget, still ? 1 : 1 - Math.exp(-dt * 3));
    camera.lookAt(look);

    stage.renderer.render(scene, camera);
  });

  return {
    setProgress,
    dispose() {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("click", onClick);
      offPalette();
      stage.dispose();
      disposeScene(scene);
      toonRamp.dispose();
    },
  };
}
