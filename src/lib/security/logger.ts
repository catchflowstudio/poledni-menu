/**
 * Strukturovaný logger pro security-relevantní události.
 * Loguje do stdout (Vercel loguje vše co jde přes console).
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  event: string;
  timestamp: string;
  [key: string]: unknown;
}

function log(level: LogLevel, event: string, details: Record<string, unknown> = {}) {
  const entry: LogEntry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...details,
  };

  // Nikdy neloguj hesla, tokeny, secrets
  delete entry.password;
  delete entry.token;
  delete entry.secret;
  delete entry.password_hash;

  const line = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

// ── Konkrétní eventy ──

export function logLoginAttempt(slug: string, ip: string, success: boolean) {
  log(success ? "info" : "warn", "login_attempt", { slug, ip, success });
}

export function logLoginRateLimited(slug: string, ip: string) {
  log("warn", "login_rate_limited", { slug, ip });
}

export function logMenuUpload(slug: string, date: string, restaurantId: string) {
  log("info", "menu_upload", { slug, date, restaurantId });
}

export function logMenuDelete(slug: string, date: string, restaurantId: string) {
  log("info", "menu_delete", { slug, date, restaurantId });
}

export function logSettingsChange(slug: string, restaurantId: string, fields: string[]) {
  log("info", "settings_change", { slug, restaurantId, fields });
}

export function logSuperadminLogin(ip: string, success: boolean) {
  log(success ? "info" : "warn", "superadmin_login", { ip, success });
}

export function logCronCleanup(deleted: number, cutoffDate: string) {
  log("info", "cron_cleanup", { deleted, cutoffDate });
}

export function logSecurityEvent(event: string, details: Record<string, unknown> = {}) {
  log("warn", event, details);
}
