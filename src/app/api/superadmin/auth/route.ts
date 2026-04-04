import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { safeCompare } from "@/lib/security/timing";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { logSuperadminLogin, logSecurityEvent } from "@/lib/security/logger";

const SA_COOKIE = "sa_token";
const SA_MAX_AGE = 60 * 60 * 8; // 8 hodin

/** Vytvoří HMAC token ze secretu — v cookie nikdy neukládáme raw secret */
function createSaToken(secret: string): string {
  return createHmac("sha256", secret).update("superadmin-session").digest("hex");
}

/** Ověří sa_token cookie proti HMAC */
export function verifySaToken(token: string, secret: string): boolean {
  const expected = createSaToken(secret);
  return safeCompare(token, expected);
}

export async function POST(req: NextRequest) {
  // CSRF
  if (!verifyCsrf(req)) {
    logSecurityEvent("csrf_rejected", { url: req.url });
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Rate limit pro superadmin login
  const rateLimitKey = `sa:${ip}`;
  if (!checkRateLimit(rateLimitKey)) {
    logSecurityEvent("superadmin_rate_limited", { ip });
    return NextResponse.json(
      { error: "Příliš mnoho pokusů. Zkuste to za 15 minut." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  const { password } = body as { password?: string };
  const secret = process.env.SUPERADMIN_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Superadmin není nakonfigurován." }, { status: 500 });
  }

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Chybí heslo." }, { status: 400 });
  }

  // Timing-safe porovnání
  if (!safeCompare(password, secret)) {
    logSuperadminLogin(ip, false);
    return NextResponse.json({ error: "Špatné heslo." }, { status: 401 });
  }

  // Uložíme HMAC token, ne raw secret
  const token = createSaToken(secret);
  const cookieStore = await cookies();
  cookieStore.set(SA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SA_MAX_AGE,
    path: "/",
  });

  logSuperadminLogin(ip, true);

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("sa_token");
  return NextResponse.json({ ok: true });
}
