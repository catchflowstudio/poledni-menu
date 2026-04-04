"use client";

interface MenuImageProps {
  src: string;
  alt?: string;
}

export function MenuImage({ src, alt = "Polední menu" }: MenuImageProps) {
  function handleClick() {
    // Pošle zprávu rodičovské stránce — ta vytvoří fullscreen overlay.
    // Používáme "*" jako cíl, protože nevíme origin rodiče (může být
    // jakákoliv restaurace). Bezpečnost zajišťuje rodič validací e.origin.
    window.parent.postMessage({ type: "menu-zoom", src }, "*");
  }

  return (
    <div
      onClick={handleClick}
      title="Kliknutím zvětšit"
      style={{
        width: "100%",
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
          height: "auto",
          display: "block",
        }}
      />
    </div>
  );
}
