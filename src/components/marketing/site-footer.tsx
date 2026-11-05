/**
 * Persora — public website footer.
 *
 * Server component: rendered once per public page by the (marketing) layout,
 * so every page in the public site shares the same footer.
 */

import NextLink from "next/link";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Overview" },
      { href: "/register", label: "Create account" },
      { href: "/login", label: "Sign in" },
      { href: "/overview", label: "Workspace" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/admin/login", label: "Administrator" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-headline-bold">P</span>
              </span>
              <span className="text-title-3-semibold tracking-tight text-foreground">Persora</span>
            </div>
            <p className="max-w-xs text-body-2-medium text-muted-foreground">
              A private personal management workspace for the many dimensions of
              everyday life — built on Cloudflare D1 and R2.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="mb-3 text-caption-2-medium font-semibold uppercase tracking-wider text-muted-foreground">
                {column.title}
              </p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <NextLink
                      href={link.href}
                      className="text-body-2-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </NextLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-caption-2-medium text-muted-foreground">
            © {year} Persora. All rights reserved.
          </p>
          <p className="text-caption-2-medium text-muted-foreground">
            Application-managed authentication · Cloudflare Workers · D1 · R2
          </p>
        </div>
      </div>
    </footer>
  );
}
