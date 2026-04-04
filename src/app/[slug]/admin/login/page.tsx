import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/admin/LoginForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function LoginPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();

  // Pokud už je přihlášen pro tento slug, jdi na dashboard
  if (session && session.slug === slug) {
    redirect(`/${slug}/admin/menu`);
  }

  return (
    <div className="page-center">
      <div
        className="glass-card fade-in"
        style={{
          width: "100%",
          maxWidth: 380,
          padding: "48px 36px 40px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--gold-dim)",
              border: "1px solid var(--border-gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Správa menu
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
            Zadejte heslo pro přístup do administrace
          </p>
        </div>

        <LoginForm slug={slug} />

        {/* Footer link */}
        <div
          style={{
            textAlign: "center",
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid var(--border)",
          }}
        >
          <a
            href={`/${slug}`}
            style={{
              fontSize: "0.8rem",
              color: "var(--muted)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            ← Zpět na web restaurace
          </a>
        </div>
      </div>
    </div>
  );
}
