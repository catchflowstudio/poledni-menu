export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  password_hash?: string;
  phone: string | null;
  static_menu_url: string | null;
  weekend_fallback_title: string;
  weekend_fallback_text: string;
  serves_weekend: boolean;
  created_at: string;
}

export interface Menu {
  id: string;
  restaurant_id: string;
  valid_for_date: string; // YYYY-MM-DD
  image_path: string;
  image_url: string;
  uploaded_at: string;
  updated_at: string;
}

export interface SessionPayload {
  restaurantId: string;
  slug: string;
  exp: number;
}

export type MenuStatus = "uploaded" | "not_uploaded";

export interface DashboardData {
  restaurant: Restaurant;
  todayStatus: MenuStatus;
  tomorrowStatus: MenuStatus;
  todayMenu: Menu | null;
  tomorrowMenu: Menu | null;
  lastMenu: Menu | null;
}
