"use client";

import { useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";

interface MenuCardProps {
  imageUrl: string;
  dateLabel: string;
}

export function MenuCard({ imageUrl, dateLabel }: MenuCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            Platí pro: <strong style={{ color: "var(--ivory)" }}>{dateLabel}</strong>
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--gold)",
              cursor: "pointer",
            }}
            onClick={() => setLightboxOpen(true)}
          >
            Zvětšit ↗
          </span>
        </div>
        <div
          style={{ cursor: "zoom-in", padding: 12 }}
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={imageUrl}
            alt="Dnešní polední menu"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "var(--radius-sm)",
              display: "block",
            }}
          />
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          src={imageUrl}
          alt="Dnešní polední menu – zvětšení"
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
