"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Activity,
  Users,
  CreditCard,
  Link as LinkIcon,
  Banknote,
  Tag,
  ShoppingCart,
  User as UserIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Database,
  FileText,
  ListChecks,
  ArrowLeftRight,
  ExternalLink,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ShellUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  description?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

/* -------------------------------------------------------------------------- */
/*  User workspace navigation                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Navigation groups for the user workspace. Every href below maps to a route
 * that exists in `src/app/(dashboard)/` — keep them in sync when adding a
 * module (route groups do not add a URL segment, so `(dashboard)/wallet`
 * is served at `/wallet`, not `/dashboard/wallet`).
 */
export const USER_NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/overview", label: "Overview", icon: LayoutDashboard },
      { href: "/profile", label: "Profiles & Settings", icon: UserIcon },
    ],
  },
  {
    label: "Personal",
    items: [
      { href: "/habit-tracker", label: "Habit Tracker", icon: Activity },
      { href: "/contacts", label: "Contacts Manager", icon: Users },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/wallet", label: "Wallet Cards", icon: CreditCard },
      { href: "/accounts", label: "Accounts Manager", icon: Banknote },
      { href: "/subscriptions", label: "Subscriptions", icon: Tag },
      { href: "/purchases", label: "Purchases & Warranty", icon: ShoppingCart },
    ],
  },
  {
    label: "Bookmarks",
    items: [{ href: "/urls", label: "URL Manager", icon: LinkIcon }],
  },
];

/* -------------------------------------------------------------------------- */
/*  Admin console navigation                                                  */
/* -------------------------------------------------------------------------- */

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Administration",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/users", label: "User Management", icon: Users },
      { href: "/admin/roles", label: "Roles & Access", icon: Shield },
      { href: "/admin/features", label: "Features & Modules", icon: ListChecks },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/storage", label: "Database & R2 Storage", icon: Database },
      { href: "/admin/content", label: "Public Website", icon: FileText },
      { href: "/admin/settings", label: "Platform Settings", icon: Settings },
    ],
  },
];

/** Flat list kept for backwards compatibility with older imports. */
export const ADMIN_NAV_ITEMS: NavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
export const USER_NAV_ITEMS: NavItem[] = USER_NAV_GROUPS.flatMap((g) => g.items);

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/overview") return pathname === "/overview";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* -------------------------------------------------------------------------- */
/*  Shared shell pieces                                                       */
/* -------------------------------------------------------------------------- */

function Brand({ badge, label, homeHref }: { badge: string; label: string; homeHref: string }) {
  return (
    <NextLink
      href={homeHref}
      className="flex items-center gap-2 h-14 px-5 border-b border-border shrink-0"
      aria-label={`${label} home`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <span className="text-headline-bold">{badge}</span>
      </span>
      <span className="text-title-2-semibold tracking-tight">{label}</span>
    </NextLink>
  );
}

function NavList({ groups, pathname }: { groups: NavGroup[]; pathname: string }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Main navigation">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </NextLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function UserCard({
  user,
  onLogout,
  extra,
}: {
  user: ShellUser | null | undefined;
  onLogout: () => void;
  extra?: React.ReactNode;
}) {
  if (!user) {
    return (
      <div className="p-4 border-t border-border">
        <Button asChild variant="outline" size="sm" className="w-full">
          <NextLink href="/login">Sign in</NextLink>
        </Button>
      </div>
    );
  }

  const name = user.name?.trim() || user.email || "Account";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="p-3 border-t border-border space-y-2">
      {extra}
      <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-body-medium font-semibold">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-body-medium font-medium">{name}</p>
          {user.email && (
            <p className="truncate text-caption-2-medium text-muted-foreground">{user.email}</p>
          )}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onLogout} className="w-full justify-start">
        <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
        Logout
      </Button>
    </div>
  );
}

function useLogout() {
  const router = useRouter();
  return React.useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors; still navigate away from the workspace.
    }
    router.replace("/login");
    router.refresh();

  }, [router]);
}

function ShellFrame({
  user,
  children,
  groups,
  brand,
  footerExtra,
  mobileTitle,
  desktopOffset = "lg:pl-64",
}: {
  user: ShellUser | null | undefined;
  children: React.ReactNode;
  groups: NavGroup[];
  brand: { badge: string; label: string; homeHref: string };
  footerExtra?: React.ReactNode;
  mobileTitle: string;
  desktopOffset?: string;
}) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = React.useState(false);
  const handleLogout = useLogout();

  // Close the mobile drawer whenever the route changes.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full bg-workspace text-workspace-foreground">
      {/* Mobile top bar */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-sidebar px-3 text-sidebar-foreground">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-body-medium font-semibold">{mobileTitle}</span>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-sidebar text-sidebar-foreground shadow-xl">
            <div className="flex items-center justify-between border-b border-border pr-2">
              <Brand {...brand} />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close navigation">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavList groups={groups} pathname={pathname} />
            <UserCard user={user} onLogout={handleLogout} extra={footerExtra} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
        <Brand {...brand} />
        <NavList groups={groups} pathname={pathname} />
        <UserCard user={user} onLogout={handleLogout} extra={footerExtra} />
      </aside>

      {/* Content */}
      <div className={cn("flex-1 min-w-0 pt-14 lg:pt-0", desktopOffset)}>
        <main className="mx-auto h-full w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Public shells                                                             */
/* -------------------------------------------------------------------------- */

export function WorkspaceShell({
  children,
  user,
  className,
}: {
  children: React.ReactNode;
  user?: ShellUser | null;
  className?: string;
}) {
  const isAdmin = user?.role === "admin";
  return (
    <ShellFrame
      user={user}
      groups={USER_NAV_GROUPS}
      brand={{ badge: "P", label: "Persora", homeHref: "/overview" }}
      mobileTitle="Persora"
      footerExtra={
        isAdmin ? (
          <NextLink
            href="/admin"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-body-medium font-medium text-primary hover:bg-accent"
          >
            <Shield className="h-4 w-4" aria-hidden="true" />
            Admin console
            <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          </NextLink>
        ) : null
      }
      {...{}}
    >
      <div className={className}>{children}</div>
    </ShellFrame>
  );
}

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: ShellUser | null;
}) {
  return (
    <ShellFrame
      user={user}
      groups={ADMIN_NAV_GROUPS}
      brand={{ badge: "A", label: "Persora Admin", homeHref: "/admin" }}
      mobileTitle="Persora Admin"
      footerExtra={
        <NextLink
          href="/overview"
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-body-medium font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Back to workspace
        </NextLink>
      }
    >
      {children}
    </ShellFrame>
  );
}

/** @deprecated use WorkspaceShell */
export const Sidebar = WorkspaceShell;
/** @deprecated use AdminShell */
export const AdminSidebar = AdminShell;
