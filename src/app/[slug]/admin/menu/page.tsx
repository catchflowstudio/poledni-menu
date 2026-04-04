import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/menu/logic";
import { getTodayPrague, formatDateCzech } from "@/lib/date/prague";
import { UploadForm } from "@/components/admin/UploadForm";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { RestaurantSettings } from "@/components/admin/RestaurantSettings";
import { EmbedSnippet } from "@/components/admin/EmbedSnippet";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminDashboard({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();

  if (!session || session.slug !== slug) {
    redirect(`/${slug}/admin/login`);
  }

  const dashboard = await getDashboardData(session.restaurantId);
  if (!dashboard) redirect(`/${slug}/admin/login`);

  const { restaurant, todayStatus, tomorrowStatus, todayMenu, tomorrowMenu, lastMenu } = dashboard;
  const todayDate = getTodayPrague();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div style={{ minHeight: "100vh", padding: "20px 16px" }}>
      <div className="container" style={{ maxWidth: 540 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 0 28px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.2rem",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              {restaurant.name}
            </h1>
            <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>
              Správa poledního menu
            </p>
          </div>
          <LogoutButton slug={slug} />
        </div>

        {/* Status cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div className="glass-card" style={{ padding: "14px 18px" }}>
            <p className="section-label">Dnes</p>
            <div className="status">
              <span
                className={`status-dot ${
                  todayStatus === "uploaded" ? "status-dot--ok" : "status-dot--missing"
                }`}
              />
              <span
                style={{
                  fontSize: "0.88rem",
                  color: todayStatus === "uploaded" ? "var(--ivory)" : "var(--muted)",
                }}
              >
                {todayStatus === "uploaded" ? "Nahráno" : "Nenahráno"}
              </span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "14px 18px" }}>
            <p className="section-label">Zítra</p>
            <div className="status">
              <span
                className={`status-dot ${
                  tomorrowStatus === "uploaded" ? "status-dot--ok" : "status-dot--missing"
                }`}
              />
              <span
                style={{
                  fontSize: "0.88rem",
                  color: tomorrowStatus === "uploaded" ? "var(--ivory)" : "var(--muted)",
                }}
              >
                {tomorrowStatus === "uploaded" ? "Nahráno" : "Nenahráno"}
              </span>
            </div>
          </div>
        </div>

        {/* Dnešní menu náhled */}
        {todayMenu && (
          <div className="glass-card" style={{ padding: "20px 22px", marginBottom: 20 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>
              Dnešní menu
            </p>
            <img
              src={todayMenu.image_url}
              alt="Dnešní menu"
              style={{
                width: "100%",
                borderRadius: "var(--radius-sm)",
                marginBottom: 8,
              }}
            />
            <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              {formatDateCzech(todayMenu.valid_for_date)}
            </p>
          </div>
        )}

        {/* Zítřejší menu náhled */}
        {tomorrowMenu && (
          <div className="glass-card" style={{ padding: "20px 22px", marginBottom: 20 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>
              Zítřejší menu
            </p>
            <img
              src={tomorrowMenu.image_url}
              alt="Zítřejší menu"
              style={{
                width: "100%",
                borderRadius: "var(--radius-sm)",
                marginBottom: 8,
                opacity: 0.85,
              }}
            />
            <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              {formatDateCzech(tomorrowMenu.valid_for_date)}
            </p>
          </div>
        )}

        {/* Upload section */}
        <div className="glass-card" style={{ padding: "24px 22px", marginBottom: 20 }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.05rem",
              fontWeight: 600,
              marginBottom: 6,
              letterSpacing: "-0.01em",
            }}
          >
            Nahrát denní menu
          </h2>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--muted)",
              marginBottom: 20,
              lineHeight: 1.5,
            }}
          >
            Nahrajte fotku menu a vyberte datum platnosti.
          </p>

          <UploadForm slug={slug} todayDate={todayDate} />
        </div>

        {/* Poslední nahrané menu (jen pokud se liší od dnešního a zítřejšího) */}
        {lastMenu && lastMenu.valid_for_date !== todayMenu?.valid_for_date && lastMenu.valid_for_date !== tomorrowMenu?.valid_for_date && (
          <div className="glass-card" style={{ padding: "20px 22px", marginBottom: 20 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>
              Poslední nahrané menu
            </p>
            <img
              src={lastMenu.image_url}
              alt="Poslední menu"
              style={{
                width: "100%",
                borderRadius: "var(--radius-sm)",
                marginBottom: 10,
              }}
            />
            <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              Platí pro: {formatDateCzech(lastMenu.valid_for_date)}
            </p>
          </div>
        )}

        {/* Nastavení */}
        <div className="glass-card" style={{ padding: "24px 22px", marginBottom: 20 }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.05rem",
              fontWeight: 600,
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            Nastavení
          </h2>
          <RestaurantSettings
            initialValues={{
              name: restaurant.name,
              phone: restaurant.phone,
              static_menu_url: restaurant.static_menu_url,
              serves_weekend: restaurant.serves_weekend,
              fallback_type: restaurant.fallback_type,
              fallback_title: restaurant.fallback_title,
              fallback_text: restaurant.fallback_text,
              weekend_fallback_title: restaurant.weekend_fallback_title,
              weekend_fallback_text: restaurant.weekend_fallback_text,
              opening_days: restaurant.opening_days,
              menu_active_from: restaurant.menu_active_from,
            }}
          />
        </div>

        {/* Embed na váš web */}
        <div className="glass-card" style={{ padding: "20px 22px", marginBottom: 20 }}>
          <p className="section-label" style={{ marginBottom: 4 }}>
            Embed na váš web
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 14, lineHeight: 1.5 }}>
            Vložte tento kód na svůj web — zobrazí se tam aktuální menu.
          </p>
          <EmbedSnippet menuUrl={`${appUrl}/${slug}/menu`} />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={`/${slug}/menu`}
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, textAlign: "center", minWidth: 150 }}
          >
            Otevřít veřejné menu
          </a>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "36px 0 16px",
            color: "var(--dim)",
            fontSize: "0.7rem",
          }}
        >
          Polední menu · Catchflow
        </div>
      </div>
    </div>
  );
}
