import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcrypt";

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sa_token")?.value;
  const secret = process.env.SUPERADMIN_SECRET;
  return secret && token === secret;
}

/** GET /api/superadmin/restaurants — seznam všech restaurací */
export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nepřihlášen." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, slug, name, phone, serves_weekend, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Přidej datum posledního nahraného menu
  const { data: menus } = await supabase
    .from("menus")
    .select("restaurant_id, valid_for_date")
    .order("valid_for_date", { ascending: false });

  const lastMenuByRestaurant = (menus ?? []).reduce<Record<string, string>>(
    (acc, m) => {
      if (!acc[m.restaurant_id]) acc[m.restaurant_id] = m.valid_for_date;
      return acc;
    },
    {}
  );

  const enriched = (data ?? []).map((r) => ({
    ...r,
    lastMenuDate: lastMenuByRestaurant[r.id] ?? null,
  }));

  return NextResponse.json(enriched);
}

/** POST /api/superadmin/restaurants — vytvoří novou restauraci */
export async function POST(req: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nepřihlášen." }, { status: 401 });
  }

  const body = await req.json();
  const { slug, name, password, phone } = body as {
    slug: string;
    name: string;
    password: string;
    phone?: string;
  };

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
