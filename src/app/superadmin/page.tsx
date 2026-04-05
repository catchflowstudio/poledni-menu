import { redirect } from "next/navigation";
import { checkSaAuth } from "@/lib/security/superadmin";
import { SuperadminDashboard } from "@/components/admin/SuperadminDashboard";

export const dynamic = "force-dynamic";

export default async function SuperadminPage() {
  const isAuth = await checkSaAuth();

  if (!isAuth) {
    redirect("/superadmin/login");
  }

  return <SuperadminDashboard />;
}
