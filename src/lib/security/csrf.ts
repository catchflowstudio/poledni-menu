/**
 * CSRF ochrana — ověření Origin/Referer hlavičky.
 *
 * SameSite=lax cookie chrání před většinou CSRF útoků,
 * ale tohle je defense-in-depth vrstva navíc.
 */

const ALLOWED_ORIGINS = new Set<string>();

function getAllowedOrigins(): Set<string> {
  if (ALLOWED_ORIGINS.size > 0) return ALLOWED_ORIGINS;

  // Přidej produkční URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      ALLOWED_ORIGINS.add(new URL(appUrl).origin);
    } catch {
      // neplatné URL — ignoruj
    }
  }

  // Přidej localhost varianty pro dev
  if (process.env.NODE_ENV !== "production") {
    ALLOWED_ORIGINS.add("http://localhost:3000");
    ALLOWED_ORIGINS.add("http://localhost:3001");
    ALLOWED_ORIGINS.add("http://127.0.0.1:3000");
  }

  return ALLOWED_ORIGINS;
}

/**
 * Ověří, že POST/PATCH/DELETE požadavek přichází ze stejného originu.
 * Vrací true pokud je požadavek legitimní.
 */
export function verifyCsrf(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowed = getAllowedOrigins();

  // Origin hlavička (přesnější)
  if (origin) {
    return allowed.has(origin);
  }

  // Fallback na Referer
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }

  // Bez Origin i Referer — odmítneme (cron endpointy mají vlastní Bearer auth)
  return false;
}
