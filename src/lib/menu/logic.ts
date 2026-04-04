import { getSupabasePublic } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getTodayPrague,
  getTomorrowPrague,
  isWeekendPrague,
} from "@/lib/date/prague";
import type { Menu, Restaurant, DashboardData, MenuStatus } from "@/types";

/** Najde restauraci podle slugu (bez password_hash) */
export async function getRestaurant(
  slug: string
): Promise<Restaurant | null> {
  const supabase = getSupabasePublic();
  const { data } = await supabase
    .from("restaurants")
    .select("id, slug, name, phone, static_menu_url, weekend_fallback_title, weekend_fallback_text, serves_weekend, created_at")
    .eq("slug", slug)
    .single();
  return data as Restaurant | null;
}

/** Vrátí menu pro konkrétní datum a restauraci */
export async function getMenuForDate(
  restaurantId: string,
  date: string
): Promise<Menu | null> {
  const supabase = getSupabasePublic();
  const { data } = await supabase
    .from("menus")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("valid_for_date", date)
    .single();
  return data;
}

/** Vrátí dnešní menu pro veřejnou část */
export async function getTodayMenu(
  restaurantId: string
): Promise<Menu | null> {
  const today = getTodayPrague();
  return getMenuForDate(restaurantId, today);
}

/**
 * Určí stav zobrazení pro veřejnou část.
 * Pokud servesWeekend=true, zobrazí menu i o víkendu.
 */
export async function getPublicMenuState(
  restaurantId: string,
  servesWeekend: boolean = false
): Promise<{
  type: "menu" | "weekend" | "no_menu";
  menu: Menu | null;
}> {
  if (isWeekendPrague() && !servesWeekend) {
    return { type: "weekend", menu: null };
  }

  const menu = await getTodayMenu(restaurantId);
  if (menu) {
    return { type: "menu", menu };
  }

  return { type: "no_menu", menu: null };
}

/** Vrátí data pro admin dashboard */
export async function getDashboardData(
  restaurantId: string
): Promise<DashboardData | null> {
  const supabase = getSupabasePublic();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, slug, name, phone, static_menu_url, weekend_fallback_title, weekend_fallback_text, serves_weekend, created_at")
    .eq("id", restaurantId)
    .single();

  if (!restaurant) return null;

  const typedRestaurant = restaurant as Restaurant;
  const today = getTodayPrague();
  const tomorrow = getTomorrowPrague();

  const [todayMenu, tomorrowMenu, lastMenu] = await Promise.all([
    getMenuForDate(restaurantId, today),
    getMenuForDate(restaurantId, tomorrow),
    getLastUploadedMenu(restaurantId),
  ]);

  return {
    restaurant: typedRestaurant,
    todayStatus: todayMenu ? "uploaded" : "not_uploaded",
    tomorrowStatus: tomorrowMenu ? "uploaded" : "not_uploaded",
    todayMenu,
    tomorrowMenu,
    lastMenu,
  };
}

/** Vrátí poslední nahrané menu (bez ohledu na datum) */
async function getLastUploadedMenu(
  restaurantId: string
): Promise<Menu | null> {
  const supabase = getSupabasePublic();
  const { data } = await supabase
    .from("menus")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

/**
 * Nahraje menu obrázek a uloží/aktualizuje záznam.
 * Pokud pro dané datum menu existuje, nahradí ho.
 */
export async function uploadMenu(
  restaurantId: string,
  slug: string,
  date: string,
  imageBuffer: Buffer
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();

  const imagePath = `${slug}/${date}.webp`;

  // Upload do Storage (upsert = nahradí existující)
  const { error: uploadError } = await supabase.storage
    .from("daily-menus")
    .upload(imagePath, imageBuffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return { success: false, error: "Nepodařilo se nahrát obrázek." };
  }

  // Získat veřejné URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("daily-menus").getPublicUrl(imagePath);

  // Cache bust URL — použijeme datum místo timestamp, aby byl URL stabilní
  const imageUrl = `${publicUrl}?v=${date}`;

  // Upsert záznam v DB
  const { error: dbError } = await supabase.from("menus").upsert(
    {
      restaurant_id: restaurantId,
      valid_for_date: date,
      image_path: imagePath,
      image_url: imageUrl,
      uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "restaurant_id,valid_for_date",
    }
  );

  if (dbError) {
    console.error("DB upsert error:", dbError);
    return { success: false, error: "Nepodařilo se uložit záznam menu." };
  }

  return { success: true };
}
