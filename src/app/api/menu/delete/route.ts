import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyCsrf } from "@/lib/security/csrf";
import { logMenuDelete, logSecurityEvent } from "@/lib/security/logger";

export async function POST(req: NextRequest) {
  // CSRF
  if (!verifyCsrf(req)) {
    logSecurityEvent("csrf_rejected", { url: req.url });
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 403 });
  }

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

  if (typeof body !== "object" || body === null || !("date" in body)) {
    return NextResponse.json({ error: "Chybí datum" }, { status: 400 });
  }

  const { date } = body as { date: string };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Neplatný formát data" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Smaž soubor ze Storage (session.slug = tenant izolace)
  const filePath = `${session.slug}/${date}.webp`;
  await supabase.storage.from("daily-menus").remove([filePath]);

  // Smaž záznam z DB (session.restaurantId = tenant izolace)
  const { error } = await supabase
    .from("menus")
    .delete()
    .eq("restaurant_id", session.restaurantId)
    .eq("valid_for_date", date);

  if (error) {
    console.error("Menu delete error:", error);
    return NextResponse.json({ error: "Chyba při mazání" }, { status: 500 });
  }

  logMenuDelete(session.slug, date, session.restaurantId);

  return NextResponse.json({ success: true });
}
