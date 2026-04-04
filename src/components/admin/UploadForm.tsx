"use client";

import { useState, useRef, useCallback, FormEvent, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { formatDateCzechShort } from "@/lib/date/prague";

interface UploadFormProps {
  slug: string;
  todayDate: string;
  tomorrowDate: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

type DateChoice = "today" | "tomorrow" | "custom";

export function UploadForm({ slug, todayDate, tomorrowDate }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dateChoice, setDateChoice] = useState<DateChoice>("today");
  const [customDate, setCustomDate] = useState(todayDate);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
    date?: string;
  } | null>(null);

  const activeDate =
    dateChoice === "today" ? todayDate :
    dateChoice === "tomorrow" ? tomorrowDate :
    customDate;

  const processFile = useCallback((selected: File) => {
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setMessage({ type: "error", text: "Povolené formáty: JPG, PNG, WEBP." });
      return;
    }
    if (selected.size > MAX_SIZE) {
      setMessage({ type: "error", text: "Max 10 MB." });
      return;
    }

    setFile(selected);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  }, []);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("date", activeDate);

    try {
      const res = await fetch("/api/menu/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Chyba při nahrávání." });
        return;
      }

      setMessage({
        type: "success",
        text: `Menu nahráno pro ${formatDateCzechShort(activeDate)}`,
        date: activeDate,
      });

      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Chyba připojení." });
    } finally {
      setLoading(false);
    }
  }

  const uploadAreaClass = [
    "upload-area",
    preview ? "upload-area--has-file" : "",
    dragOver ? "upload-area--drag-over" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const dateButtonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "10px 12px",
    borderRadius: "var(--radius-sm)",
    border: active ? "1px solid var(--border-gold)" : "1px solid var(--border)",
    background: active ? "var(--gold-dim)" : "transparent",
    color: active ? "var(--gold)" : "var(--muted)",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: active ? 600 : 400,
    transition: "all 0.15s",
    textAlign: "center" as const,
  });

  // Success state — show confirmation instead of form
  if (message?.type === "success") {
    return (
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "1.3rem",
          }}
        >
          ✓
        </div>
        <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ivory)", marginBottom: 4 }}>
          Menu nahráno
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 20 }}>
          {message.text}
        </p>

        {preview && (
          <img
            src={preview}
            alt="Nahrané menu"
            style={{
              width: "100%",
              maxWidth: 280,
              borderRadius: "var(--radius-sm)",
              marginBottom: 20,
              opacity: 0.9,
            }}
          />
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href={`/${slug}/menu`}
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.85rem" }}
          >
            Zobrazit veřejné menu
          </a>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => { setMessage(null); setPreview(null); }}
            style={{ fontSize: "0.85rem" }}
          >
            Nahrát další
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Quick date buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button type="button" style={dateButtonStyle(dateChoice === "today")} onClick={() => setDateChoice("today")}>
            Dnes
          </button>
          <button type="button" style={dateButtonStyle(dateChoice === "tomorrow")} onClick={() => setDateChoice("tomorrow")}>
            Zítra
          </button>
          <button type="button" style={dateButtonStyle(dateChoice === "custom")} onClick={() => setDateChoice("custom")}>
            Jiný den
          </button>
        </div>

        {dateChoice === "custom" && (
          <div style={{ marginBottom: 16 }}>
            <input
              type="date"
              className="input"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              required
            />
          </div>
        )}

        {/* Upload area */}
        <div
          className={uploadAreaClass}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />

          {preview ? (
            <img src={preview} alt="Náhled" className="preview-img" />
          ) : (
            <>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                {dragOver ? "📥" : "📷"}
              </div>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                {dragOver ? "Pusťte pro nahrání" : "Klikněte nebo přetáhněte fotku"}
              </p>
              <p style={{ color: "var(--dim)", fontSize: "0.75rem" }}>
                JPG, PNG nebo WEBP · max 10 MB
              </p>
            </>
          )}
        </div>

        {/* Mobile buttons */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {preview ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => fileInputRef.current?.click()}
              style={{ flex: 1, fontSize: "0.8rem" }}
            >
              Změnit fotku
            </button>
          ) : (
            <>
              <label
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: "10px 16px", borderRadius: "var(--radius-sm)",
                  background: "rgba(248,250,252,0.06)", border: "1px solid var(--border)",
                  color: "var(--muted)", fontSize: "0.82rem", cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                Vyfotit
              </label>
              <label
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: "10px 16px", borderRadius: "var(--radius-sm)",
                  background: "rgba(248,250,252,0.06)", border: "1px solid var(--border)",
                  color: "var(--muted)", fontSize: "0.82rem", cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                Z galerie
              </label>
            </>
          )}
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--dim)", marginTop: 12 }}>
          Nové nahrání přepíše předchozí.
        </p>

        {message?.type === "error" && (
          <div className="alert alert--error" style={{ marginTop: 12 }}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!file || loading}
          style={{ width: "100%", marginTop: 16 }}
        >
          {loading ? "Nahrávám…" : "Nahrát menu"}
        </button>
      </form>
    </div>
  );
}
