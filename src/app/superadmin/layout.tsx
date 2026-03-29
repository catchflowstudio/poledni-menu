import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = { title: "Superadmin — Lístek" };

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sa_token")?.value;
  const secret = process.env.SUPERADMIN_SECRET;

  // Přesměruj na login pokud není session nebo není nakonfigurováno
  if (!secret || token !== secret) {
    redirect("/superadmin/login");
  }

  return <>{children}</>;
}
