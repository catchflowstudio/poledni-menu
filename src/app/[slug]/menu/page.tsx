import { notFound } from "next/navigation";
import { getRestaurant, getPublicMenuState } from "@/lib/menu/logic";
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
  const restaurant = await getRestaurant(slug);
  if (!restaurant) notFound();

  const state = await getPublicMenuState(restaurant.id, restaurant.serves_weekend);

  /* ── Menu existuje: jen fotka v poměru A4 ── */
  if (state.type === "menu" && state.menu) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "210 / 297",
          overflow: "hidden",
          lineHeight: 0,
        }}
      >
        <img
          src={state.menu.image_url}
          alt="Polední menu"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    );
  }

  /* ── Fallback: prázdný A4 obdélník s nenápadnou zprávou ── */
  const message =
    state.type === "weekend"
      ? restaurant.weekend_fallback_title
      : "Dnešní menu připravujeme";

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "210 / 297",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.85rem",
        color: "#999",
        letterSpacing: "0.05em",
      }}
    >
      {message}
    </div>
  );
}
