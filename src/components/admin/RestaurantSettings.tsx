"use client";

import { useState } from "react";
import type { FallbackType } from "@/types";

// Monday-first order: Po=1, Út=2, ..., Ne=0
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABELS: Record<number, string> = {
  0: "Ne", 1: "Po", 2: "Út", 3: "St", 4: "Čt", 5: "Pá", 6: "So",
};

const TIME_OPTIONS = [
  { value: "00:00", label: "Od půlnoci" },
  { value: "06:00", label: "Od 6:00" },
  { value: "08:00", label: "Od 8:00" },
  { value: "09:00", label: "Od 9:00" },
  { value: "10:00", label: "Od 10:00" },
  { value: "11:00", label: "Od 11:00" },
];

interface Props {
  initialValues: {
    name: string;
    phone: string | null;
    static_menu_url: string | null;
    fallback_type: FallbackType;
    fallback_title: string;
    fallback_text: string;
    weekend_fallback_title: string;
    weekend_fallback_text: string;
    opening_days: number[];
    menu_active_from: string;
  };
}

export function RestaurantSettings({ initialValues }: Props) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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

    // Also sync serves_weekend based on opening_days
    const servesWeekend = values.opening_days.includes(0) || values.opening_days.includes(6);

    const res = await fetch("/api/restaurant/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, serves_weekend: servesWeekend }),
    });

    if (res.ok) {
      setSaved(true);
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Název */}
      <div>
        <label style={labelStyle}>Název restaurace</label>
        <input
          className="input"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

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

      {/* Stálé menu */}
      <div>
        <label style={labelStyle}>Odkaz na stálé menu</label>
        <input
          className="input"
          value={values.static_menu_url ?? ""}
          onChange={(e) => update("static_menu_url", e.target.value || null)}
          placeholder="https://..."
        />
        <p style={hintStyle}>PDF nebo stránka se stálým menu</p>
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
        <p style={hintStyle}>Ostatní dny se zobrazí náhradní zpráva</p>
      </div>

      {/* Kdy se menu zobrazí */}
      <div>
        <label style={labelStyle}>Kdy se má menu začít zobrazovat?</label>
        <select
          className="input"
          value={values.menu_active_from}
          onChange={(e) => update("menu_active_from", e.target.value)}
          style={{ maxWidth: 200 }}
        >
          {TIME_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <p style={hintStyle}>
          Hodí se, pokud nahráváte menu den předem
        </p>
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Fallback */}
      <div>
        <label style={labelStyle}>Co zobrazit, když menu není nahrané?</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {([
            { value: "text" as const, label: "Zpráva" },
            { value: "static_menu" as const, label: "Stálé menu" },
            { value: "phone" as const, label: "Zavolejte" },
          ]).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => update("fallback_type", value)}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                border: values.fallback_type === value
                  ? "1px solid var(--border-gold)"
                  : "1px solid var(--border)",
                background: values.fallback_type === value
                  ? "var(--gold-dim)"
                  : "transparent",
                color: values.fallback_type === value
                  ? "var(--gold)"
                  : "var(--muted)",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: values.fallback_type === value ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {values.fallback_type === "text" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              className="input"
              value={values.fallback_title}
              onChange={(e) => update("fallback_title", e.target.value)}
              placeholder="Nadpis"
            />
            <input
              className="input"
              value={values.fallback_text}
              onChange={(e) => update("fallback_text", e.target.value)}
              placeholder="Doplňující text"
            />
          </div>
        )}

        {values.fallback_type === "static_menu" && !values.static_menu_url && (
          <p style={{ ...hintStyle, color: "#f59e0b" }}>
            Vyplňte odkaz na stálé menu výše
          </p>
        )}

        {values.fallback_type === "phone" && !values.phone && (
          <p style={{ ...hintStyle, color: "#f59e0b" }}>
            Vyplňte telefon výše
          </p>
        )}
      </div>

      {/* Zpráva pro dny bez menu */}
      <div>
        <label style={labelStyle}>Zpráva pro dny bez poledního menu</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            className="input"
            value={values.weekend_fallback_title}
            onChange={(e) => update("weekend_fallback_title", e.target.value)}
            placeholder="Nadpis"
          />
          <input
            className="input"
            value={values.weekend_fallback_text}
            onChange={(e) => update("weekend_fallback_text", e.target.value)}
            placeholder="Text"
          />
        </div>
        <p style={hintStyle}>Zobrazí se ve dnech, které nemáte zaškrtnuté výše</p>
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
