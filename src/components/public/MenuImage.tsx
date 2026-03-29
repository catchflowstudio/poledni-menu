interface MenuImageProps {
  src: string;
  alt?: string;
}

/* Server component — žádný "use client" potřeba.
   Klik otevře obrázek v nové záložce (jediné spolehlivé
   řešení uvnitř iframu — position:fixed by se fixovalo
   na viewport iframu, ne celé stránky). */
export function MenuImage({ src, alt = "Polední menu" }: MenuImageProps) {
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      title="Kliknutím zobrazit celý obrázek"
      style={{
        display: "block",
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
    </a>
  );
}
