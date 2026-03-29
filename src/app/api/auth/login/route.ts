import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const { slug, password } = await request.json();

    if (!slug || !password) {
      return NextResponse.json(
        { error: "Chybí přihlašovací údaje." },
        { status: 400 }
      );
    }

    // Rate limit na IP + slug
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitKey = `${ip}:${slug}`;

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: "Příliš mnoho pokusů. Zkuste to za 15 minut." },
        { status: 429 }
      );
    }

    // Najdi restauraci (admin klient — čte password_hash)
    const supabase = getSupabaseAdmin();
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id, slug, password_hash")
      .eq("slug", slug)
      .single();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Neplatné přihlašovací údaje." },
        { status: 401 }
      );
    }

    // Ověř heslo
    const valid = await bcrypt.compare(password, restaurant.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Neplatné přihlašovací údaje." },
        { status: 401 }
      );
    }

    // Reset rate limitu po úspěchu
    resetRateLimit(rateLimitKey);

    // Vytvoř session
    const token = await createSession(restaurant.id, restaurant.slug);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, slug: restaurant.slug });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Chyba serveru." },
      { status: 500 }
    );
  }
}
