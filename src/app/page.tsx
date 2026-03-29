const DEMO_WEB = "https://web-psi-lac-93.vercel.app";
const DEMO_ADMIN = "/testovaci-restaurace/admin";

const steps = [
  {
    n: "1",
    title: "Nafotíš lístek",
    text: "Vyfotíš nebo naskenuje denní menu — papírový lístek, tabuli, cokoliv. Nahraješ přes admin dashboard za 30 sekund.",
  },
  {
    n: "2",
    title: "Systém ho zpracuje",
    text: "Fotka se převede do WebP, uloží se s datem platnosti. Zobrazí se automaticky správný den — dnes nahraješ zítřejší menu v klidu.",
  },
  {
    n: "3",
    title: "Zákazníci to vidí",
    text: "Menu se embed přes jeden řádek kódu na web restaurace. Formát A4, bez zbytečného chrome, vypadá jako součást webu.",
  },
];

export default function RootPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="page-center" style={{ minHeight: "60vh", paddingTop: 80 }}>
        <div style={{ textAlign: "center", maxWidth: 560 }}>
          <span className="badge" style={{ marginBottom: 24 }}>
            Micro-SaaS pro restaurace
          </span>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              marginBottom: 20,
              lineHeight: 1.15,
            }}
          >
            Polední menu online
            <br />
            <span style={{ color: "var(--gold)" }}>za 30 sekund</span>
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            Nafotíš lístek, nahraješ fotku. Hotovo.
            Systém ji zobrazí na webu restaurace ve formátu A4 —
            bez psaní jídel, bez CMS, bez zbytečností.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={DEMO_WEB} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Ukázka webu →
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
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              marginBottom: 56,
            }}
          >
            Tři kroky, žádná komplikace
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {steps.map((s) => (
              <div
                key={s.n}
                className="glass-card"
                style={{ padding: "32px 28px" }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--gold-dim)",
                    border: "1px solid var(--border-gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "var(--gold)",
                    marginBottom: 20,
                  }}
                >
                  {s.n}
                </div>
                <h3
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    marginBottom: 10,
                    color: "var(--ivory)",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.9rem",
                    lineHeight: 1.65,
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
              marginTop: 40,
              padding: "28px 32px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 24,
            }}
          >
            {[
              { icon: "📐", label: "Formát A4", desc: "Přesný poměr stran" },
              { icon: "🎨", label: "Průhledné pozadí", desc: "Sedí na každý web" },
              { icon: "🔒", label: "Bez hesla pro hosty", desc: "Jen admin potřebuje login" },
              { icon: "📅", label: "Správné datum", desc: "Nahrát dopředu, zobrazí se ve správný den" },
              { icon: "🌙", label: "Víkendový režim", desc: "Vypínatelné polední menu" },
            ].map((f) => (
              <div key={f.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ivory)", marginBottom: 2 }}>
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
          fontSize: "0.78rem",
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
