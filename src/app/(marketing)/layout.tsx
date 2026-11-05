/**
 * Persora — Public Website layout.
 *
 * Marketing site shell (landing, about, contact, blog, privacy, terms).
 * The header and footer are rendered here, once, so they persist across every
 * public route and never disappear during client-side navigation.
 */

import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
