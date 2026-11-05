/**
 * Persora — consistent container for public content pages.
 *
 * Provides the shared page width, breadcrumb and title/description block used
 * by About, Blog, Contact, Privacy and Terms.
 */

import * as React from "react";
import NextLink from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-caption-2-medium text-muted-foreground">
        <li>
          <NextLink href="/" className="hover:text-foreground">
            Home
          </NextLink>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {item.href ? (
              <NextLink href={item.href} className="hover:text-foreground">
                {item.label}
              </NextLink>
            ) : (
              <span className="text-foreground" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageShell({
  title,
  description,
  breadcrumb,
  width = "content",
  children,
}: {
  title: string;
  description?: string;
  breadcrumb?: { href?: string; label: string }[];
  width?: "content" | "wide";
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className={width === "wide" ? "mx-auto max-w-6xl" : "mx-auto max-w-3xl"}>
        {breadcrumb && <Breadcrumbs items={breadcrumb} />}
        <header className="mb-8">
          <h1 className="text-display-4-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="mt-3 max-w-2xl text-body-medium leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}

/** Prose block used inside legal / informational pages. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-title-3-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-body-medium leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}
