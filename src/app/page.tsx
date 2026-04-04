const DEMO_WEB = "https://web-psi-lac-93.vercel.app";
const DEMO_ADMIN = "/testovaci-restaurace/admin";

const steps = [
  {
    n: "1",
    title: "Nafotíš lístek",
    text: "Vyfotíš denní menu — papírový lístek, tabuli, cokoliv. Nahraješ přes admin za 30 sekund.",
  },
  {
    n: "2",
    title: "Systém ho zpracuje",
    text: "Fotka se převede do WebP, uloží s datem platnosti. Zítřejší menu nahraješ dnes, zobrazí se ve správný den.",
  },
  {
    n: "3",
    title: "Zákazníci to vidí",
    text: "Menu se embed přes jeden řádek kódu na web restaurace. Formát A4, bez zbytečností, vypadá jako součást webu.",
  },
];

const features = [
  { label: "Formát A4", desc: "Přesný poměr stran" },
  { label: "Průhledné pozadí", desc: "Sedí na každý web" },
  { label: "Bez hesla pro hosty", desc: "Jen admin potřebuje login" },
  { label: "Správné datum", desc: "Zobrazí se ve správný den" },
  { label: "Víkendový režim", desc: "Vypínatelné polední menu" },
];

export default function RootPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="page-center" style={{ minHeight: "60vh", paddingTop: 80 }}>
        <div style={{ textAlign: "center", maxWidth: 540 }}>
          <span className="badge" style={{ marginBottom: 28 }}>
            Micro-SaaS pro restaurace
          </span>
          <h1
            style={{
              fontSize: "clamp(1.9rem, 5vw, 3rem)",
              marginBottom: 20,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Polední menu online
            <br />
            <span style={{ color: "var(--gold)" }}>za 30 sekund</span>
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.02rem",
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 460,
              margin: "0 auto 40px",
            }}
          >
            Nafotíš lístek, nahraješ fotku. Hotovo.
            <br />
            Systém ji zobrazí na webu restaurace ve formátu A4 —
            bez psaní jídel, bez CMS, bez zbytečností.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={DEMO_WEB} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Ukázka webu
            </a>
            <a href={DEMO_ADMIN} className="btn btn-secondary">
              Zkusit admin demo
            </a>
          </div>
        </div>
      </section>

      {/* ── Jak to funguje ── */}
      <section className="section" style={{ paddingBottom: 100 }}>
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

          {/* ── Bonus detaily ── */}
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
            {features.map((f) => (
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
