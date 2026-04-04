/** Maximální velikost souboru: 10 MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Povolené MIME typy */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Povolené Sharp formáty (skutečný typ souboru, ne MIME header) */
export const ALLOWED_SHARP_FORMATS = ["jpeg", "png", "webp"] as const;

/** Maximální rozměr obrázku po zpracování (Sharp resize) */
export const MAX_IMAGE_WIDTH = 1600;
export const MAX_IMAGE_HEIGHT = 2400;

/** Tvrdý limit na vstupní pixelové rozměry (před zpracováním) */
export const MAX_INPUT_PIXELS = 4096 * 4096; // ~16 Mpx

/** Kvalita webp výstupu */
export const WEBP_QUALITY = 85;
