/**
 * Persora — Privacy Policy page
 */

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <nav className="mb-8 flex items-center gap-1 text-caption-2-medium text-muted-foreground">
        <span className="text-muted-foreground">Home</span>
        <span>/</span>
        <span className="text-foreground">Privacy Policy</span>
      </nav>
      <h1 className="text-display-4-bold text-foreground mb-8">Privacy Policy</h1>
      <p className="text-body-medium text-foreground mb-6 leading-relaxed">
        Effective date: November 3, 2026. Persora is committed to protecting your
        personal data. This policy describes what we collect, how we use it and
        your rights.
      </p>
      <h2 className="text-title-2-semibold text-foreground mb-3">Information we collect</h2>
      <ul className="list-disc list-inside space-y-2 text-body-medium text-foreground mb-6">
        <li>Account information you provide (email, name, password hash).</li>
        <li>Data you store in your workspace (habits, contacts, cards, URLs, accounts, subscriptions, purchases).</li>
        <li>Optional file uploads (avatars, receipts) stored in Cloudflare R2.</li>
      </ul>
      <h2 className="text-title-2-semibold text-foreground mb-3">How we use your data</h2>
      <p className="text-body-medium text-foreground mb-6 leading-relaxed">
        Your data is used solely to operate and improve your Persora workspace.
        We do not sell your personal data to third parties. Sensitive fields
        (payment card numbers, credentials) are encrypted at rest.
      </p>
      <h2 className="text-title-2-semibold text-foreground mb-3">Security</h2>
      <p className="text-body-medium text-foreground mb-6 leading-relaxed">
        Passwords are hashed with bcrypt. Sessions are validated against Cloudflare
        D1 and stored in secure, HTTP-only cookies. Secrets are configured only as
        Cloudflare environment variables.
      </p>
    </div>
  );
}
