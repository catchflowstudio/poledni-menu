"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Restaurant {
  id: string;
  slug: string;
  name: string;
  phone: string | null;
  serves_weekend: boolean;
  fallback_type: string;
  opening_days: number[];
  menu_active_from: string;
  created_at: string;
  lastMenuDate: string | null;
  todayUploaded: boolean;
  tomorrowUploaded: boolean;
  daysInactive: number | null;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export function SuperadminDashboard() {
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
    if (res.status === 401) {
      router.push("/superadmin/login");
      return;
    }
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
    setResetMsg(res.ok ? "Heslo bylo změněno." : data.error);
    if (res.ok) { setResetPwd(""); setTimeout(() => { setResetId(null); setResetMsg(""); }, 1500); }
  }

  async function logout() {
    await fetch("/api/superadmin/auth", { method: "DELETE" });
    router.push("/superadmin/login");
  }

  // Stats
  const totalRestaurants = restaurants.length;
  const todayUploaded = restaurants.filter((r) => r.todayUploaded).length;
  const todayMissing = totalRestaurants - todayUploaded;
  const inactive = restaurants.filter((r) => r.daysInactive !== null && r.daysInactive > 7).length;

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem" }}>Polední menu</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>Superadmin panel</p>
          </div>
          <button onClick={logout} className="btn btn-ghost" style={{ fontSize: "0.8rem" }}>
            Odhlásit
          </button>
        </div>

        {/* Přehled — karty */}
        {!loading && totalRestaurants > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
              marginBottom: 32,
            }}
          >
            <div className="glass-card" style={{ padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--ivory)" }}>
                {totalRestaurants}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
                Restaurací
              </div>
            </div>
            <div className="glass-card" style={{ padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#22c55e" }}>
                {todayUploaded}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
                Dnes nahráno
              </div>
            </div>
            <div className="glass-card" style={{ padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: todayMissing > 0 ? "#f59e0b" : "var(--muted)" }}>
                {todayMissing}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
                Dnes chybí
              </div>
            </div>
            <div className="glass-card" style={{ padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: inactive > 0 ? "#ef4444" : "var(--muted)" }}>
                {inactive}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
                Neaktivních (7+ dní)
              </div>
            </div>
          </div>
        )}

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
                    {["Název", "Dnes", "Zítra", "Poslední menu", "Aktivita", "Akce"].map((h) => (
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
                        <div style={{ fontSize: "0.75rem", marginTop: 2, color: "var(--dim)" }}>
                          {r.slug}
                          {r.phone && ` · ${r.phone}`}
                        </div>
                        <div style={{ fontSize: "0.75rem", marginTop: 2 }}>
                          <a href={`/${r.slug}/admin`} target="_blank" rel="noopener noreferrer"
                            style={{ color: "var(--gold)" }}>
                            Admin
                          </a>
                          {" · "}
                          <a href={`/${r.slug}/menu`} target="_blank" rel="noopener noreferrer"
                            style={{ color: "var(--muted)" }}>
                            Menu
                          </a>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.82rem",
                        }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: r.todayUploaded ? "#22c55e" : "rgba(245,158,11,0.6)",
                            display: "inline-block",
                          }} />
                          {r.todayUploaded ? "Ano" : "Ne"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: "0.82rem",
                          color: r.tomorrowUploaded ? "var(--ivory)" : "var(--dim)",
                        }}>
                          {r.tomorrowUploaded ? "Ano" : "Ne"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {r.lastMenuDate ? (
                          <span style={{ color: "var(--ivory)", fontSize: "0.82rem" }}>
                            {r.lastMenuDate}
                          </span>
                        ) : (
                          <span style={{ color: "var(--dim)", fontSize: "0.82rem" }}>Žádné</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {r.daysInactive === null ? (
                          <span style={{ color: "var(--dim)", fontSize: "0.82rem" }}>—</span>
                        ) : r.daysInactive === 0 ? (
                          <span style={{ color: "#22c55e", fontSize: "0.82rem" }}>Aktivní</span>
                        ) : r.daysInactive <= 3 ? (
                          <span style={{ color: "var(--ivory)", fontSize: "0.82rem" }}>{r.daysInactive}d</span>
                        ) : r.daysInactive <= 7 ? (
                          <span style={{ color: "#f59e0b", fontSize: "0.82rem" }}>{r.daysInactive}d</span>
                        ) : (
                          <span style={{ color: "#ef4444", fontSize: "0.82rem" }}>{r.daysInactive}d</span>
                        )}
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
                {resetMsg && <p style={{ color: resetMsg.startsWith("Heslo") ? "#86efac" : "#fca5a5", fontSize: "0.85rem" }}>{resetMsg}</p>}
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
