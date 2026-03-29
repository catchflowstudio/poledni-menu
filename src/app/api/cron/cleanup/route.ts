import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/cron/cleanup
 * Maže menu záznamy a soubory starší než 60 dní.
 * Voláno automaticky Vercel Cronem každý den ve 3:00 CET.
 * Chráněno CRON_SECRET hlavičkou.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Datum před 60 dny
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const cutoffDate = cutoff.toISOString().split("T")[0]; // YYYY-MM-DD

  // Načti staré záznamy menu
  const { data: oldMenus, error: fetchError } = await supabase
    .from("menus")
    .select("id, image_path")
    .lt("valid_for_date", cutoffDate);

  if (fetchError) {
    console.error("Cleanup fetch error:", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!oldMenus || oldMenus.length === 0) {
    return NextResponse.json({ deleted: 0, message: "Nic ke smazání." });
  }

  // Smaž soubory ze Storage
  const paths = oldMenus.map((m) => m.image_path).filter(Boolean);
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("daily-menus")
      .remove(paths);

    if (storageError) {
      console.error("Storage cleanup error:", storageError);
    }
  }

  // Smaž záznamy z DB
  const ids = oldMenus.map((m) => m.id);
  const { error: deleteError } = await supabase
    .from("menus")
    .delete()
    .in("id", ids);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  console.log(`Cleanup: smazáno ${oldMenus.length} menu starších než ${cutoffDate}`);
  return NextResponse.json({ deleted: oldMenus.length, cutoffDate });
}
