"use client";

import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  slug: string;
}

export function LogoutButton({ slug }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/${slug}/admin/login`);
  }

  return (
    <button onClick={handleLogout} className="btn btn-ghost" style={{ fontSize: "0.8rem" }}>
      Odhlásit se
    </button>
  );
}
