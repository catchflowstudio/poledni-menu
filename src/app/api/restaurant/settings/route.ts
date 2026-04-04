import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { FallbackType } from "@/types";

const VALID_FALLBACK_TYPES: FallbackType[] = ["text", "static_menu", "phone"];
const VALID_DAYS = [0, 1, 2, 3, 4, 5, 6];

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
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

  // serves_weekend
  if (typeof raw.serves_weekend === "boolean") {
    update.serves_weekend = raw.serves_weekend;
  }

  // fallback_type
  if (typeof raw.fallback_type === "string" && VALID_FALLBACK_TYPES.includes(raw.fallback_type as FallbackType)) {
    update.fallback_type = raw.fallback_type;
  }

  // fallback_title
  if (typeof raw.fallback_title === "string" && raw.fallback_title.length <= 200) {
    update.fallback_title = raw.fallback_title;
  }

  // fallback_text
  if (typeof raw.fallback_text === "string" && raw.fallback_text.length <= 500) {
    update.fallback_text = raw.fallback_text;
  }

  // weekend_fallback_title
  if (typeof raw.weekend_fallback_title === "string" && raw.weekend_fallback_title.length <= 200) {
    update.weekend_fallback_title = raw.weekend_fallback_title;
  }

  // weekend_fallback_text
  if (typeof raw.weekend_fallback_text === "string" && raw.weekend_fallback_text.length <= 500) {
    update.weekend_fallback_text = raw.weekend_fallback_text;
  }

  // opening_days
  if (Array.isArray(raw.opening_days)) {
    const days = raw.opening_days.filter(
      (d): d is number => typeof d === "number" && VALID_DAYS.includes(d)
    );
    update.opening_days = days;
  }

  // menu_active_from
  if (typeof raw.menu_active_from === "string" && /^\d{2}:\d{2}$/.test(raw.menu_active_from)) {
    update.menu_active_from = raw.menu_active_from;
  }

  // static_menu_url
  if (typeof raw.static_menu_url === "string") {
    update.static_menu_url = raw.static_menu_url || null;
  }

  // phone
  if (typeof raw.phone === "string") {
    update.phone = raw.phone || null;
  }

  // name
  if (typeof raw.name === "string" && raw.name.length > 0 && raw.name.length <= 100) {
    update.name = raw.name;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Žádná platná data" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("restaurants")
    .update(update)
    .eq("id", session.restaurantId);

  if (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Chyba při ukládání" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
