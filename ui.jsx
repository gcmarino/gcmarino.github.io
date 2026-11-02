// Shared UI helpers
const { useState, useEffect, useRef } = React;

// RGB-split glitch text
function Glitch({ as = "span", text, anim = false, className = "", ...rest }) {
  const Tag = as;
  return (
    <Tag
      className={`glitch ${anim ? "glitch--anim" : ""} ${className}`}
      data-text={text}
      {...rest}
    >
      {text}
    </Tag>
  );
}

// Section header with index + title + dashed rule
function SectionHead({ index, title, id }) {
  return (
    <div className="section-head" id={id}>
      <span className="section-index">{index}</span>
      <h2 className="section-title">{title}</h2>
      <span className="section-rule" />
    </div>
  );
}

// Reveal-on-scroll wrapper
function Reveal({ children, delay = 0, style }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setShown(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { setShown(true); io.disconnect(); }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    // Safety fallback: guarantee visibility even if IO never fires
    const fallback = setTimeout(() => setShown(true), 1200);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(14px)",
        transition: `opacity .5s steps(6) ${delay}ms, transform .5s steps(6) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Small pixel-art sprite (data-driven grid). color from accent.
function PixelSprite({ grid, px = 6, color = "var(--accent)", style }) {
  // grid: array of strings, "1" = filled
  const rows = grid.length;
  const cols = grid[0].length;
  const shadows = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] === "1") {
        shadows.push(`${x * px}px ${y * px}px 0 ${color}`);
      }
    }
  }
  return (
    <div style={{ width: cols * px, height: rows * px, ...style }}>
      <div
        style={{
          width: px,
          height: px,
          boxShadow: shadows.join(","),
        }}
      />
    </div>
  );
}

// a little controller / heart sprites
const SPRITES = {
  heart: [
    "01101100",
    "11111110",
    "11111111",
    "11111111",
    "01111110",
    "00111100",
    "00011000",
    "00000000",
  ],
  controller: [
    "0000000000000000",
    "0011111111111100",
    "0111111111111110",
    "0110101111010110",
    "0111111111111110",
    "0110101111010110",
    "0111111111111110",
    "0011111111111100",
    "0000000000000000",
  ],
  phone: [
    "0111111110",
    "1100000011",
    "1011111101",
    "1010000101",
    "1010000101",
    "1010000101",
    "1010000101",
    "1010000101",
    "1011111101",
    "1000000001",
    "1000110001",
    "1100000011",
    "0111111110",
  ],
  robot: [
    "00000100000",
    "00000100000",
    "01111111110",
    "10000000001",
    "10110001101",
    "10110001101",
    "10000000001",
    "10011111001",
    "10000000001",
    "01111111110",
    "00100000100",
  ],
  chat: [
    "111111111111",
    "100000000001",
    "101101101101",
    "101101101101",
    "100000000001",
    "111111111111",
    "001100000000",
    "011000000000",
    "110000000000",
  ],
  doc: [
    "1111111000",
    "1000001100",
    "1000001110",
    "1011110011",
    "1000000001",
    "1011111101",
    "1000000001",
    "1011111101",
    "1000000001",
    "1011110001",
    "1000000001",
    "1111111111",
  ],
  star: [
    "0001000",
    "0011100",
    "1111111",
    "0111110",
    "0110110",
  ],
};

// Template project cover: pixel grid + sprite + label. Swap for a real screenshot later.
function ProjectCover({ icon = "phone", color = "var(--accent)", label, height = 150 }) {
  return (
    <div style={{
      height, position: "relative", overflow: "hidden", display: "grid", placeItems: "center",
      background: `linear-gradient(var(--line) 1px, transparent 1px) 0 0 / 12px 12px, linear-gradient(90deg, var(--line) 1px, transparent 1px) 0 0 / 12px 12px, var(--bg)`,
    }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 55%, color-mix(in oklch, ${color} 22%, transparent) 0, transparent 60%)` }} />
      <div style={{ position: "relative", display: "grid", justifyItems: "center", gap: 12 }}>
        <PixelSprite grid={SPRITES[icon]} px={6} color={color} />
        {label && <span className="pixel" style={{ fontSize: 9, color: "var(--muted)" }}>{label}</span>}
      </div>
    </div>
  );
}

// Mount a Three.js scene (see three/index.js) on a canvas.
// status: "loading" | "ready" | "failed". On "failed" render the plain HTML fallback.
function useScene(name, opts) {
  const ref = useRef(null);
  const api = useRef(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let alive = true;
    window.scenesReady
      .then((S) => {
        if (!alive || !ref.current) return;
        api.current = S[name](ref.current, opts || {});
        setStatus("ready");
      })
      .catch((e) => {
        console.warn("[3D] " + name + ":", e);
        if (alive) setStatus("failed");
      });
    return () => {
      alive = false;
      if (api.current) api.current.dispose();
      api.current = null;
    };
  }, []);
  return { ref, api, status };
}

Object.assign(window, { Glitch, SectionHead, Reveal, PixelSprite, SPRITES, ProjectCover, useScene });
