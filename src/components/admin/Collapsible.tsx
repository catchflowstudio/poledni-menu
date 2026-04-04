"use client";

import { useState } from "react";

interface Props {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Collapsible({ title, hint, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass-card" style={{ marginBottom: 16, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "18px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--ivory)",
          textAlign: "left",
        }}
      >
        <div>
          <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{title}</span>
          {hint && (
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
              {hint}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--muted)",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          ▼
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 22px 22px" }}>
          {children}
        </div>
      )}
    </div>
  );
}
