"use client";

import { useState } from "react";

interface WeekendToggleProps {
  initialValue: boolean;
}

export function WeekendToggle({ initialValue }: WeekendToggleProps) {
  const [servesWeekend, setServesWeekend] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    setSaved(false);
    const newValue = !servesWeekend;

    const res = await fetch("/api/restaurant/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serves_weekend: newValue }),
    });

    if (res.ok) {
      setServesWeekend(newValue);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <p style={{ fontSize: "0.9rem", color: "var(--ivory)" }}>
          Vaříme i o víkendu
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
          {servesWeekend
            ? "Menu se zobrazí i v sobotu a neděli"
            : "O víkendu se zobrazí fallback zpráva"}
        </p>
        {saved && (
          <p style={{ fontSize: "0.75rem", color: "var(--gold)", marginTop: 4 }}>
            Uloženo ✓
          </p>
        )}
      </div>

      {/* Toggle switch */}
      <button
        onClick={toggle}
        disabled={loading}
        aria-label="Přepnout víkendový provoz"
        style={{
          flexShrink: 0,
          width: 48,
          height: 28,
          borderRadius: 14,
          border: "none",
          cursor: loading ? "default" : "pointer",
          background: servesWeekend ? "var(--gold)" : "rgba(248,250,252,0.15)",
          transition: "background 0.2s",
          position: "relative",
          padding: 0,
          opacity: loading ? 0.7 : 1,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: servesWeekend ? 23 : 3,
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
  );
}
