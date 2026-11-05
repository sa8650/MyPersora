/**
 * Persora — Public Website layout.
 *
 * Marketing site shell (landing, about, contact, blog, privacy, terms).
 * No authentication required.
 */

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
