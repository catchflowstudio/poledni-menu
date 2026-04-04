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
          padding: "48px 20px 16px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.8rem",
            fontWeight: 800,
            marginBottom: 6,
            letterSpacing: "-0.02em",
          }}
        >
          {restaurant.name}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
          Denní polední nabídka
        </p>
        <div
          className="divider-subtle"
          style={{ margin: "20px auto 0" }}
        />
      </header>

      {/* Menu section */}
      <MenuSection slug={slug} />

      {/* Footer */}
      <footer
        style={{
          padding: "40px 20px 24px",
          textAlign: "center",
          color: "var(--dim)",
          fontSize: "0.72rem",
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
