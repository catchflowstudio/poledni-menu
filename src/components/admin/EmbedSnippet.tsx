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
  style="width:100%;height:600px;border:none;display:block;background:transparent;"
></iframe>
<script>
(function(){
  var ORIGIN='${menuOrigin}';
  var iframe=document.getElementById('poledni-menu');
  // Lightbox overlay
  var o=document.createElement('div');
  o.tabIndex=-1;
  o.style.cssText='display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.92);cursor:zoom-out;align-items:center;justify-content:center;padding:24px;outline:none;';
  var btn=document.createElement('button');
  btn.innerHTML='\\u2715';
  btn.style.cssText='position:absolute;top:20px;right:20px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:#fff;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center;';
  btn.onclick=function(){o.style.display='none';};
  o.appendChild(btn);
  var img=document.createElement('img');
  img.style.cssText='max-width:100%;max-height:90vh;object-fit:contain;cursor:default;border-radius:4px;box-shadow:0 8px 48px rgba(0,0,0,.6);';
  img.onclick=function(e){e.stopPropagation();};
  o.appendChild(img);
  document.body.appendChild(o);
  o.onclick=function(){o.style.display='none';};
  o.onkeydown=function(e){if(e.key==='Escape')o.style.display='none';};
  window.addEventListener('message',function(e){
    if(e.origin!==ORIGIN)return;
    if(!e.data)return;
    // Auto-resize iframe
    if(e.data.type==='menu-resize'&&e.data.height>0){
      iframe.style.height=e.data.height+'px';
    }
    // Lightbox zoom
    if(e.data.type==='menu-zoom'){
      img.src=e.data.src;o.style.display='flex';o.focus();
    }
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
          background: "rgba(0,0,0,0.2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 14px",
          fontSize: "0.7rem",
          color: "var(--muted)",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          marginBottom: 12,
          lineHeight: 1.6,
          fontFamily: "'SF Mono', 'Fira Code', monospace",
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
