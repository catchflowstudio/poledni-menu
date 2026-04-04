/**
 * Date utilities s Europe/Prague timezone.
 * Veškerá logika data v projektu MUSÍ projít přes tyto funkce.
 */

const TIMEZONE = "Europe/Prague";

/** Vrátí aktuální datum v Prague timezone jako YYYY-MM-DD */
export function getTodayPrague(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: TIMEZONE });
}

/** Vrátí zítřejší datum v Prague timezone jako YYYY-MM-DD */
export function getTomorrowPrague(): string {
  const now = new Date();
  // Získáme Prague "now" jako ISO string a parsujeme
  const pragueNow = new Date(
    now.toLocaleString("en-US", { timeZone: TIMEZONE })
  );
  pragueNow.setDate(pragueNow.getDate() + 1);
  return pragueNow.toISOString().split("T")[0];
}

/** Vrátí den v týdnu pro Prague timezone (0 = neděle, 6 = sobota) */
export function getPragueDayOfWeek(): number {
  const now = new Date();
  const pragueNow = new Date(
    now.toLocaleString("en-US", { timeZone: TIMEZONE })
  );
  return pragueNow.getDay();
}

/** Je dnes v Prague timezone víkend? */
export function isWeekendPrague(): boolean {
  const day = getPragueDayOfWeek();
  return day === 0 || day === 6;
}

/** Je dnes v Prague timezone pracovní den? */
export function isWeekdayPrague(): boolean {
  return !isWeekendPrague();
}

/** Vrátí aktuální čas v Prague timezone jako "HH:mm" */
export function getPragueTime(): string {
  return new Date().toLocaleTimeString("sv-SE", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Je aktuální Prague čas >= zadaný čas? (formát "HH:mm") */
export function isPastTimePrague(time: string): boolean {
  return getPragueTime() >= time;
}

/** Formátuje YYYY-MM-DD na české datum (např. "28. března 2026") */
export function formatDateCzech(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Formátuje YYYY-MM-DD na krátké české datum (např. "28. 3. 2026") */
export function formatDateCzechShort(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}
