import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/types";

const COOKIE_NAME = "pm_session";
const SESSION_DURATION = 4 * 60 * 60; // 4 hodiny
const DEMO_SESSION_DURATION = 2 * 60 * 60; // 2 hodiny

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET musí mít alespoň 32 znaků");
  }
  return new TextEncoder().encode(secret);
}

/** Vytvoří JWT token pro restauraci */
export async function createSession(
  restaurantId: string,
  slug: string,
  isDemo?: boolean
): Promise<string> {
  const duration = isDemo ? DEMO_SESSION_DURATION : SESSION_DURATION;
  const claims: Record<string, unknown> = { restaurantId, slug };
  if (isDemo) claims.isDemo = true;

  const token = await new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${duration}s`)
    .setIssuedAt()
    .sign(getSecret());

  return token;
}

/** Nastaví session cookie */
export async function setSessionCookie(token: string, isDemo?: boolean) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: isDemo ? DEMO_SESSION_DURATION : SESSION_DURATION,
    path: "/",
  });
}

/** Přečte a ověří session z cookie */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Smaže session cookie — se stejnými atributy jako při nastavení */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
