/**
 * In-memory rate limiter.
 * Dostatečné pro malý single-instance deployment.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const DEFAULT_MAX = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minut

/** Zkontroluje a inkrementuje rate limit. Vrací true pokud je povoleno. */
export function checkRateLimit(
  key: string,
  maxAttempts: number = DEFAULT_MAX,
  windowMs: number = DEFAULT_WINDOW_MS
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  // Vyčistit starý záznam
  if (entry && now > entry.resetAt) {
    store.delete(key);
  }

  const current = store.get(key);

  if (!current) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= maxAttempts) {
    return false;
  }

  current.count++;
  return true;
}

/** Resetuje rate limit pro klíč (po úspěšném loginu) */
export function resetRateLimit(key: string) {
  store.delete(key);
}
