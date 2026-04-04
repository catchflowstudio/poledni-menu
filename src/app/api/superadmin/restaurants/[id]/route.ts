import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifySaToken } from "@/app/api/superadmin/auth/route";
import { verifyCsrf } from "@/lib/security/csrf";
import { sanitizeField, sanitizePhone } from "@/lib/security/sanitize";
import { logSecurityEvent } from "@/lib/security/logger";
import bcrypt from "bcrypt";

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sa_token")?.value;
  const secret = process.env.SUPERADMIN_SECRET;
  if (!secret || !token) return false;
  return verifySaToken(token, secret);
}

interface Props {
  params: Promise<{ id: string }>;
}

/** PATCH — reset hesla nebo update nastavení */
export async function PATCH(req: NextRequest, { params }: Props) {
  if (!verifyCsrf(req)) {
    logSecurityEvent("csrf_rejected", { url: req.url });
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 403 });
  }

  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nepřihlášen." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const supabase = getSupabaseAdmin();

  // Reset hesla
  if (body.password) {
    if (typeof body.password !== "string" || body.password.length < 8) {
      return NextResponse.json({ error: "Heslo musí mít alespoň 8 znaků." }, { status: 400 });
    }
    const password_hash = await bcrypt.hash(body.password, 12);
    const { error } = await supabase
      .from("restaurants")
      .update({ password_hash })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, message: "Heslo bylo změněno." });
  }

  // Update ostatních polí — se sanitizací
  const VALID_FALLBACK_TYPES = ["text", "static_menu", "phone"];
  const VALID_ACTIVE_FROM = ["00:00", "08:00", "18:00"];

  const allowed: Record<string, unknown> = {};
  if (typeof body.name === "string") allowed.name = sanitizeField(body.name, 100);
  if (typeof body.phone === "string") allowed.phone = body.phone ? sanitizePhone(body.phone) : null;
  if (typeof body.serves_weekend === "boolean") allowed.serves_weekend = body.serves_weekend;
  if (typeof body.fallback_type === "string" && VALID_FALLBACK_TYPES.includes(body.fallback_type)) {
    allowed.fallback_type = body.fallback_type;
  }
  if (typeof body.fallback_title === "string") allowed.fallback_title = sanitizeField(body.fallback_title, 100);
  if (typeof body.fallback_text === "string") allowed.fallback_text = sanitizeField(body.fallback_text, 300);
  if (Array.isArray(body.opening_days)) {
    allowed.opening_days = [...new Set(body.opening_days.filter((d: unknown) => typeof d === "number" && d >= 0 && d <= 6))];
  }
  if (typeof body.menu_active_from === "string" && VALID_ACTIVE_FROM.includes(body.menu_active_from)) {
    allowed.menu_active_from = body.menu_active_from;
  }

  const { error } = await supabase.from("restaurants").update(allowed).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

/** DELETE — smaže restauraci a všechna její menu */
export async function DELETE(req: NextRequest, { params }: Props) {
  if (!verifyCsrf(req)) {
    logSecurityEvent("csrf_rejected", { url: req.url });
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 403 });
  }

  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nepřihlášen." }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  // Nejdřív získej slug pro smazání souborů ze Storage
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", id)
    .single();

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurace nenalezena." }, { status: 404 });
  }

  // Smaž soubory ze Storage
  const { data: files } = await supabase.storage
    .from("daily-menus")
    .list(restaurant.slug);

  if (files && files.length > 0) {
    const paths = files.map((f) => `${restaurant.slug}/${f.name}`);
    await supabase.storage.from("daily-menus").remove(paths);
  }

  // Smaž záznamy menu (CASCADE by to zvládl, ale raději explicitně)
  await supabase.from("menus").delete().eq("restaurant_id", id);

  // Smaž restauraci
  const { error } = await supabase.from("restaurants").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
