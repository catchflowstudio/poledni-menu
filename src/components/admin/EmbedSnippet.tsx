"use client";

import { useState } from "react";

interface EmbedSnippetProps {
  menuUrl: string;
}

export function EmbedSnippet({ menuUrl }: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false);

  const snippet = `<iframe
  src="${menuUrl}"
  width="100%"
  height="600"
  style="border:none; border-radius:8px;"
  loading="lazy"
  title="Denní menu"
></iframe>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — select text
    }
  }

  return (
    <div>
      <pre
        style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 14px",
          fontSize: "0.72rem",
          color: "var(--muted)",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          marginBottom: 12,
          lineHeight: 1.6,
          fontFamily: "monospace",
        }}
      >
        {snippet}
      </pre>
      <button
        onClick={copy}
        className="btn btn-secondary"
        style={{ width: "100%", fontSize: "0.85rem" }}
      >
        {copied ? "Zkopírováno ✓" : "Kopírovat kód"}
      </button>
    </div>
  );
}
