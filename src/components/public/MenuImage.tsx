"use client";

import { useState, useEffect } from "react";

interface MenuImageProps {
  src: string;
  alt?: string;
}

export function MenuImage({ src, alt = "Polední menu" }: MenuImageProps) {
  const [open, setOpen] = useState(false);

  /* Escape zavře lightbox */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Fotka v A4 rámci — kliknutím otevře lightbox */}
      <div
        onClick={() => setOpen(true)}
        title="Kliknutím zvětšit"
        style={{
          width: "100%",
          aspectRatio: "210 / 297",
          overflow: "hidden",
          lineHeight: 0,
          cursor: "zoom-in",
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* Lightbox overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            padding: 24,
          }}
        >
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 2,
              boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
              cursor: "default",
            }}
          />
        </div>
      )}
    </>
  );
}
