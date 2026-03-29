export default function NotFound() {
  return (
    <div className="page-center">
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🍽️</div>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            marginBottom: 8,
          }}
        >
          Stránka nenalezena
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Tato stránka neexistuje nebo byla odstraněna.
        </p>
      </div>
    </div>
  );
}
