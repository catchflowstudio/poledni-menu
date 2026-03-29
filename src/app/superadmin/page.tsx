"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Restaurant {
  id: string;
  slug: string;
  name: string;
  phone: string | null;
  serves_weekend: boolean;
  created_at: string;
  lastMenuDate: string | null;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export default function SuperadminPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulář — nová restaurace
  const [form, setForm] = useState({ slug: "", name: "", phone: "", password: "" });
  const [formMsg, setFormMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Reset hesla
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPwd, setResetPwd] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  async function fetchRestaurants() {
    const res = await fetch("/api/superadmin/restaurants");
    if (res.ok) setRestaurants(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchRestaurants(); }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg(null);
    const res = await fetch("/api/superadmin/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setFormMsg({ type: "ok", text: `Restaurace "${data.name}" vytvořena. Admin: ${APP_URL}/${data.slug}/admin` });
      setForm({ slug: "", name: "", phone: "", password: "" });
      fetchRestaurants();
    } else {
      setFormMsg({ type: "err", text: data.error });
    }
    setFormLoading(false);
  }

  async function handleDelete(r: Restaurant) {
    if (!confirm(`Opravdu smazat "${r.name}"? Tato akce je nevratná.`)) return;
    await fetch(`/api/superadmin/restaurants/${r.id}`, { method: "DELETE" });
    fetchRestaurants();
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetId) return;
    const res = await fetch(`/api/superadmin/restaurants/${resetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPwd }),
    });
    const data = await res.json();
    setResetMsg(res.ok ? "✓ Heslo změněno" : data.error);
    if (res.ok) { setResetPwd(""); setTimeout(() => { setResetId(null); setResetMsg(""); }, 1500); }
  }

  async function logout() {
    await fetch("/api/superadmin/auth", { method: "DELETE" });
    router.push("/superadmin/login");
  }

  const tdStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    fontSize: "0.88rem",
    verticalAlign: "middle",
  };

  return (
    <main style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div className="container container--wide">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem" }}>Lístek</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>Superadmin panel</p>
          </div>
          <button onClick={logout} className="btn btn-ghost" style={{ fontSize: "0.8rem" }}>
            Odhlásit
          </button>
        </div>

        {/* Tabulka restaurací */}
        <div className="glass-card" style={{ marginBottom: 40, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>
              Restaurace ({restaurants.length})
            </h2>
          </div>

          {loading ? (
            <p style={{ padding: 24, color: "var(--muted)" }}>Načítám…</p>
          ) : restaurants.length === 0 ? (
            <p style={{ padding: 24, color: "var(--muted)" }}>Zatím žádné restaurace.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.15)" }}>
                    {["Název", "Slug", "Telefon", "Poslední menu", "Vytvořena", "Akce"].map((h) => (
                      <th key={h} style={{ ...tdStyle, color: "var(--muted)", fontWeight: 500, textAlign: "left" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((r) => (
                    <tr key={r.id}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500 }}>{r.name}</div>
                        <div style={{ fontSize: "0.75rem", marginTop: 2 }}>
                          <a href={`/${r.slug}/admin`} target="_blank" rel="noopener noreferrer"
                            style={{ color: "var(--gold)" }}>
                            Admin ↗
                          </a>
                          {" · "}
                          <a href={`/${r.slug}/menu`} target="_blank" rel="noopener noreferrer"
                            style={{ color: "var(--muted)" }}>
                            Menu ↗
                          </a>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "monospace", color: "var(--muted)" }}>
                        {r.slug}
                      </td>
                      <td style={{ ...tdStyle, color: "var(--muted)" }}>
                        {r.phone ?? "—"}
                      </td>
                      <td style={tdStyle}>
                        {r.lastMenuDate ? (
                          <span style={{ color: "#22c55e" }}>{r.lastMenuDate}</span>
                        ) : (
                          <span style={{ color: "var(--dim)" }}>Žádné</span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, color: "var(--muted)", fontSize: "0.8rem" }}>
                        {new Date(r.created_at).toLocaleDateString("cs-CZ")}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => { setResetId(r.id); setResetMsg(""); }}
                            className="btn btn-secondary"
                            style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                          >
                            Reset hesla
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            style={{
                              fontSize: "0.75rem", padding: "6px 12px",
                              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                              color: "#fca5a5", borderRadius: "var(--radius-sm)", cursor: "pointer",
                            }}
                          >
                            Smazat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reset hesla modal */}
        {resetId && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.7)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 20,
          }}>
            <div className="glass-card" style={{ padding: 32, width: "100%", maxWidth: 360 }}>
              <h3 style={{ marginBottom: 20, fontSize: "1rem" }}>
                Reset hesla — {restaurants.find(r => r.id === resetId)?.name}
              </h3>
              <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="password"
                  className="input"
                  placeholder="Nové heslo (min. 8 znaků)"
                  value={resetPwd}
                  onChange={(e) => setResetPwd(e.target.value)}
                  minLength={8}
                  required
                  autoFocus
                />
                {resetMsg && <p style={{ color: resetMsg.startsWith("✓") ? "#86efac" : "#fca5a5", fontSize: "0.85rem" }}>{resetMsg}</p>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Uložit</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setResetId(null)}>Zrušit</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Přidat restauraci */}
        <div className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 24 }}>
            Přidat restauraci
          </h2>

          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 6 }}>
                  Název *
                </label>
                <input
                  className="input"
                  placeholder="U Nováků"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 6 }}>
                  Slug * <span style={{ fontSize: "0.75rem" }}>(URL identifikátor)</span>
                </label>
                <input
                  className="input"
                  placeholder="u-novaku"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  required
                  pattern="[a-z0-9-]+"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 6 }}>
                  Telefon
                </label>
                <input
                  className="input"
                  placeholder="+420 777 000 111"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 6 }}>
                  Heslo pro admin * <span style={{ fontSize: "0.75rem" }}>(min. 8 znaků)</span>
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder="Silné heslo"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
            </div>

            {form.slug && (
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 16 }}>
                Admin URL: <code style={{ color: "var(--gold)" }}>{APP_URL}/{form.slug}/admin</code>
                {" · "}
                Menu URL: <code style={{ color: "var(--muted)" }}>{APP_URL}/{form.slug}/menu</code>
              </p>
            )}

            {formMsg && (
              <div className={`alert ${formMsg.type === "ok" ? "alert--success" : "alert--error"}`} style={{ marginBottom: 16 }}>
                {formMsg.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? "Vytvářím…" : "Vytvořit restauraci"}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
