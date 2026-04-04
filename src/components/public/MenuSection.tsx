import { getRestaurant, getPublicMenuState } from "@/lib/menu/logic";
import { formatDateCzech } from "@/lib/date/prague";
import { MenuCard } from "./MenuCard";
import { TomorrowMenuToggle } from "./TomorrowMenuToggle";

interface MenuSectionProps {
  slug: string;
}

export async function MenuSection({ slug }: MenuSectionProps) {
  const restaurant = await getRestaurant(slug);
  if (!restaurant) return null;

  const state = await getPublicMenuState(restaurant);

  // Když se dnes nevaří, celá sekce zmizí
  if (state.type === "closed_day") return null;

  return (
    <section className="section" id="denni-menu">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="badge" style={{ marginBottom: 16, display: "inline-flex" }}>
            <span style={{ fontSize: "0.7rem" }}>◆</span>
            {state.type === "menu" ? "Dnes vaříme" : "Polední menu"}
          </div>
          <h2 style={{ fontSize: "1.6rem", marginBottom: 8 }}>
            Dnešní polední nabídka
          </h2>
        </div>

        {/* Stav: menu existuje */}
        {state.type === "menu" && state.menu && (
          <div className="slide-up">
            <MenuCard
              imageUrl={state.menu.image_url}
              dateLabel={formatDateCzech(state.menu.valid_for_date)}
            />
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                marginTop: 24,
                flexWrap: "wrap",
              }}
            >
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone}`} className="btn btn-primary">
                  Zavolat
                </a>
              )}
              {restaurant.static_menu_url && (
                <a
                  href={restaurant.static_menu_url}
                  className="btn btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stálé menu
                </a>
              )}
            </div>

            {/* Zítřejší menu toggle */}
            {state.tomorrowMenu && (
              <TomorrowMenuToggle
                imageUrl={state.tomorrowMenu.image_url}
                dateLabel={formatDateCzech(state.tomorrowMenu.valid_for_date)}
              />
            )}
          </div>
        )}

        {/* Stav: pracovní den bez menu — konfigurovatelný fallback */}
        {state.type === "no_menu" && (
          <div className="glass-card slide-up" style={{ padding: "48px 28px", textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", marginBottom: 16, opacity: 0.7 }}>🍽️</div>

            {restaurant.fallback_type === "text" && (
              <>
                <p style={{ fontSize: "1rem", marginBottom: 8, lineHeight: 1.5 }}>
                  {restaurant.fallback_title}
                </p>
                <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                  {restaurant.fallback_text}
                </p>
                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="btn btn-primary"
                    style={{ marginTop: 24 }}
                  >
                    Zavolat
                  </a>
                )}
              </>
            )}

            {restaurant.fallback_type === "phone" && (
              <>
                <p style={{ fontSize: "1rem", marginBottom: 8, lineHeight: 1.5 }}>
                  Zavolejte si o dnešní nabídku
                </p>
                {restaurant.phone ? (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="btn btn-primary"
                    style={{ marginTop: 16 }}
                  >
                    {restaurant.phone}
                  </a>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                    Kontaktujte nás přímo v restauraci.
                  </p>
                )}
              </>
            )}

            {restaurant.fallback_type === "static_menu" && (
              <>
                <p style={{ fontSize: "1rem", marginBottom: 8, lineHeight: 1.5 }}>
                  Dnešní polední menu právě připravujeme
                </p>
                {restaurant.static_menu_url ? (
                  <a
                    href={restaurant.static_menu_url}
                    className="btn btn-secondary"
                    style={{ marginTop: 16 }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Zobrazit stálé menu
                  </a>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                    Zkuste to prosím později.
                  </p>
                )}
              </>
            )}

            {/* Zítřejší menu i když dnes chybí */}
            {state.tomorrowMenu && (
              <TomorrowMenuToggle
                imageUrl={state.tomorrowMenu.image_url}
                dateLabel={formatDateCzech(state.tomorrowMenu.valid_for_date)}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
