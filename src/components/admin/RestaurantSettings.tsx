"use client";

import { useState } from "react";
import type { FallbackType } from "@/types";

const DAY_LABELS = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];

const TIME_OPTIONS = [
  "00:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
];

interface Props {
  initialValues: {
    name: string;
    phone: string | null;
    static_menu_url: string | null;
    serves_weekend: boolean;
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

    const res = await fetch("/api/restaurant/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Název restaurace */}
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
        <p style={hintStyle}>Zobrazí se jako CTA tlačítko v menu</p>
      </div>

      {/* URL stálého menu */}
      <div>
        <label style={labelStyle}>Odkaz na stálé menu</label>
        <input
          className="input"
          value={values.static_menu_url ?? ""}
          onChange={(e) => update("static_menu_url", e.target.value || null)}
          placeholder="https://..."
        />
        <p style={hintStyle}>Odkaz na PDF nebo stránku se stálým menu</p>
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Otevírací dny */}
      <div>
        <label style={labelStyle}>Dny s poledním menu</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DAY_LABELS.map((label, i) => {
            const active = values.opening_days.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
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
                {label}
              </button>
            );
          })}
        </div>
        <p style={hintStyle}>Ve vybrané dny se zobrazí polední menu, ostatní dny fallback</p>
      </div>

      {/* Víkendový režim */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <p style={{ fontSize: "0.82rem", color: "var(--ivory)", fontWeight: 500 }}>
            Vaříme i o víkendu
          </p>
          <p style={hintStyle}>
            {values.serves_weekend
              ? "Menu se zobrazí i v sobotu a neděli"
              : "O víkendu se zobrazí víkendová zpráva"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => update("serves_weekend", !values.serves_weekend)}
          style={{
            flexShrink: 0,
            width: 48,
            height: 28,
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            background: values.serves_weekend ? "var(--gold)" : "rgba(248,250,252,0.15)",
            transition: "background 0.2s",
            position: "relative",
            padding: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: values.serves_weekend ? 23 : 3,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--ivory)",
              transition: "left 0.2s",
              display: "block",
            }}
          />
        </button>
      </div>

      {/* Menu active from */}
      <div>
        <label style={labelStyle}>Menu se zobrazí od</label>
        <select
          className="input"
          value={values.menu_active_from}
          onChange={(e) => update("menu_active_from", e.target.value)}
          style={{ maxWidth: 180 }}
        >
          {TIME_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t === "00:00" ? "Půlnoc (výchozí)" : `${t}`}
            </option>
          ))}
        </select>
        <p style={hintStyle}>
          Menu nahrané den předem se zobrazí až od tohoto času
        </p>
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Fallback — když menu chybí */}
      <div>
        <label style={labelStyle}>Když menu chybí — co zobrazit?</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {([
            { value: "text" as const, label: "Textová zpráva" },
            { value: "static_menu" as const, label: "Odkaz na stálé menu" },
            { value: "phone" as const, label: "Zavolejte nám" },
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
              placeholder="Popis"
            />
          </div>
        )}

        {values.fallback_type === "static_menu" && (
          <p style={hintStyle}>
            Zobrazí se odkaz na stálé menu{values.static_menu_url ? "" : " — nejdřív vyplňte odkaz výše"}
          </p>
        )}

        {values.fallback_type === "phone" && (
          <p style={hintStyle}>
            Zobrazí se CTA „Zavolejte si o dnešní nabídku"{values.phone ? "" : " — nejdřív vyplňte telefon"}
          </p>
        )}
      </div>

      {/* Víkendová zpráva */}
      <div>
        <label style={labelStyle}>Víkendová zpráva</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            className="input"
            value={values.weekend_fallback_title}
            onChange={(e) => update("weekend_fallback_title", e.target.value)}
            placeholder="Nadpis pro víkend"
          />
          <input
            className="input"
            value={values.weekend_fallback_text}
            onChange={(e) => update("weekend_fallback_text", e.target.value)}
            placeholder="Text pro víkend"
          />
        </div>
        <p style={hintStyle}>Zobrazí se místo menu ve dnech, kdy restaurace nevaří polední menu</p>
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
          {saving ? "Ukládám…" : "Uložit nastavení"}
        </button>
        {saved && (
          <span style={{ fontSize: "0.82rem", color: "var(--gold)" }}>
            Uloženo
          </span>
        )}
        {error && (
          <span style={{ fontSize: "0.82rem", color: "#fca5a5" }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
