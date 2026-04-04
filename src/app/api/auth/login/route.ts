import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";
import { verifyCsrf } from "@/lib/security/csrf";
import { logLoginAttempt, logLoginRateLimited, logSecurityEvent } from "@/lib/security/logger";

export async function POST(request: NextRequest) {
  try {
    // CSRF
    if (!verifyCsrf(request)) {
      logSecurityEvent("csrf_rejected", { url: request.url });
      return NextResponse.json({ error: "Neplatný požadavek." }, { status: 403 });
    }

    const { slug, password } = await request.json();

    if (!slug || !password || typeof slug !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Chybí přihlašovací údaje." },
        { status: 400 }
      );
    }

    // Validace slug formátu (prevence injection)
    if (!/^[a-z0-9-]+$/.test(slug) || slug.length > 64) {
      return NextResponse.json(
        { error: "Neplatné přihlašovací údaje." },
        { status: 401 }
      );
    }

    // Rate limit na IP + slug
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitKey = `${ip}:${slug}`;

    if (!checkRateLimit(rateLimitKey)) {
      logLoginRateLimited(slug, ip);
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
      logLoginAttempt(slug, ip, false);
      return NextResponse.json(
        { error: "Neplatné přihlašovací údaje." },
        { status: 401 }
      );
    }

    // Ověř heslo (bcrypt.compare je inherentně timing-safe)
    const valid = await bcrypt.compare(password, restaurant.password_hash);
    if (!valid) {
      logLoginAttempt(slug, ip, false);
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

    logLoginAttempt(slug, ip, true);

    return NextResponse.json({ success: true, slug: restaurant.slug });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Chyba serveru." },
      { status: 500 }
    );
  }
}
