const DEMO_WEB = "https://demomenu.catchflow.cz";
const DEMO_ADMIN = "/demo";

const steps = [
  {
    n: "1",
    title: "Vyfotíte menu",
    text: "Papírový lístek, tabuli, cokoliv. Nahrajete přes admin jedním kliknutím.",
  },
  {
    n: "2",
    title: "Zobrazí se na webu",
    text: "Menu se ukáže na webu restaurace ve správný den. Zítra? Nahrajte večer, zobrazí se ráno.",
  },
  {
    n: "3",
    title: "Staré zmizí samo",
    text: "Nikdy se nezobrazí včerejší menu. Systém řeší víkendy, svátky i dny bez menu.",
  },
];

const selling = [
  {
    title: "Žádné vypisování jídel",
    text: "Nemusíte nic přepisovat do administrace. Stačí fotka.",
  },
  {
    title: "Vždy aktuální",
    text: "Nikdy se na webu neukáže staré menu z jiného dne.",
  },
  {
    title: "Funguje dopředu",
    text: "Nahrajete menu v 22:00 na další den — zobrazí se ve správný čas.",
  },
];

const details = [
  { label: "Formát A4", desc: "Přesný poměr stran fotky" },
  { label: "Průhledné pozadí", desc: "Sedí na každý web" },
  { label: "Bez hesla pro hosty", desc: "Jen admin potřebuje login" },
  { label: "Správné datum", desc: "Zobrazí se ve správný den" },
  { label: "Víkendový režim", desc: "Vlastní zpráva pro dny bez menu" },
  { label: "Nastavitelné fallbacky", desc: "Text, telefon, odkaz na stálé menu" },
];

export default function RootPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="page-center" style={{ minHeight: "60vh", paddingTop: 80 }}>
        <div style={{ textAlign: "center", maxWidth: 560 }}>
          <span className="badge" style={{ marginBottom: 28 }}>
            Pro restaurace a bistra
          </span>
          <h1
            style={{
              fontSize: "clamp(1.9rem, 5vw, 3rem)",
              marginBottom: 20,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Denní menu na webu
            <br />
            <span style={{ color: "var(--gold)" }}>bez přepisování</span>
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 480,
              margin: "0 auto 40px",
            }}
          >
            Vyfotíte menu, nahrajete fotku. Hotovo.
            <br />
            Na webu restaurace se ukáže automaticky ve správný den.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={DEMO_WEB} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Ukázka webu
            </a>
            <a href={DEMO_ADMIN} className="btn btn-secondary">
              Vyzkoušet zdarma
            </a>
          </div>
        </div>
      </section>

      {/* ── Proč to funguje ── */}
      <section className="section" style={{ paddingBottom: 60 }}>
        <div className="container container--wide">
          <p
            className="badge"
            style={{ display: "block", textAlign: "center", marginBottom: 16 }}
          >
            Proč to funguje
          </p>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              marginBottom: 48,
              letterSpacing: "-0.02em",
            }}
          >
            Tři věci, které řeší
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {selling.map((s, i) => (
              <div
                key={i}
                className="glass-card"
                style={{ padding: "28px 24px" }}
              >
                <h3
                  style={{
                    fontSize: "1.02rem",
                    fontWeight: 700,
                    marginBottom: 8,
                    color: "var(--ivory)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    lineHeight: 1.6,
                  }}
                >
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Jak to funguje ── */}
      <section className="section" style={{ paddingBottom: 60 }}>
        <div className="container container--wide">
          <p
            className="badge"
            style={{ display: "block", textAlign: "center", marginBottom: 16 }}
          >
            Jak to funguje
          </p>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              marginBottom: 48,
              letterSpacing: "-0.02em",
            }}
          >
            Tři kroky, žádná komplikace
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {steps.map((s) => (
              <div
                key={s.n}
                className="glass-card"
                style={{ padding: "28px 24px" }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--gold-dim)",
                    border: "1px solid var(--border-gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--gold)",
                    marginBottom: 18,
                  }}
                >
                  {s.n}
                </div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: 8,
                    color: "var(--ivory)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    lineHeight: 1.6,
                  }}
                >
                  {s.text}
                </p>
              </div>
            ))}
          </div>

          {/* ── Detaily ── */}
          <div
            className="glass-card"
            style={{
              marginTop: 32,
              padding: "24px 28px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 20,
            }}
          >
            {details.map((f) => (
              <div key={f.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--gold)",
                    opacity: 0.6,
                    marginTop: 7,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ivory)", marginBottom: 2 }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.4 }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px 20px",
          textAlign: "center",
          color: "var(--dim)",
          fontSize: "0.75rem",
        }}
      >
        Polední menu ·{" "}
        <a href="https://catchflow.cz" target="_blank" rel="noopener noreferrer">
          Catchflow
        </a>
      </footer>
    </main>
  );
}
