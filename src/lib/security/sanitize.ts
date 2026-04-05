/**
 * Sanitizace a validace textových vstupů.
 *
 * Všechny funkce normalizují Unicode (NFC) a odmítají
 * poškozené UTF-8 (U+FFFD replacement character).
 */

/** Unicode normalizace + odstranění replacement characters */
function normalizeUnicode(input: string): string {
  return input
    .normalize("NFC") // canonical composition (č = U+010D, not c + U+030C)
    .replace(/\uFFFD/g, ""); // strip replacement characters (broken encoding)
}

/** Odstraní HTML tagy a nebezpečné znaky */
export function sanitizeText(input: string): string {
  return normalizeUnicode(input)
    .replace(/[<>]/g, "") // strip HTML brackets
    .replace(/javascript:/gi, "") // strip javascript: protocol
    .replace(/on\w+\s*=/gi, "") // strip event handlers (onclick= etc.)
    .trim();
}

/** Validuje a sanitizuje telefonní číslo */
export function sanitizePhone(input: string): string | null {
  // Ponech jen +, číslice, mezery, pomlčky
  const cleaned = normalizeUnicode(input)
    .replace(/[^+\d\s-]/g, "")
    .trim();
  if (cleaned.length === 0) return null;
  if (cleaned.length > 20) return null; // příliš dlouhé
  return cleaned;
}

/** Validuje URL — povolí jen http/https */
export function sanitizeUrl(input: string): string | null {
  const trimmed = normalizeUnicode(input).trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

/** Ořízne string na max délku a sanitizuje */
export function sanitizeField(input: string, maxLength: number): string {
  return sanitizeText(input.slice(0, maxLength));
}
