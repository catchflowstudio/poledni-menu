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
            padding: "12px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            {dateLabel}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--gold)",
              cursor: "pointer",
              opacity: 0.8,
              transition: "opacity 0.2s",
            }}
            onClick={() => setLightboxOpen(true)}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = "1"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = "0.8"; }}
          >
            Zvětšit ↗
          </span>
        </div>
        <div
          style={{ cursor: "zoom-in", padding: 10 }}
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
