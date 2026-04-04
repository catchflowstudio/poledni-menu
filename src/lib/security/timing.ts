import { timingSafeEqual } from "crypto";

/**
 * Timing-safe porovnání dvou stringů.
 * Zabraňuje timing útokům při porovnávání secrets.
 */
export function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");

    // timingSafeEqual vyžaduje stejnou délku
    if (bufA.length !== bufB.length) {
      // Stále provedeme porovnání, aby čas odpovědi nebyl závislý na délce
      timingSafeEqual(bufA, bufA);
      return false;
    }

    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
