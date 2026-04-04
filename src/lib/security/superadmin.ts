import { createHmac } from "crypto";
import { safeCompare } from "@/lib/security/timing";
import { cookies } from "next/headers";

const SA_COOKIE = "sa_token";
const SA_MAX_AGE = 60 * 60 * 8; // 8 hodin

/** Vytvoří HMAC token ze secretu — v cookie nikdy neukládáme raw secret */
export function createSaToken(secret: string): string {
  return createHmac("sha256", secret).update("superadmin-session").digest("hex");
}

/** Ověří sa_token cookie proti HMAC */
export function verifySaToken(token: string, secret: string): boolean {
  const expected = createSaToken(secret);
  return safeCompare(token, expected);
}

/** Nastaví superadmin cookie s HMAC tokenem */
export async function setSaCookie(secret: string) {
  const token = createSaToken(secret);
  const cookieStore = await cookies();
  cookieStore.set(SA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SA_MAX_AGE,
    path: "/",
  });
}

/** Ověří superadmin session z cookie */
export async function checkSaAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SA_COOKIE)?.value;
  const secret = process.env.SUPERADMIN_SECRET;
  if (!secret || !token) return false;
  return verifySaToken(token, secret);
}
