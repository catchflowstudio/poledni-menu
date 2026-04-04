const DEMO_WEB = "https://demomenu.catchflow.cz";
const DEMO_ADMIN = "/demo";

const selling = [
  {
    title: "Žádné vypisování jídel",
    text: "Stačí fotka. Nemusíte nic přepisovat, kopírovat ani formátovat.",
  },
  {
    title: "Na webu jen aktuální menu",
    text: "Včerejší menu se nezobrazí. Nikdy. Ani o víkendu, ani ve svátek.",
  },
  {
    title: "Nahrajete i 2 dny dopředu",
    text: "Připravíte menu večer, zobrazí se ve správný den a čas. Bez stresu ráno.",
  },
];

const steps = [
  {
    n: "1",
    title: "Vyfotíte menu",
    text: "Lístek, tabuli, cokoliv. Nahrajete přes jednoduchý admin.",
  },
  {
    n: "2",
    title: "Zobrazí se na webu",
    text: "Menu se ukáže na webu vaší restaurace automaticky ve správný den.",
  },
  {
    n: "3",
    title: "Staré zmizí samo",
    text: "Nemusíte nic mazat ani hlídat. Zobrazuje se vždy jen to, co platí dnes.",
  },
];

const benefits = [
  { label: "Nahrajete i dopředu", desc: "Menu na zítra? Na pozítří? Žádný problém." },
  { label: "Sedí na každý web", desc: "Vložíte na stránky restaurace jedním kódem." },
  { label: "Dny bez menu bez zmatku", desc: "Vlastní zpráva, telefon nebo odkaz na stálé menu." },
  { label: "Jednoduché ovládání", desc: "Zvládne kdokoliv z personálu. Bez školení." },
  { label: "Rychlé nasazení", desc: "Žádné složité nastavování. Funguje hned." },
];

const faq = [
  {
    q: "Musím menu přepisovat ručně?",
    a: "Ne. Stačí fotka polední nabídky — lístek, tabule, vytištěné menu. Nahrajete ji do adminu a na webu se zobrazí automaticky.",
  },
  {
    q: "Co když nahraju menu večer na další den?",
    a: "Menu se zobrazí ve správný den. Můžete nahrát i 2 dny dopředu — systém počká na správné datum.",
  },
  {
    q: "Co uvidí host, když polední menu ten den nemáme?",
    a: "Zobrazí se zpráva, kterou si sami nastavíte. Třeba s telefonním číslem nebo odkazem na stálé menu.",
  },
  {
    q: "Funguje to i na můj současný web?",
    a: "Ano. Menu se vloží na vaše stránky jednoduchým kódem. Nemusíte nic předělávat.",
  },
  {
    q: "Jak složité je to ovládání?",
    a: "Přihlásíte se, vyberete fotku, zvolíte datum. Hotovo. Zvládne to kdokoliv z obsluhy.",
  },
  {
    q: "Co se stane se starým menu?",
    a: "Zobrazuje se vždy jen aktuální den. Včerejší menu nikdo neuvidí.",
  },
];

export default function RootPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="page-center" style={{ minHeight: "60vh", paddingTop: 80 }}>
        <div style={{ textAlign: "center", maxWidth: 540 }}>
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
            Polední menu na webu
            <br />
            <span style={{ color: "var(--gold)" }}>bez přepisování</span>
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              maxWidth: 460,
              margin: "0 auto 40px",
            }}
          >
            Vyfotíte menu, nahrajete fotku, hotovo.
            <br />
            Na webu se zobrazí automaticky ve správný den.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={DEMO_ADMIN} className="btn btn-primary">
              Vyzkoušet zdarma
            </a>
            <a href={DEMO_WEB} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
              Ukázka webu
            </a>
          </div>
        </div>
      </section>

      {/* ── Proč to funguje ── */}
      <section className="section" style={{ paddingBottom: 60 }}>
        <div className="container container--wide">
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              marginBottom: 48,
              letterSpacing: "-0.02em",
            }}
          >
            Co vám to vyřeší
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
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              marginBottom: 48,
              letterSpacing: "-0.02em",
            }}
          >
            Tři kroky. To je celé.
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

          {/* ── Benefit boxy ── */}
          <div
            className="glass-card"
            style={{
              marginTop: 32,
              padding: "24px 28px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            {benefits.map((b) => (
              <div key={b.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
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
                    {b.label}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.4 }}>
                    {b.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section" style={{ paddingBottom: 60 }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              marginBottom: 48,
              letterSpacing: "-0.02em",
            }}
          >
            Časté otázky
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {faq.map((item) => (
              <div
                key={item.q}
                className="glass-card"
                style={{ padding: "20px 24px" }}
              >
                <h3
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    marginBottom: 8,
                    color: "var(--ivory)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.q}
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                  }}
                >
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section" style={{ paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 520, textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Polední menu na webu
            <br />
            <span style={{ color: "var(--gold)" }}>bez každodenního přepisování</span>
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.92rem",
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            Vyzkoušejte si to. Bez registrace, bez závazků.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={DEMO_ADMIN} className="btn btn-primary">
              Vyzkoušet zdarma
            </a>
            <a href={DEMO_WEB} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
              Ukázka webu
            </a>
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
