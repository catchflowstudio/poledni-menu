import { getSupabasePublic } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getTodayPrague,
  getTomorrowPrague,
  getPragueDayOfWeek,
  getTomorrowDayOfWeek,
  isPastTimePrague,
} from "@/lib/date/prague";
import type { Menu, Restaurant, DashboardData } from "@/types";

/** Sloupce restaurace bez password_hash */
const RESTAURANT_COLS =
  "id, slug, name, phone, static_menu_url, weekend_fallback_title, weekend_fallback_text, serves_weekend, fallback_type, fallback_title, fallback_text, opening_days, menu_active_from, created_at";

/** Najde restauraci podle slugu (bez password_hash) */
export async function getRestaurant(
  slug: string
): Promise<Restaurant | null> {
  const supabase = getSupabasePublic();
  const { data } = await supabase
    .from("restaurants")
    .select(RESTAURANT_COLS)
    .eq("slug", slug)
    .single();
  return data as Restaurant | null;
}

/**
 * Vrátí menu pro konkrétní datum a restauraci.
 * Podporuje date range: najde menu kde datum spadá do valid_for_date..valid_to_date.
 */
export async function getMenuForDate(
  restaurantId: string,
  date: string
): Promise<Menu | null> {
  const supabase = getSupabasePublic();

  // Nejdřív zkus přesný match (nejčastější případ)
  const { data: exact } = await supabase
    .from("menus")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("valid_for_date", date)
    .single();

  if (exact) return exact;

  // Pokud ne, zkus date range (valid_for_date <= date <= valid_to_date)
  const { data: range } = await supabase
    .from("menus")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .lte("valid_for_date", date)
    .gte("valid_to_date", date)
    .order("valid_for_date", { ascending: false })
    .limit(1)
    .single();

  return range ?? null;
}

/** Vrátí dnešní menu pro veřejnou část */
export async function getTodayMenu(
  restaurantId: string
): Promise<Menu | null> {
  const today = getTodayPrague();
  return getMenuForDate(restaurantId, today);
}

/** Vrátí zítřejší menu */
export async function getTomorrowMenu(
  restaurantId: string
): Promise<Menu | null> {
  const tomorrow = getTomorrowPrague();
  return getMenuForDate(restaurantId, tomorrow);
}

/**
 * Určí stav zobrazení pro veřejnou část.
 * Respektuje opening_days a menu_active_from.
 *
 * menu_active_from logika:
 *   "18:00" = po 18:00 se zobrazí zítřejší menu (pro restaurace co nahrávají den předem)
 *   "00:00" = menu se zobrazí od půlnoci (výchozí)
 *   "08:00" = menu se zobrazí od 8:00 ráno
 */
export async function getPublicMenuState(
  restaurant: Restaurant
): Promise<{
  type: "menu" | "closed_day" | "no_menu";
  menu: Menu | null;
  tomorrowMenu: Menu | null;
  menuDate: string; // YYYY-MM-DD — na který den se menu vztahuje
}> {
  const openingDays = restaurant.opening_days ?? [1, 2, 3, 4, 5];
  const activeFrom = restaurant.menu_active_from ?? "00:00";
  const today = getTodayPrague();
  const tomorrow = getTomorrowPrague();

  // Speciální případ: "18:00" znamená "od 18:00 předchozího dne"
  // → po 18:00 se cílový den posouvá na zítřek
  if (activeFrom === "18:00" && isPastTimePrague("18:00")) {
    const tomorrowDayOfWeek = getTomorrowDayOfWeek();

    if (!openingDays.includes(tomorrowDayOfWeek)) {
      return { type: "closed_day", menu: null, tomorrowMenu: null, menuDate: tomorrow };
    }

    const menu = await getMenuForDate(restaurant.id, tomorrow);
    if (menu) {
      return { type: "menu", menu, tomorrowMenu: null, menuDate: tomorrow };
    }
    return { type: "no_menu", menu: null, tomorrowMenu: null, menuDate: tomorrow };
  }

  // Standardní logika: cílový den = dnes
  const dayOfWeek = getPragueDayOfWeek();

  if (!openingDays.includes(dayOfWeek)) {
    const tomorrowMenu = await getTomorrowMenu(restaurant.id);
    return { type: "closed_day", menu: null, tomorrowMenu, menuDate: today };
  }

  // Zkontroluj menu_active_from — pokud ještě nenastal čas (08:00 apod.)
  if (activeFrom !== "00:00" && activeFrom !== "18:00" && !isPastTimePrague(activeFrom)) {
    const tomorrowMenu = await getTomorrowMenu(restaurant.id);
    return { type: "no_menu", menu: null, tomorrowMenu, menuDate: today };
  }

  const menu = await getTodayMenu(restaurant.id);
  const tomorrowMenu = await getTomorrowMenu(restaurant.id);

  if (menu) {
    return { type: "menu", menu, tomorrowMenu, menuDate: today };
  }

  return { type: "no_menu", menu: null, tomorrowMenu, menuDate: today };
}

/** Vrátí data pro admin dashboard */
export async function getDashboardData(
  restaurantId: string
): Promise<DashboardData | null> {
  const supabase = getSupabasePublic();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select(RESTAURANT_COLS)
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
  imageBuffer: Buffer,
  validToDate?: string
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

  // Cache bust URL
  const imageUrl = `${publicUrl}?v=${date}`;

  // Upsert záznam v DB
  const { error: dbError } = await supabase.from("menus").upsert(
    {
      restaurant_id: restaurantId,
      valid_for_date: date,
      valid_to_date: validToDate || null,
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
