import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { password } = await req.json();
  const secret = process.env.SUPERADMIN_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Superadmin není nakonfigurován." }, { status: 500 });
  }

  if (password !== secret) {
    return NextResponse.json({ error: "Špatné heslo." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("sa_token", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hodin
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("sa_token");
  return NextResponse.json({ ok: true });
}
