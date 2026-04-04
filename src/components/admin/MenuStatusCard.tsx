"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  label: string;
  date: string;
  dateFormatted: string;
  imageUrl: string | null;
  uploaded: boolean;
  dimImage?: boolean;
}

export function MenuStatusCard({ label, date, dateFormatted, imageUrl, uploaded, dimImage }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    setDeleting(true);
    const res = await fetch("/api/menu/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });

    if (res.ok) {
      router.refresh();
    }
    setDeleting(false);
    setConfirmDelete(false);
  }

  return (
    <div className="glass-card" style={{ padding: "16px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: uploaded ? "#22c55e" : "rgba(248,250,252,0.2)",
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: "0.78rem",
          color: "var(--muted)",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}>
          {label}
        </span>
      </div>

      <p style={{
        fontSize: "0.88rem",
        fontWeight: 500,
        color: uploaded ? "var(--ivory)" : "var(--muted)",
        marginBottom: imageUrl ? 10 : 0,
      }}>
        {uploaded ? "Nahráno" : "—"}
      </p>

      {imageUrl && (
        <>
          <img
            src={imageUrl}
            alt={`${label} menu`}
            style={{
              width: "100%",
              borderRadius: 4,
              marginBottom: 6,
              opacity: dimImage ? 0.85 : 1,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "0.72rem", color: "var(--dim)" }}>
              {dateFormatted}
            </p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: "none",
                border: "none",
                cursor: deleting ? "default" : "pointer",
                fontSize: "0.72rem",
                color: confirmDelete ? "#f87171" : "var(--dim)",
                padding: "2px 0",
                transition: "color 0.15s",
              }}
            >
              {deleting ? "…" : confirmDelete ? "Opravdu smazat?" : "Smazat"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
