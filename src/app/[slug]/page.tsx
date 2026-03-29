import { notFound } from "next/navigation";
import { getRestaurant } from "@/lib/menu/logic";
import { MenuSection } from "@/components/public/MenuSection";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) return { title: "Nenalezeno" };

  return {
    title: `${restaurant.name} – Polední menu`,
    description: `Denní polední nabídka – ${restaurant.name}`,
  };
}

export const dynamic = "force-dynamic";

export default async function RestaurantPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) notFound();

  return (
    <main>
      {/* Header */}
      <header
        style={{
          padding: "40px 20px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          {restaurant.name}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Denní polední nabídka
        </p>
        <div
          style={{
            width: 40,
            height: 2,
            background: "var(--gold)",
            margin: "16px auto 0",
            borderRadius: 1,
          }}
        />
      </header>

      {/* Menu section */}
      <MenuSection slug={slug} />

      {/* Footer */}
      <footer
        style={{
          padding: "32px 20px",
          textAlign: "center",
          color: "var(--dim)",
          fontSize: "0.75rem",
        }}
      >
        <p>
          Polední menu · Vytvořeno s{" "}
          <a
            href="https://catchflow.cz"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--muted)" }}
          >
            Catchflow
          </a>
        </p>
      </footer>
    </main>
  );
}
