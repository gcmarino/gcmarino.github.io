// App + Tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#5ce0d8", "#ff5fb0", "#ffd45c"],
  "glitch": "sutil",
  "scanlines": "off",
  "bodySize": 21,
  "bg": "#0d0e16"
}/*EDITMODE-END*/;

const PALETTES = [
  ["#5ce0d8", "#ff5fb0", "#ffd45c"], // cyan / magenta / amber (default)
  ["#9be34a", "#3a8c2e", "#d4ff70"], // game boy greens
  ["#ffb347", "#ff6b3d", "#ffe08a"], // amber CRT
  ["#a78bff", "#5ce0d8", "#ff5fb0"], // synth purple
];

const GLITCH_PX = { off: 0, sutil: 2, fuerte: 4 };
const SCAN_OPACITY = { off: 0, sutil: 0.25, fuerte: 0.5 };

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const r = document.documentElement.style;
    const [a, a2, a3] = t.palette;
    r.setProperty("--accent", a);
    r.setProperty("--accent-2", a2);
    r.setProperty("--accent-3", a3);
    r.setProperty("--glitch", (GLITCH_PX[t.glitch] ?? 2) + "px");
    r.setProperty("--scan-opacity", String(SCAN_OPACITY[t.scanlines] ?? 0));
    r.setProperty("--bg", t.bg);
    document.body.style.fontSize = t.bodySize + "px";
  }, [t]);

  return (
    <React.Fragment>
      <Nav />
      <main>
        <Hero />
        <About />
        <Stack />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />

      <TweaksPanel>
        <TweakSection label="Paleta" />
        <TweakColor
          label="Acentos"
          value={t.palette}
          options={PALETTES}
          onChange={(v) => setTweak("palette", v)}
        />
        <TweakColor
          label="Fondo"
          value={t.bg}
          options={["#0d0e16", "#0a0a0a", "#101820", "#1a1320"]}
          onChange={(v) => setTweak("bg", v)}
        />

        <TweakSection label="Efectos retro" />
        <TweakRadio
          label="Glitch RGB"
          value={t.glitch}
          options={["off", "sutil", "fuerte"]}
          onChange={(v) => setTweak("glitch", v)}
        />
        <TweakRadio
          label="Scanlines CRT"
          value={t.scanlines}
          options={["off", "sutil", "fuerte"]}
          onChange={(v) => setTweak("scanlines", v)}
        />

        <TweakSection label="Tipografía" />
        <TweakSlider
          label="Tamaño cuerpo"
          value={t.bodySize}
          min={18}
          max={26}
          unit="px"
          onChange={(v) => setTweak("bodySize", v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
