"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SuperadminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/superadmin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/superadmin");
    } else {
      setError("Špatné heslo.");
    }
    setLoading(false);
  }

  return (
    <div className="page-center">
      <div className="glass-card" style={{ padding: 40, width: "100%", maxWidth: 360 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: 8 }}>
          Polední menu <span style={{ fontWeight: 400, fontSize: "0.75em", color: "var(--muted)" }}>by Catchflow</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 28 }}>
          Superadmin přístup
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="password"
            className="input"
            placeholder="Heslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />

          {error && (
            <p className="alert alert--error">{error}</p>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Přihlašuji…" : "Přihlásit se"}
          </button>
        </form>
      </div>
    </div>
  );
}
