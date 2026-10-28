// Nav + Hero
const NAV_LINKS = [
  { id: "inicio",      label: "Inicio" },
  { id: "sobre-mi",    label: "Sobre mí" },
  { id: "stack",       label: "Stack" },
  { id: "proyectos",   label: "Proyectos" },
  { id: "experiencia", label: "Experiencia" },
  { id: "contacto",    label: "Contacto" },
];

function Nav() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const go = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: "smooth" });
  };
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? "rgba(13,14,22,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(2px)" : "none",
        borderBottom: scrolled ? "2px solid var(--line)" : "2px solid transparent",
        transition: "background .2s, border-color .2s",
      }}
    >
      <nav
        style={{
          maxWidth: "var(--maxw)",
          margin: "0 auto",
          padding: "14px var(--pad)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <a
          href="#inicio"
          onClick={(e) => { e.preventDefault(); go("inicio"); }}
          className="display"
          style={{ fontSize: 15, display: "flex", alignItems: "center", gap: 10 }}
        >
          <span style={{
            display: "inline-grid", placeItems: "center",
            width: 30, height: 30, background: "var(--accent)",
            color: "var(--accent-ink)", fontSize: 11,
          }}>GC</span>
          <Glitch text="MARINO" />
        </a>

        {/* desktop links */}
        <ul className="nav-desktop" style={{
          display: "flex", gap: 22, listStyle: "none", margin: 0, padding: 0,
        }}>
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className="pixel nav-item"
                onClick={(e) => { e.preventDefault(); go(l.id); }}
                style={{ fontSize: 12, color: "var(--muted)" }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* mobile toggle */}
        <button
          className="nav-burger btn btn--ghost"
          onClick={() => setOpen((o) => !o)}
          style={{ display: "none", padding: "10px 12px" }}
          aria-label="Menú"
        >
          {open ? "✕" : "≡"}
        </button>
      </nav>

      {/* mobile menu */}
      {open && (
        <ul className="nav-mobile" style={{
          listStyle: "none", margin: 0, padding: "8px var(--pad) 20px",
          display: "grid", gap: 6, background: "var(--bg-2)",
          borderBottom: "2px solid var(--line)",
        }}>
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className="pixel"
                onClick={(e) => { e.preventDefault(); go(l.id); }}
                style={{ display: "block", padding: "10px 4px", fontSize: 14, color: "var(--ink)" }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

function Hero() {
  const d = window.DATA;
  const go = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: "smooth" });
  };
  return (
    <section id="inicio" className="section" style={{ paddingTop: "clamp(40px,8vw,90px)" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.3fr 0.9fr",
        gap: "clamp(28px,5vw,64px)",
        alignItems: "center",
      }} className="hero-grid">
        {/* left: copy */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <span style={{
              width: 9, height: 9, background: d.available ? "var(--accent)" : "var(--muted)",
              boxShadow: d.available ? "0 0 0 3px rgba(92,224,216,0.25)" : "none",
            }} />
            <span className="pixel" style={{ fontSize: 11, color: "var(--muted)" }}>
              {d.available ? "DISPONIBLE PARA PROYECTOS" : "OCUPADO"} · {d.location}
            </span>
          </div>

          <p className="pixel" style={{ fontSize: 13, color: "var(--accent-2)", margin: "0 0 14px" }}>
            ► HOLA, SOY
          </p>
          <h1 className="display" style={{
            fontSize: "clamp(28px, 5.6vw, 58px)",
            margin: "0 0 18px",
            lineHeight: 1.15,
          }}>
            <Glitch text={d.name} anim />
          </h1>
          <p className="display" style={{
            fontSize: "clamp(13px,2vw,20px)", color: "var(--accent)", margin: "0 0 22px",
          }}>
            {d.role}<span className="caret" />
          </p>
          <p style={{ fontSize: 22, color: "var(--muted)", maxWidth: 460, margin: "0 0 32px" }}>
            {d.tagline}
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button className="btn btn--primary" onClick={() => go("proyectos")}>
              ► VER PROYECTOS
            </button>
            <button className="btn" onClick={() => go("contacto")}>
              CONTACTO
            </button>
          </div>
        </div>

        {/* right: avatar console */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="pbox pshadow" style={{ padding: 14, background: "var(--bg-2)", width: "min(320px, 80vw)" }}>
            {/* console top bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 10,
            }}>
              <span className="pixel" style={{ fontSize: 10, color: "var(--muted)" }}>PLAYER_01</span>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => (
                  <PixelSprite key={i} grid={SPRITES.heart} px={3} color="var(--accent-2)" />
                ))}
              </div>
            </div>
            <image-slot
              id="hero-avatar"
              style={{ width: "100%", height: 280, display: "block" }}
              shape="rect"
              {...(d.photo ? { src: d.photo } : {})}
              placeholder="Suelta tu foto aquí"
            ></image-slot>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: 10,
            }}>
              <span className="pixel" style={{ fontSize: 10, color: "var(--accent)" }}>{d.handle}</span>
              <span className="pixel" style={{ fontSize: 10, color: "var(--muted)" }}>LVL 99</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, Hero });
