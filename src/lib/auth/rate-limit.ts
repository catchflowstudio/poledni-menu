/**
 * In-memory rate limiter pro login pokusy.
 * Dostatečné pro malý single-instance deployment.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minut

/** Zkontroluje a inkrementuje rate limit. Vrací true pokud je povoleno. */
export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = store.get(key);

  // Vyčistit starý záznam
  if (entry && now > entry.resetAt) {
    store.delete(key);
  }

  const current = store.get(key);

  if (!current) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_ATTEMPTS) {
    return false;
  }

  current.count++;
  return true;
}

/** Resetuje rate limit pro klíč (po úspěšném loginu) */
export function resetRateLimit(key: string) {
  store.delete(key);
}
