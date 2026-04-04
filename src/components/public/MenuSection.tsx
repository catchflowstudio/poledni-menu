import { getRestaurant, getPublicMenuState } from "@/lib/menu/logic";
import { formatDateCzech } from "@/lib/date/prague";
import { MenuCard } from "./MenuCard";

interface MenuSectionProps {
  slug: string;
}

export async function MenuSection({ slug }: MenuSectionProps) {
  const restaurant = await getRestaurant(slug);
  if (!restaurant) return null;

  const state = await getPublicMenuState(restaurant.id, restaurant.serves_weekend);

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
                  📞 Zavolat
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
          </div>
        )}

        {/* Stav: pracovní den bez menu */}
        {state.type === "no_menu" && (
          <div className="glass-card slide-up" style={{ padding: "48px 28px", textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", marginBottom: 16, opacity: 0.7 }}>🍽️</div>
            <p style={{ fontSize: "1rem", marginBottom: 8, lineHeight: 1.5 }}>
              Dnešní menu právě připravujeme.
            </p>
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.5 }}>
              Zkuste to prosím později nebo nám zavolejte.
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
          </div>
        )}

        {/* Stav: víkend */}
        {state.type === "weekend" && (
          <div className="glass-card slide-up" style={{ padding: "48px 28px", textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", marginBottom: 16, opacity: 0.7 }}>☀️</div>
            <p style={{ fontSize: "1rem", marginBottom: 8, lineHeight: 1.5 }}>
              {restaurant.weekend_fallback_title}
            </p>
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.5 }}>
              {restaurant.weekend_fallback_text}
            </p>
            {restaurant.static_menu_url && (
              <a
                href={restaurant.static_menu_url}
                className="btn btn-secondary"
                style={{ marginTop: 24 }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Zobrazit stálé menu
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
