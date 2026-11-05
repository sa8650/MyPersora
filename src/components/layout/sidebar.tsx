"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Activity,
  Users,
  CreditCard,
  Link as LinkIcon,
  Banknote,
  RefreshCcw,
  Tag,
  ShoppingCart,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/habit-tracker", label: "Habit Tracker", icon: Activity },
  { href: "/dashboard/contacts", label: "Contacts Manager", icon: Users },
  { href: "/dashboard/wallet", label: "Wallet Cards", icon: CreditCard },
  { href: "/dashboard/urls", label: "URL Manager", icon: LinkIcon },
  { href: "/dashboard/accounts", label: "Account Manager", icon: Banknote },
  { href: "/dashboard/subscriptions", label: "Subscription Manager", icon: Tag },
  { href: "/dashboard/purchases", label: "Purchases & Warranty", icon: ShoppingCart },
  { href: "/dashboard/profile", label: "Profile & Settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
  user?: { name?: string | null; email?: string | null; role?: string | null } | null;
}

export function Sidebar({
  className,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors; still navigate to login.
    }
    router.replace("/login");
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 h-full w-64 bg-sidebar text-sidebar-foreground border-r border-border transition-all duration-300 shadow-lg",
        "-translate-x-full sm:translate-x-0",
        className,
      )}
      aria-label="Workspace navigation"
    >
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex items-center gap-2 h-12 px-6 border-b border-border">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-headline-bold">P</span>
          </div>
          <span className="text-title-2-semibold tracking-tight">Persora</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <NextLink
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </NextLink>
            );
          })}
        </nav>

        {/* Footer: user + logout */}
        <div className="p-4 border-t border-border">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden">
                  {user.name ? (
                    <span className="flex h-full w-full items-center justify-center text-body-medium font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-body-medium">
                      U
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-body-medium font-medium truncate">{user.name}</p>
                  {user.email && (
                    <p className="text-caption-2-medium text-muted-foreground truncate">{user.email}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

/**
 * Desktop-only persistent sidebar wrapper. Mobile handling is delegated to
 * the shell layout which renders a bottom sheet / drawer for small viewports.
 */
export function WorkspaceShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: { name?: string | null; email?: string | null; role?: string | null } | null;
}) {
  return (
    <div className="flex h-screen w-full bg-workspace text-workspace-foreground">
      <Sidebar user={user} />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

/**
 * Admin Console navigation items.
 */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/roles", label: "Roles & Access", icon: ShieldIcon },
  { href: "/admin/features", label: "Features & Modules", icon: Activity },
  { href: "/admin/storage", label: "Database & R2 Storage", icon: DatabaseIcon },
  { href: "/admin/content", label: "Public Website Content", icon: FileTextIcon },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
  );
}
function DatabaseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="22" height="12" x="1" y="10" rx="2" ry="2"/><path d="M1 14h22"/><path d="M4 18h16"/><path d="M1 10h22"/><path d="M4 14h16"/></svg>
  );
}
function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 16 15 16 9"/></svg>
  );
}

export function AdminSidebar({ className, onLogout }: { className?: string; onLogout?: () => void }) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 h-full w-64 bg-sidebar text-sidebar-foreground border-r border-border transition-all duration-300 shadow-lg",
        "-translate-x-full sm:translate-x-0",
        className,
      )}
      aria-label="Admin navigation"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 h-12 px-6 border-b border-border">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-headline-bold">A</span>
          </div>
          <span className="text-title-2-semibold tracking-tight">Persora Admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <NextLink
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </NextLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onLogout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
