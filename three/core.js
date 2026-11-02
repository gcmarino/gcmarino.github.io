// Shared Three.js helpers: palette from CSS vars, render stage, disposal, label textures.
import * as THREE from "three";

const root = document.documentElement;

export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function cssVar(name, fallback) {
  const v = getComputedStyle(root).getPropertyValue(name).trim();
  return v || fallback;
}

function readPalette() {
  const hex = {
    accent: cssVar("--accent", "#5ce0d8"),
    accent2: cssVar("--accent-2", "#ff5fb0"),
    accent3: cssVar("--accent-3", "#ffd45c"),
    bg: cssVar("--bg", "#0d0e16"),
    bg2: cssVar("--bg-2", "#14151f"),
    bg3: cssVar("--bg-3", "#1b1c28"),
    line: cssVar("--line-2", "#3a3d54"),
    ink: cssVar("--ink", "#ECECF6"),
    muted: cssVar("--muted", "#8d90ab"),
  };
  const col = {};
  for (const k in hex) col[k] = new THREE.Color(hex[k]);
  return { hex, ...col };
}

// Palette is driven by the tweaks panel (inline style on <html>). Watch it.
let current = readPalette();
const subscribers = new Set();
new MutationObserver(() => {
  current = readPalette();
  subscribers.forEach((fn) => fn(current));
}).observe(root, { attributes: true, attributeFilter: ["style"] });

export const palette = () => current;
export function onPalette(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export const fontsReady = () =>
  Promise.all(
    ['"Press Start 2P"', "Silkscreen", "VT323"].map((f) => document.fonts.load(`16px ${f}`))
  ).catch(() => {});

// Renderer bound to a canvas. Renders only while the canvas is on screen.
export function createStage(canvas, { pixelRatio = 1, alpha = true, onResize } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha, powerPreference: "high-performance" });
  renderer.setPixelRatio(pixelRatio);
  if (alpha) renderer.setClearColor(0x000000, 0);

  let w = 0, h = 0;
  const ro = new ResizeObserver(() => {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width));
    h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    onResize && onResize(w, h);
  });
  ro.observe(canvas);

  let raf = 0, last = 0, frame = null;
  const loop = (t) => {
    raf = requestAnimationFrame(loop);
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    if (w && frame) frame(dt, t / 1000);
  };
  const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "120px" });
  io.observe(canvas);

  return {
    renderer,
    size: () => ({ w, h }),
    setFrame(fn) { frame = fn; },
    dispose() { stop(); io.disconnect(); ro.disconnect(); renderer.dispose(); },
  };
}

export function disposeScene(scene) {
  scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    mats.forEach((m) => {
      for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose();
      if (m.uniforms) Object.values(m.uniforms).forEach((u) => u.value && u.value.isTexture && u.value.dispose());
      m.dispose();
    });
  });
}

export function canvasTexture(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

// Pixel "chip" label, same look as the .chip CSS class.
export function chipCanvas(text, borderColor, P, s = 3) {
  const fs = 11 * s, padX = 8 * s, padY = 6 * s, b = 2 * s;
  const c = document.createElement("canvas");
  const g = c.getContext("2d");
  const font = `${fs}px Silkscreen, monospace`;
  g.font = font;
  const label = text.toUpperCase();
  c.width = Math.ceil(g.measureText(label).width) + padX * 2;
  c.height = fs + padY * 2;
  g.font = font;
  g.fillStyle = P.hex.bg;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = borderColor;
  g.fillRect(0, 0, c.width, b);
  g.fillRect(0, c.height - b, c.width, b);
  g.fillRect(0, 0, b, c.height);
  g.fillRect(c.width - b, 0, b, c.height);
  // stepped pixel corners
  [[0, 0], [c.width - b, 0], [0, c.height - b], [c.width - b, c.height - b]].forEach(([x, y]) => g.clearRect(x, y, b, b));
  g.fillStyle = P.hex.ink;
  g.textBaseline = "middle";
  g.fillText(label, padX, c.height / 2 + s);
  return c;
}
