import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyCsrf } from "@/lib/security/csrf";
import { sanitizeField, sanitizePhone, sanitizeUrl } from "@/lib/security/sanitize";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { logSettingsChange, logSecurityEvent } from "@/lib/security/logger";
import type { FallbackType } from "@/types";

const VALID_FALLBACK_TYPES: FallbackType[] = ["text", "static_menu", "phone"];
const VALID_DAYS = [0, 1, 2, 3, 4, 5, 6];
const VALID_ACTIVE_TIMES = ["00:00", "08:00", "18:00"];

export async function PATCH(req: NextRequest) {
  // CSRF
  if (!verifyCsrf(req)) {
    logSecurityEvent("csrf_rejected", { url: req.url });
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 403 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  // Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`settings:${session.slug}:${ip}`, 10)) {
    logSecurityEvent("settings_rate_limited", { slug: session.slug, ip });
    return NextResponse.json({ error: "Příliš mnoho požadavků." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  const changedFields: string[] = [];

  // serves_weekend
  if (typeof raw.serves_weekend === "boolean") {
    update.serves_weekend = raw.serves_weekend;
    changedFields.push("serves_weekend");
  }

  // fallback_type — strict enum
  if (typeof raw.fallback_type === "string" && VALID_FALLBACK_TYPES.includes(raw.fallback_type as FallbackType)) {
    update.fallback_type = raw.fallback_type;
    changedFields.push("fallback_type");
  }

  // fallback_title — sanitizovaný, max 200 znaků
  if (typeof raw.fallback_title === "string") {
    update.fallback_title = sanitizeField(raw.fallback_title, 200);
    changedFields.push("fallback_title");
  }

  // fallback_text — sanitizovaný, max 500 znaků
  if (typeof raw.fallback_text === "string") {
    update.fallback_text = sanitizeField(raw.fallback_text, 500);
    changedFields.push("fallback_text");
  }

  // weekend_fallback_title
  if (typeof raw.weekend_fallback_title === "string") {
    update.weekend_fallback_title = sanitizeField(raw.weekend_fallback_title, 200);
    changedFields.push("weekend_fallback_title");
  }

  // weekend_fallback_text
  if (typeof raw.weekend_fallback_text === "string") {
    update.weekend_fallback_text = sanitizeField(raw.weekend_fallback_text, 500);
    changedFields.push("weekend_fallback_text");
  }

  // opening_days — strict array of valid day numbers
  if (Array.isArray(raw.opening_days)) {
    const days = raw.opening_days.filter(
      (d): d is number => typeof d === "number" && VALID_DAYS.includes(d)
    );
    // Deduplikace
    update.opening_days = [...new Set(days)];
    changedFields.push("opening_days");
  }

  // menu_active_from — strict allowlist
  if (typeof raw.menu_active_from === "string" && VALID_ACTIVE_TIMES.includes(raw.menu_active_from)) {
    update.menu_active_from = raw.menu_active_from;
    changedFields.push("menu_active_from");
  }

  // static_menu_url — validace URL formátu
  if (typeof raw.static_menu_url === "string") {
    update.static_menu_url = sanitizeUrl(raw.static_menu_url);
    changedFields.push("static_menu_url");
  }

  // phone — sanitizace
  if (typeof raw.phone === "string") {
    update.phone = sanitizePhone(raw.phone);
    changedFields.push("phone");
  }

  // name — sanitizovaný, max 100 znaků
  if (typeof raw.name === "string" && raw.name.length > 0) {
    update.name = sanitizeField(raw.name, 100);
    changedFields.push("name");
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Žádná platná data" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Tenant izolace: session.restaurantId = může zapsat jen do své restaurace
  const { error } = await supabase
    .from("restaurants")
    .update(update)
    .eq("id", session.restaurantId);

  if (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Chyba při ukládání" }, { status: 500 });
  }

  logSettingsChange(session.slug, session.restaurantId, changedFields);

  return NextResponse.json({ success: true });
}
