"use client";

/**
 * Persora — public website header.
 *
 * Shared by every route in the (marketing) group, so the navigation persists
 * between public pages. Responsive: inline navigation on desktop, disclosure
 * menu on mobile.
 */

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <NextLink href="/" className="flex items-center gap-2" aria-label="Persora home">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-headline-bold">P</span>
          </span>
          <span className="text-title-2-semibold tracking-tight text-foreground">Persora</span>
        </NextLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Public navigation">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <NextLink
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-body-medium font-medium transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {link.label}
              </NextLink>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <NextLink href="/login">Sign in</NextLink>
          </Button>
          <Button size="sm" asChild>
            <NextLink href="/register">Get started</NextLink>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <NextLink
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2 text-body-medium font-medium text-foreground hover:bg-accent"
              >
                {link.label}
              </NextLink>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" asChild className="w-full">
                <NextLink href="/login">Sign in</NextLink>
              </Button>
              <Button asChild className="w-full">
                <NextLink href="/register">Get started</NextLink>
              </Button>
              <NextLink
                href="/overview"
                className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-body-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Open my workspace
              </NextLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
