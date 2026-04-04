import { notFound } from "next/navigation";
import { getRestaurant, getPublicMenuState } from "@/lib/menu/logic";
import { MenuImage } from "@/components/public/MenuImage";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) return { title: "Nenalezeno" };
  return { title: `Menu – ${restaurant.name}` };
}

export const dynamic = "force-dynamic";

export default async function MenuPage({ params }: Props) {
  const { slug } = await params;

  let restaurant;
  let state;

  try {
    restaurant = await getRestaurant(slug);
    if (!restaurant) notFound();
    state = await getPublicMenuState(restaurant);
  } catch {
    // Supabase nebo síťová chyba — zobraz neutrální fallback
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "210 / 297",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "24px 32px",
            borderRadius: 4,
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,0,0,0.08)",
            maxWidth: "80%",
          }}
        >
          <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: 6 }}>
            Menu není momentálně dostupné
          </p>
          <p style={{ fontSize: "0.78rem", color: "#999" }}>
            Zkuste to prosím za chvíli nebo zavolejte přímo do restaurace.
          </p>
        </div>
      </div>
    );
  }

  /* ── Menu existuje: fotka v A4 rámci + lightbox ── */
  if (state.type === "menu" && state.menu) {
    return <MenuImage src={state.menu.image_url} />;
  }

  /* ── Zavřený den → prázdný iframe (sekce zmizí) ── */
  if (state.type === "closed_day") {
    return <div style={{ display: "none" }} />;
  }

  /* ── Fallback: aktivní den, menu chybí ── */
  let message: string;
  let detail: string;

  if (restaurant.fallback_type === "phone" && restaurant.phone) {
    message = "Zavolejte si o dnešní nabídku";
    detail = restaurant.phone;
  } else if (restaurant.fallback_type === "static_menu" && restaurant.static_menu_url) {
    message = "Podívejte se na naše stálé menu";
    detail = restaurant.static_menu_url;
  } else {
    message = restaurant.fallback_title;
    detail = restaurant.fallback_text;
  }

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "210 / 297",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "24px 32px",
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 2px 16px rgba(0, 0, 0, 0.06)",
          maxWidth: "80%",
        }}
      >
        <p
          style={{
            fontSize: "0.95rem",
            fontWeight: 500,
            color: "#1a1a1a",
            marginBottom: 6,
            letterSpacing: "0.01em",
          }}
        >
          {message}
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "#666",
            lineHeight: 1.5,
          }}
        >
          {detail}
        </p>
      </div>
    </div>
  );
}
