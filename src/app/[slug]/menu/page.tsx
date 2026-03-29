import { notFound } from "next/navigation";
import { getRestaurant, getPublicMenuState } from "@/lib/menu/logic";
import { formatDateCzech } from "@/lib/date/prague";
import { MenuCard } from "@/components/public/MenuCard";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) return { title: "Nenalezeno" };

  return {
    title: `Menu – ${restaurant.name}`,
    description: `Aktuální denní polední menu – ${restaurant.name}`,
  };
}

export const dynamic = "force-dynamic";

export default async function MenuPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) notFound();

  const state = await getPublicMenuState(restaurant.id, restaurant.serves_weekend);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Compact header */}
      <header
        style={{
          padding: "24px 20px 16px",
          textAlign: "center",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.3rem",
            fontWeight: 700,
          }}
        >
          {restaurant.name}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 4 }}>
          Denní polední nabídka
        </p>
      </header>

      {/* Content */}
      <div
        className="container"
        style={{ flex: 1, paddingTop: 24, paddingBottom: 24 }}
      >
        {/* Menu existuje */}
        {state.type === "menu" && state.menu && (
          <div className="slide-up">
            <MenuCard
              imageUrl={state.menu.image_url}
              dateLabel={formatDateCzech(state.menu.valid_for_date)}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 20,
              }}
            >
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  📞 Zavolat a objednat
                </a>
              )}
              {restaurant.static_menu_url && (
                <a
                  href={restaurant.static_menu_url}
                  className="btn btn-secondary"
                  style={{ width: "100%" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zobrazit stálé menu
                </a>
              )}
            </div>
          </div>
        )}

        {/* Pracovní den bez menu */}
        {state.type === "no_menu" && (
          <div
            className="glass-card slide-up"
            style={{ padding: "48px 24px", textAlign: "center" }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: 20 }}>🍽️</div>
            <h2 style={{ fontSize: "1.2rem", marginBottom: 12 }}>
              Dnešní menu právě připravujeme
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              Zkuste to prosím později nebo nám zavolejte.
            </p>
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                📞 Zavolat
              </a>
            )}
          </div>
        )}

        {/* Víkend */}
        {state.type === "weekend" && (
          <div
            className="glass-card slide-up"
            style={{ padding: "48px 24px", textAlign: "center" }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: 20 }}>☀️</div>
            <h2 style={{ fontSize: "1.2rem", marginBottom: 12 }}>
              {restaurant.weekend_fallback_title}
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              {restaurant.weekend_fallback_text}
            </p>
            {restaurant.static_menu_url && (
              <a
                href={restaurant.static_menu_url}
                className="btn btn-secondary"
                style={{ width: "100%" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Zobrazit stálé menu
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: "20px",
          textAlign: "center",
          color: "var(--dim)",
          fontSize: "0.7rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        Polední menu ·{" "}
        <a
          href="https://catchflow.cz"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--muted)" }}
        >
          Catchflow
        </a>
      </footer>
    </main>
  );
}
