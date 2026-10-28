// About, Stack, Projects, Experience, Contact, Footer

function About() {
  const d = window.DATA;
  return (
    <section id="sobre-mi" className="section">
      <SectionHead index="01" title="Sobre mí" />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "clamp(28px,5vw,56px)", alignItems: "start" }} className="about-grid">
        <div>
          {d.intro.map((p, i) => (
            <Reveal key={i} delay={i * 80}>
              <p style={{ fontSize: 23, color: i === 0 ? "var(--ink)" : "var(--muted)", margin: "0 0 20px", maxWidth: 560 }}>
                {p}
              </p>
            </Reveal>
          ))}
          <p className="eyebrow" style={{ margin: "8px 0 12px" }}>Aptitudes</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {d.aptitudes.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        </div>

        {/* stats grid */}
        <div style={{ display: "grid", gap: 12 }}>
          {d.facts.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <div className="pbox" style={{ padding: "16px 18px" }}>
                <div className="pixel" style={{ fontSize: 11, color: "var(--accent-2)", marginBottom: 8 }}>{s.label}</div>
                <div className="display accent" style={{ fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}>{s.value}</div>
                <div className="muted" style={{ fontSize: 19 }}>{s.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stack() {
  const d = window.DATA;
  return (
    <section id="stack" className="section">
      <SectionHead index="02" title="Stack" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%,300px),1fr))", gap: 12 }}>
        {d.stack.map((g, i) => (
          <Reveal key={g.cat} delay={(i % 3) * 60} style={{ height: "100%" }}>
            <div className="pbox" style={{ padding: 16, height: "100%" }}>
              <div className="pixel" style={{ fontSize: 11, color: "var(--accent)", marginBottom: 12 }}>► {g.cat}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {g.items.map((t) => <span key={t} className="chip" style={{ color: "var(--ink)" }}>{t}</span>)}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Projects() {
  const d = window.DATA;
  const hues = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "#9b7dff"];
  return (
    <section id="proyectos" className="section">
      <SectionHead index="03" title="Proyectos" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 20 }}>
        {d.projects.map((p, i) => {
          const hue = hues[p.hue % hues.length];
          return (
            <Reveal key={p.title} delay={(i % 2) * 90}>
              <article className="pbox pshadow proj-card" style={{ overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                {/* cartridge cover */}
                <div style={{ position: "relative", borderBottom: "2px solid var(--line-2)" }}>
                  {p.image
                    ? <img src={p.image} alt={p.title} style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
                    : <ProjectCover icon={p.icon} color={hue} label={p.tags[0]} />}
                </div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  <h3 className="display" style={{ fontSize: 15, margin: 0, color: hue }}>
                    <Glitch text={p.title} />
                  </h3>
                  <p className="muted" style={{ fontSize: 19, margin: 0, flex: 1 }}>{p.desc}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {p.tags.map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Experience() {
  const d = window.DATA;
  return (
    <section id="experiencia" className="section">
      <SectionHead index="04" title="Experiencia" />
      <div style={{ position: "relative", paddingLeft: 28 }}>
        {/* vertical track */}
        <div style={{ position: "absolute", left: 6, top: 8, bottom: 8, width: 3, background: "repeating-linear-gradient(to bottom, var(--line-2) 0 6px, transparent 6px 12px)" }} />
        {d.experience.map((e, i) => (
          <Reveal key={i} delay={i * 80}>
            <div style={{ position: "relative", marginBottom: 26 }}>
              <span style={{ position: "absolute", left: -28, top: 6, width: 14, height: 14, background: i === 0 ? "var(--accent)" : "var(--bg-3)", border: "2px solid var(--accent)" }} />
              <div className="pbox" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <h3 className="display" style={{ fontSize: 14, margin: 0 }}>{e.role}</h3>
                  <span className="pixel" style={{ fontSize: 10, color: "var(--accent-3)" }}>{e.period}</span>
                </div>
                <div className="pixel accent" style={{ fontSize: 11, marginBottom: 10 }}>{e.org}</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
                  {e.bullets.map((b, j) => (
                    <li key={j} className="muted" style={{ fontSize: 20, display: "flex", gap: 10 }}>
                      <span className="accent" style={{ flex: "none" }}>▪</span><span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const d = window.DATA;
  return (
    <section id="contacto" className="section">
      <div className="pbox pshadow" style={{ padding: "clamp(28px,5vw,52px)", textAlign: "center", background: "var(--bg-2)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <PixelSprite grid={SPRITES.controller} px={6} color="var(--accent)" />
        </div>
        <p className="pixel" style={{ fontSize: 12, color: "var(--accent-2)", margin: "0 0 14px" }}>► READY PLAYER ONE?</p>
        <h2 className="display" style={{ fontSize: "clamp(20px,3.4vw,34px)", margin: "0 0 16px" }}>
          <Glitch text="Hagamos algo" anim />
        </h2>
        <p className="muted" style={{ fontSize: 22, maxWidth: 460, margin: "0 auto 30px" }}>
          ¿Tienes un proyecto en mente? Escríbeme.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {d.social.map((s) => (
            <a key={s.label} href={s.href} className="btn" target="_blank" rel="noreferrer">
              {s.label} <span className="muted" style={{ fontSize: 11 }}>{s.handle}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const d = window.DATA;
  return (
    <footer style={{ borderTop: "2px solid var(--line)", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "26px var(--pad)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span className="pixel" style={{ fontSize: 11, color: "var(--muted)" }}>
          © {new Date().getFullYear()} {d.name}
        </span>
        <span className="pixel" style={{ fontSize: 10, color: "var(--faint)" }}>
          HECHO CON ♥ Y PÍXELES · INSERT COIN
        </span>
      </div>
    </footer>
  );
}

Object.assign(window, { About, Stack, Projects, Experience, Contact, Footer });
