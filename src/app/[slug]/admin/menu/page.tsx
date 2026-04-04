import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/menu/logic";
import {
  getTodayPrague,
  getTomorrowPrague,
  formatDateCzech,
  formatDateCzechShort,
  getPragueDayOfWeek,
} from "@/lib/date/prague";
import { UploadForm } from "@/components/admin/UploadForm";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { RestaurantSettings } from "@/components/admin/RestaurantSettings";
import { EmbedSnippet } from "@/components/admin/EmbedSnippet";
import { Collapsible } from "@/components/admin/Collapsible";
import { MenuStatusCard } from "@/components/admin/MenuStatusCard";

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
          <div>
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
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--muted)",
                marginTop: 2,
              }}
            >
              {formatDateCzech(todayDate)}
            </p>
          </div>
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
            marginBottom: 24,
          }}
        >
          <MenuStatusCard
            label="Dnes"
            date={todayDate}
            dateFormatted={formatDateCzechShort(todayDate)}
            imageUrl={todayMenu?.image_url ?? null}
            uploaded={todayStatus === "uploaded"}
          />
          <MenuStatusCard
            label="Zítra"
            date={tomorrowDate}
            dateFormatted={formatDateCzechShort(tomorrowDate)}
            imageUrl={tomorrowMenu?.image_url ?? null}
            uploaded={tomorrowStatus === "uploaded"}
            dimImage
          />
        </div>

        {/* Collapsible: Nastavení */}
        <Collapsible title="Nastavení" hint="Telefon, dny, zprávy">
          <RestaurantSettings
            initialValues={{
              phone: restaurant.phone,
              static_menu_url: restaurant.static_menu_url,
              fallback_type: restaurant.fallback_type,
              fallback_title: restaurant.fallback_title,
              fallback_text: restaurant.fallback_text,
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
