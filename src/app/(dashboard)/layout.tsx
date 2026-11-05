/**
 * Persora — User Console layout.
 *
 * Persistent workspace sidebar (desktop) with the 10 navigation modules.
 * Requires an authenticated session (validated against D1). Unauthenticated
 * requests are redirected to /login. Force-dynamic: user data is never
 * statically prerendered.
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
  let user: { id: string; email: string; name: string | null; role: string } | null = null;

  if (env) {
    user = await getCurrentUser(env);
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <WorkspaceShell user={user}>
      <main className="flex-1 h-full overflow-y-auto bg-workspace p-6">
        {children}
      </main>
    </WorkspaceShell>
  );
}
