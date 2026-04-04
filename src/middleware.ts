import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "pm_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pouze admin routy (ale ne login)
  const adminMatch = pathname.match(/^\/([^/]+)\/admin\/(?!login)([\w-]+)$/);
  if (!adminMatch) return NextResponse.next();

  const slug = adminMatch[1];
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Žádná session → redirect na login
  if (!token) {
    return NextResponse.redirect(
      new URL(`/${slug}/admin/login`, request.url)
    );
  }

  // Ověř JWT
  const secret = getSecret();
  if (!secret) {
    return NextResponse.redirect(
      new URL(`/${slug}/admin/login`, request.url)
    );
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const sessionSlug = (payload as { slug?: string }).slug;

    // Session patří jiné restauraci
    if (sessionSlug !== slug) {
      return NextResponse.redirect(
        new URL(`/${slug}/admin/login`, request.url)
      );
    }

    return NextResponse.next();
  } catch {
    // Neplatný/expirovaný token
    const response = NextResponse.redirect(
      new URL(`/${slug}/admin/login`, request.url)
    );
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/:slug/admin/:path*"],
};
