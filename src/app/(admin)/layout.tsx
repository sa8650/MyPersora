/**
 * Persora — Admin Console layout.
 *
 * Server-side, role-based authorization for every /admin* route:
 *   - no session            → redirect to /admin/login
 *   - session but not admin → redirect to /overview (no 500, no leak)
 *
 * The role check is repeated in every /api/admin/* handler through
 * `withAdmin()`, so hiding the navigation link is never the only protection.
 */

import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { AdminShell } from "@/components/layout/sidebar";
import { getEnv } from "@/lib/context";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  noStore();

  const env = getEnv();
  const user = env ? await getCurrentUser(env) : null;

  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "admin") {
    redirect("/overview?error=forbidden");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
