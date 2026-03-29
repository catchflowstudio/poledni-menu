"use client";

import { useState, useRef, useCallback, FormEvent, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { formatDateCzechShort } from "@/lib/date/prague";

interface UploadFormProps {
  slug: string;
  todayDate: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export function UploadForm({ slug, todayDate }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [date, setDate] = useState(todayDate);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /** Validace a nastavení souboru */
  const processFile = useCallback((selected: File) => {
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setMessage({ type: "error", text: "Povolené formáty: JPG, PNG, WEBP." });
      return;
    }
    if (selected.size > MAX_SIZE) {
      setMessage({ type: "error", text: "Soubor je příliš velký (max 10 MB)." });
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

  // Drag & Drop
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
    formData.append("date", date);

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
        text: `Menu bylo úspěšně nahráno pro ${formatDateCzechShort(date)}.`,
      });

      // Reset
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Chyba připojení. Zkuste to znovu." });
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

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Upload area s drag & drop */}
        <div
          className={uploadAreaClass}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Skrytý input pro soubory — desktop */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />

          {preview ? (
            <img src={preview} alt="Náhled menu" className="preview-img" />
          ) : (
            <>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                {dragOver ? "📥" : "📷"}
              </div>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                {dragOver
                  ? "Pusťte pro nahrání"
                  : "Klikněte nebo přetáhněte fotku menu"}
              </p>
              <p style={{ color: "var(--dim)", fontSize: "0.75rem" }}>
                JPG, PNG nebo WEBP · max 10 MB
              </p>
            </>
          )}
        </div>

        {/* Mobilní tlačítka — focení fotoaparátem nebo galerie */}
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
              {/* Fotoaparát — funguje na mobilu */}
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
                📸 Vyfotit
              </label>
              {/* Galerie — klasický výběr souboru */}
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
                🖼 Z galerie
              </label>
            </>
          )}
        </div>

        {/* Datum */}
        <div style={{ marginTop: 20 }}>
          <label
            htmlFor="menu-date"
            style={{
              display: "block",
              fontSize: "0.85rem",
              color: "var(--muted)",
              marginBottom: 8,
            }}
          >
            Menu platí pro datum
          </label>
          <input
            id="menu-date"
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--dim)",
            marginTop: 12,
            lineHeight: 1.5,
          }}
        >
          Pro stejné datum nové menu nahradí původní.
        </p>

        {message && (
          <div
            className={`alert ${
              message.type === "success" ? "alert--success" : "alert--error"
            }`}
            style={{ marginTop: 16 }}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!file || loading}
          style={{ width: "100%", marginTop: 20 }}
        >
          {loading ? "Nahrávám…" : "Nahrát menu"}
        </button>
      </form>

      {message?.type === "success" && (
        <a
          href={`/${slug}/menu`}
          className="btn btn-secondary"
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: "100%", marginTop: 12, textAlign: "center" }}
        >
          Otevřít veřejné menu ↗
        </a>
      )}
    </div>
  );
}
