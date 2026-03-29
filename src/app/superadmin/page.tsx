import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SuperadminDashboard } from "@/components/admin/SuperadminDashboard";

export const dynamic = "force-dynamic";

export default async function SuperadminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sa_token")?.value;
  const secret = process.env.SUPERADMIN_SECRET;

  if (!secret || token !== secret) {
    redirect("/superadmin/login");
  }

  return <SuperadminDashboard />;
}
