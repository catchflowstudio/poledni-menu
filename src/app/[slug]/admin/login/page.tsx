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
          maxWidth: 400,
          padding: "40px 32px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--gold-dim)",
              border: "1px solid var(--border-gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "1.2rem",
            }}
          >
            🔒
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.3rem",
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Správa menu
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            Zadejte heslo pro přístup
          </p>
        </div>

        <LoginForm slug={slug} />

        {/* Footer link */}
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid var(--border)",
          }}
        >
          <a
            href={`/${slug}`}
            className="btn-ghost"
            style={{
              fontSize: "0.8rem",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← Zpět na web restaurace
          </a>
        </div>
      </div>
    </div>
  );
}
