import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("serves_weekend" in body) ||
    typeof (body as Record<string, unknown>).serves_weekend !== "boolean"
  ) {
    return NextResponse.json({ error: "Neplatná hodnota" }, { status: 400 });
  }

  const { serves_weekend } = body as { serves_weekend: boolean };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("restaurants")
    .update({ serves_weekend })
    .eq("id", session.restaurantId);

  if (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Chyba při ukládání" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
