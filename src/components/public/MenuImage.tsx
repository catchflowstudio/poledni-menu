"use client";

interface MenuImageProps {
  src: string;
  alt?: string;
}

/* Zoom otevírá plovoucí popup okno v poměru A4.
   window.open je jediné spolehlivé řešení pro escape z iframe —
   position:fixed uvnitř iframu se fixuje na viewport iframu, ne stránky. */
export function MenuImage({ src, alt = "Polední menu" }: MenuImageProps) {
  function openZoom() {
    const w = 720;
    const h = Math.round(w * (297 / 210)); // A4 výška
    const left = Math.round(window.screen.width / 2 - w / 2);
    const top = Math.round(window.screen.height / 2 - h / 2);
    window.open(
      src,
      "menu-zoom",
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=no,location=no,menubar=no,toolbar=no,status=no`
    );
  }

  return (
    <div
      onClick={openZoom}
      title="Kliknutím zobrazit v plovoucím okně"
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
  );
}
