"use client";

import { useState } from "react";

interface EmbedSnippetProps {
  menuUrl: string;
}

export function EmbedSnippet({ menuUrl }: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false);

  // Origin poledni-menu serveru — pro validaci v postMessage listeneru
  let menuOrigin = "https://poledni-menu.vercel.app";
  try {
    menuOrigin = new URL(menuUrl).origin;
  } catch {
    // fallback na produkci
  }

  const snippet = `<!-- Polední menu embed -->
<iframe
  src="${menuUrl}"
  id="poledni-menu"
  allowtransparency="true"
  scrolling="no"
  loading="lazy"
  style="width:100%;aspect-ratio:210/297;border:none;display:block;background:transparent;"
></iframe>
<script>
(function(){
  var ORIGIN='${menuOrigin}';
  var overlay=document.createElement('div');
  overlay.style.cssText='display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.9);cursor:zoom-out;align-items:center;justify-content:center;padding:24px;';
  var img=document.createElement('img');
  img.style.cssText='max-width:100%;max-height:90vh;object-fit:contain;cursor:default;border-radius:4px;box-shadow:0 8px 48px rgba(0,0,0,.6);';
  img.onclick=function(e){e.stopPropagation();};
  overlay.appendChild(img);
  document.body.appendChild(overlay);
  overlay.onclick=function(){overlay.style.display='none';};
  document.addEventListener('keydown',function(e){if(e.key==='Escape')overlay.style.display='none';});
  window.addEventListener('message',function(e){
    if(e.origin!==ORIGIN)return;
    if(!e.data||e.data.type!=='menu-zoom')return;
    img.src=e.data.src;
    overlay.style.display='flex';
  });
})();
<\/script>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard nedostupný
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
