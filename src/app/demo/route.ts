import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { logSecurityEvent } from "@/lib/security/logger";

const DEMO_SLUG = "testovaci-restaurace";

/**
 * GET /demo
 * Vytvoří demo session pro testovací restauraci a přesměruje na admin.
 * Bez hesla — demo session trvá 2 hodiny.
 */
export async function GET(request: NextRequest) {
  // Rate limit — max 10 demo sessions za 15 minut z jedné IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateLimitKey = `demo:${ip}`;

  if (!checkRateLimit(rateLimitKey)) {
    logSecurityEvent("demo_rate_limited", { ip });
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Najdi demo restauraci
  const supabase = getSupabaseAdmin();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, slug")
    .eq("slug", DEMO_SLUG)
    .single();

  if (!restaurant) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Vytvoř demo session (2h, isDemo=true)
  const token = await createSession(restaurant.id, restaurant.slug, true);
  await setSessionCookie(token, true);

  // Přesměruj na admin dashboard
  return NextResponse.redirect(new URL(`/${DEMO_SLUG}/admin/menu`, request.url));
}
