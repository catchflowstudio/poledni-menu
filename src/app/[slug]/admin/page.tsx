import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminRedirect({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();

  if (session && session.slug === slug) {
    redirect(`/${slug}/admin/menu`);
  }

  redirect(`/${slug}/admin/login`);
}
