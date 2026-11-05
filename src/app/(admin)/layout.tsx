/**
 * Persora — Admin Console layout.
 *
 * Persistent admin sidebar with user/role/feature/storage/content/settings
 * management. Requires an authenticated admin session (validated against D1).
 * Force-dynamic.
 */

import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { AdminSidebar } from "@/components/layout/sidebar";
import { getEnv } from "@/lib/context";
import { requireAdmin, type PersoraUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  noStore();

  const env = getEnv();
  let user: PersoraUser | null = null;
  if (env) {
    user = await requireAdmin(env);
  }

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen w-full bg-workspace text-workspace-foreground">
      <AdminSidebar />
      <main className="flex-1 h-full overflow-y-auto bg-workspace p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-title-1-semibold text-foreground">Admin Console</h1>
            <p className="text-body-2-medium text-muted-foreground">
              Platform administration, user management and settings.
            </p>
          </div>
          <div className="flex items-center gap-2 text-right">
            <p className="text-body-medium text-muted-foreground hidden sm:block">
              {user?.email}
            </p>
            <span className="inline-flex items-center rounded-full border border-input bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {user?.role}
            </span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
