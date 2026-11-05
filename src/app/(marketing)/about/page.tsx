/**
 * Persora — About page
 */

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-1 text-caption-2-medium text-muted-foreground">
        <span className="text-muted-foreground">Home</span>
        <span>/</span>
        <span className="text-foreground">About</span>
      </nav>
      <h1 className="text-display-4-bold text-foreground mb-6">About Persora</h1>
      <p className="text-body-medium text-foreground mb-4 leading-relaxed max-w-3xl">
        Persora is a personal management SaaS designed for individuals who want a
        single, private workspace to organize the many dimensions of daily life —
        from habits and contacts to saved payment cards, bookmarks, accounts,
        subscriptions and purchases.
      </p>
      <p className="text-body-medium text-foreground mb-6 leading-relaxed max-w-3xl">
        The platform is built with a custom application-managed authentication
        system on Cloudflare D1, with file storage on Cloudflare R2. No
        third-party auth providers are used, and no secrets are ever committed
        to source control.
      </p>
      <h2 className="text-title-2-semibold text-foreground mb-3">Our principles</h2>
      <ul className="list-disc list-inside space-y-2 text-body-medium text-foreground max-w-3xl mb-6">
        <li>Privacy first — your data, your control.</li>
        <li>Secure by design — bcrypt hashing, encrypted credentials, signed sessions.</li>
        <li>No vendor lock-in — application-managed auth and open standards.</li>
        <li>Consistent design — the Persora ReUI design system throughout.</li>
      </ul>
    </div>
  );
}
