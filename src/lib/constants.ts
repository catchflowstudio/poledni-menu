/** Maximální velikost souboru: 10 MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Povolené MIME typy */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Maximální rozměr obrázku po zpracování */
export const MAX_IMAGE_WIDTH = 1600;
export const MAX_IMAGE_HEIGHT = 2400;

/** Kvalita webp výstupu */
export const WEBP_QUALITY = 85;
