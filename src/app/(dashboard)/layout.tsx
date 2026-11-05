/**
 * Persora — User Console layout.
 *
 * Persistent workspace sidebar (desktop) + drawer navigation (mobile).
 * Requires an authenticated session; the session is validated against D1 on
 * every request, so a deleted/expired session cannot keep rendering the
 * workspace. Unauthenticated requests are redirected to /login.
 */

import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { WorkspaceShell } from "@/components/layout/sidebar";
import { getEnv } from "@/lib/context";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  noStore();

  const env = getEnv();
  const user = env ? await getCurrentUser(env) : null;

  if (!user) {
    redirect("/login");
  }

  return <WorkspaceShell user={user}>{children}</WorkspaceShell>;
}
