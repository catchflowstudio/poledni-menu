"use client";

import { useState } from "react";
import { MenuCard } from "./MenuCard";

interface Props {
  imageUrl: string;
  dateLabel: string;
}

export function TomorrowMenuToggle({ imageUrl, dateLabel }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 32 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "8px 16px",
          color: "var(--muted)",
          fontSize: "0.82rem",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        {open ? "Skrýt zítřejší menu" : "Zobrazit zítřejší menu"}
        <span style={{
          display: "inline-block",
          transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          fontSize: "0.7rem",
        }}>
          ▼
        </span>
      </button>

      {open && (
        <div className="slide-up" style={{ marginTop: 20 }}>
          <MenuCard imageUrl={imageUrl} dateLabel={dateLabel} />
        </div>
      )}
    </div>
  );
}
