"use client";

import { useState } from "react";
import type { FallbackType } from "@/types";

// Monday-first order: Po=1, Út=2, ..., Ne=0
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABELS: Record<number, string> = {
  0: "Ne", 1: "Po", 2: "Út", 3: "St", 4: "Čt", 5: "Pá", 6: "So",
};

const TIME_OPTIONS = [
  { value: "18:00", label: "V 18:00 předchozího dne" },
  { value: "00:00", label: "O půlnoci" },
  { value: "08:00", label: "V 8:00" },
];

interface Props {
  initialValues: {
    phone: string | null;
    static_menu_url: string | null;
    fallback_type: FallbackType;
    fallback_title: string;
    fallback_text: string;
    opening_days: number[];
    menu_active_from: string;
  };
}

export function RestaurantSettings({ initialValues }: Props) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [editingFallback, setEditingFallback] = useState(false);

  function update<K extends keyof typeof values>(key: K, val: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: val }));
    setSaved(false);
  }

  function toggleDay(day: number) {
    const days = values.opening_days.includes(day)
      ? values.opening_days.filter((d) => d !== day)
      : [...values.opening_days, day].sort();
    update("opening_days", days);
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);

    const servesWeekend = values.opening_days.includes(0) || values.opening_days.includes(6);

    const res = await fetch("/api/restaurant/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, serves_weekend: servesWeekend }),
    });

    if (res.ok) {
      setSaved(true);
      setEditingFallback(false);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.82rem",
    color: "var(--ivory)",
    fontWeight: 500,
    marginBottom: 6,
  };

  const hintStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    color: "var(--muted)",
    marginTop: 4,
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px",
    borderRadius: "var(--radius-sm)",
    border: active ? "1px solid var(--border-gold)" : "1px solid var(--border)",
    background: active ? "var(--gold-dim)" : "transparent",
    color: active ? "var(--gold)" : "var(--muted)",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: active ? 600 : 400,
    transition: "all 0.15s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Telefon */}
      <div>
        <label style={labelStyle}>Telefon</label>
        <input
          className="input"
          value={values.phone ?? ""}
          onChange={(e) => update("phone", e.target.value || null)}
          placeholder="+420 777 000 111"
        />
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Dny s menu — Monday first */}
      <div>
        <label style={labelStyle}>Které dny vaříte polední menu?</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DAY_ORDER.map((dayNum) => {
            const active = values.opening_days.includes(dayNum);
            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => toggleDay(dayNum)}
                style={{
                  width: 42,
                  height: 36,
                  borderRadius: "var(--radius-sm)",
                  border: active ? "1px solid var(--border-gold)" : "1px solid var(--border)",
                  background: active ? "var(--gold-dim)" : "transparent",
                  color: active ? "var(--gold)" : "var(--muted)",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                {DAY_LABELS[dayNum]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kdy se menu zobrazí */}
      <div>
        <label style={labelStyle}>Kdy se má menu začít zobrazovat?</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TIME_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update("menu_active_from", t.value)}
              style={chipStyle(values.menu_active_from === t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p style={hintStyle}>
          Pokud nahráváte menu v den, kdy ho nabízíte, zobrazí se ihned
        </p>
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Fallback — inline s edit ikonkou */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Zpráva když menu není nahrané</label>
          <button
            type="button"
            onClick={() => setEditingFallback(!editingFallback)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              fontSize: "0.82rem",
              padding: "2px 4px",
            }}
          >
            {editingFallback ? "✕" : "✎"}
          </button>
        </div>

        {editingFallback ? (
          <input
            className="input"
            value={values.fallback_title}
            onChange={(e) => update("fallback_title", e.target.value)}
            placeholder="Text zprávy"
            style={{ marginTop: 8 }}
            autoFocus
          />
        ) : (
          <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 4 }}>
            {values.fallback_title || "Dnešní menu právě připravujeme"}
          </p>
        )}
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Save */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Ukládám…" : "Uložit"}
        </button>
        {saved && (
          <span style={{ fontSize: "0.82rem", color: "var(--gold)" }}>Uloženo</span>
        )}
        {error && (
          <span style={{ fontSize: "0.82rem", color: "#fca5a5" }}>{error}</span>
        )}
      </div>
    </div>
  );
}
