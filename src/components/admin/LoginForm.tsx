"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  slug: string;
}

export function LoginForm({ slug }: LoginFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Chyba při přihlášení.");
        return;
      }

      router.push(`/${slug}/admin/menu`);
    } catch {
      setError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      {error && (
        <div className="alert alert--error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="password"
          style={{
            display: "block",
            fontSize: "0.85rem",
            color: "var(--muted)",
            marginBottom: 8,
          }}
        >
          Heslo
        </label>
        <input
          id="password"
          type="password"
          className="input"
          placeholder="Zadejte heslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !password}
        style={{ width: "100%" }}
      >
        {loading ? "Přihlašování…" : "Přihlásit se"}
      </button>
    </form>
  );
}
