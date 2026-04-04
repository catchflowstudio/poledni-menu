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

/** GET /api/superadmin/restaurants — seznam všech restaurací */
export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nepřihlášen." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, slug, name, phone, serves_weekend, fallback_type, opening_days, menu_active_from, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Přidej datum posledního nahraného menu + today/tomorrow status
  const { data: menus } = await supabase
    .from("menus")
    .select("restaurant_id, valid_for_date, uploaded_at")
    .order("valid_for_date", { ascending: false });

  // Spočítej dnešní a zítřejší datum (Prague timezone)
  const { getTodayPrague, getTomorrowPrague } = await import("@/lib/date/prague");
  const today = getTodayPrague();
  const tomorrow = getTomorrowPrague();

  const menusByRestaurant: Record<string, { last: string; dates: Set<string>; lastUpload: string }> = {};
  for (const m of menus ?? []) {
    if (!menusByRestaurant[m.restaurant_id]) {
      menusByRestaurant[m.restaurant_id] = {
        last: m.valid_for_date,
        dates: new Set(),
        lastUpload: m.uploaded_at,
      };
    }
    menusByRestaurant[m.restaurant_id].dates.add(m.valid_for_date);
    if (m.uploaded_at > menusByRestaurant[m.restaurant_id].lastUpload) {
      menusByRestaurant[m.restaurant_id].lastUpload = m.uploaded_at;
    }
  }

  const enriched = (data ?? []).map((r) => {
    const info = menusByRestaurant[r.id];
    const lastMenuDate = info?.last ?? null;
    const todayUploaded = info?.dates.has(today) ?? false;
    const tomorrowUploaded = info?.dates.has(tomorrow) ?? false;

    // Dní od posledního uploadu
    let daysInactive: number | null = null;
    if (info?.lastUpload) {
      const lastUploadDate = new Date(info.lastUpload);
      daysInactive = Math.floor((Date.now() - lastUploadDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      ...r,
      lastMenuDate,
      todayUploaded,
      tomorrowUploaded,
      daysInactive,
    };
  });

  return NextResponse.json(enriched);
}

/** POST /api/superadmin/restaurants — vytvoří novou restauraci */
export async function POST(req: NextRequest) {
  if (!verifyCsrf(req)) {
    logSecurityEvent("csrf_rejected", { url: req.url });
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 403 });
  }

  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nepřihlášen." }, { status: 401 });
  }

  const body = await req.json();
  const { slug, password } = body as {
    slug: string;
    name: string;
    password: string;
    phone?: string;
  };
  const name = sanitizeField(body.name, 100);
  const phone = body.phone ? sanitizePhone(body.phone) : undefined;

  if (!slug || !name || !password) {
    return NextResponse.json({ error: "Slug, název a heslo jsou povinné." }, { status: 400 });
  }

  // Validace slugu — jen malá písmena, číslice, pomlčky
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "Slug smí obsahovat pouze malá písmena, číslice a pomlčky." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Heslo musí mít alespoň 8 znaků." }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 12);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("restaurants")
    .insert({
      slug,
      name,
      password_hash,
      phone: phone || null,
      weekend_fallback_title: "O víkendu nevaříme polední menu",
      weekend_fallback_text: "Navštivte nás v pracovní dny od 11:00 do 14:30.",
      serves_weekend: false,
      fallback_type: "text",
      fallback_title: "Dnešní menu právě připravujeme",
      fallback_text: "Zkuste to prosím později nebo nám zavolejte.",
      opening_days: [1, 2, 3, 4, 5],
      menu_active_from: "00:00",
    })
    .select("id, slug, name")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Restaurace s tímto slugem již existuje." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
