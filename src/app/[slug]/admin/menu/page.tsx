import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/menu/logic";
import {
  getTodayPrague,
  getTomorrowPrague,
  formatDateCzechShort,
  getPragueDayOfWeek,
} from "@/lib/date/prague";
import { UploadForm } from "@/components/admin/UploadForm";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { RestaurantSettings } from "@/components/admin/RestaurantSettings";
import { EmbedSnippet } from "@/components/admin/EmbedSnippet";
import { Collapsible } from "@/components/admin/Collapsible";

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

  const { restaurant, todayStatus, tomorrowStatus, todayMenu, tomorrowMenu } = dashboard;
  const todayDate = getTodayPrague();
  const tomorrowDate = getTomorrowPrague();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  // Check if today is an active menu day
  const dayOfWeek = getPragueDayOfWeek();
  const openingDays = restaurant.opening_days ?? [1, 2, 3, 4, 5];
  const isActiveDay = openingDays.includes(dayOfWeek);
  const showMissingAlert = isActiveDay && todayStatus === "not_uploaded";

  return (
    <div style={{ minHeight: "100vh", padding: "20px 16px" }}>
      <div className="container" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 0 20px",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.15rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {restaurant.name}
          </h1>
          <LogoutButton slug={slug} />
        </div>

        {/* Missing menu alert */}
        {showMissingAlert && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#f59e0b", flexShrink: 0,
            }} />
            <p style={{ fontSize: "0.88rem", color: "#fbbf24", fontWeight: 500 }}>
              Dnes ještě nemáte nahrané menu
            </p>
          </div>
        )}

        {/* Upload — main action */}
        <div className="glass-card" style={{ padding: "22px 20px", marginBottom: 16 }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.02rem",
              fontWeight: 600,
              marginBottom: 16,
              letterSpacing: "-0.01em",
            }}
          >
            Nahrát menu
          </h2>
          <UploadForm slug={slug} todayDate={todayDate} tomorrowDate={tomorrowDate} />
        </div>

        {/* Status: Dnes + Zítra */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {/* Dnes */}
          <div className="glass-card" style={{ padding: "16px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: todayStatus === "uploaded" ? "#22c55e" : "rgba(245,158,11,0.6)",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
                Dnes
              </span>
            </div>
            <p style={{
              fontSize: "0.88rem",
              fontWeight: 500,
              color: todayStatus === "uploaded" ? "var(--ivory)" : "var(--muted)",
              marginBottom: todayMenu ? 10 : 0,
            }}>
              {todayStatus === "uploaded" ? "Nahráno" : "Chybí"}
            </p>
            {todayMenu && (
              <>
                <img
                  src={todayMenu.image_url}
                  alt="Dnešní menu"
                  style={{
                    width: "100%",
                    borderRadius: 4,
                    marginBottom: 6,
                  }}
                />
                <p style={{ fontSize: "0.72rem", color: "var(--dim)" }}>
                  {formatDateCzechShort(todayMenu.valid_for_date)}
                </p>
              </>
            )}
          </div>

          {/* Zítra */}
          <div className="glass-card" style={{ padding: "16px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: tomorrowStatus === "uploaded" ? "#22c55e" : "rgba(248,250,252,0.2)",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
                Zítra
              </span>
            </div>
            <p style={{
              fontSize: "0.88rem",
              fontWeight: 500,
              color: tomorrowStatus === "uploaded" ? "var(--ivory)" : "var(--muted)",
              marginBottom: tomorrowMenu ? 10 : 0,
            }}>
              {tomorrowStatus === "uploaded" ? "Nahráno" : "—"}
            </p>
            {tomorrowMenu && (
              <>
                <img
                  src={tomorrowMenu.image_url}
                  alt="Zítřejší menu"
                  style={{
                    width: "100%",
                    borderRadius: 4,
                    marginBottom: 6,
                    opacity: 0.85,
                  }}
                />
                <p style={{ fontSize: "0.72rem", color: "var(--dim)" }}>
                  {formatDateCzechShort(tomorrowMenu.valid_for_date)}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Quick link */}
        <a
          href={`/${slug}/menu`}
          className="btn btn-ghost"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            width: "100%",
            marginBottom: 24,
            fontSize: "0.85rem",
          }}
        >
          Zobrazit veřejné menu
        </a>

        {/* Collapsible: Nastavení */}
        <Collapsible title="Nastavení" hint="Název, dny, fallback zprávy">
          <RestaurantSettings
            initialValues={{
              name: restaurant.name,
              phone: restaurant.phone,
              static_menu_url: restaurant.static_menu_url,
              fallback_type: restaurant.fallback_type,
              fallback_title: restaurant.fallback_title,
              fallback_text: restaurant.fallback_text,
              weekend_fallback_title: restaurant.weekend_fallback_title,
              weekend_fallback_text: restaurant.weekend_fallback_text,
              opening_days: restaurant.opening_days,
              menu_active_from: restaurant.menu_active_from,
            }}
          />
        </Collapsible>

        {/* Collapsible: Embed */}
        <Collapsible title="Vložení na web" hint="Toto obvykle nastavuje správce webu">
          <EmbedSnippet menuUrl={`${appUrl}/${slug}/menu`} />
        </Collapsible>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "28px 0 16px",
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
