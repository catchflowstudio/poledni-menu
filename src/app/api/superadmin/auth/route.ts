import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeCompare } from "@/lib/security/timing";
import { setSaCookie } from "@/lib/security/superadmin";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { logSuperadminLogin, logSecurityEvent } from "@/lib/security/logger";

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
  await setSaCookie(secret);

  logSuperadminLogin(ip, true);

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("sa_token");
  return NextResponse.json({ ok: true });
}
