/**
 * Persora — Terms of Service page
 */

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <nav className="mb-8 flex items-center gap-1 text-caption-2-medium text-muted-foreground">
        <span className="text-muted-foreground">Home</span>
        <span>/</span>
        <span className="text-foreground">Terms of Service</span>
      </nav>
      <h1 className="text-display-4-bold text-foreground mb-8">Terms of Service</h1>
      <p className="text-body-medium text-foreground mb-6 leading-relaxed">
        Effective date: November 3, 2026. These terms govern your use of Persora,
        the personal management platform.
      </p>
      <h2 className="text-title-2-semibold text-foreground mb-3">Acceptance of terms</h2>
      <p className="text-body-medium text-foreground mb-6 leading-relaxed">
        By creating an account or using Persora, you agree to these terms. If you
        do not agree, you may not use the service.
      </p>
      <h2 className="text-title-2-semibold text-foreground mb-3">User accounts</h2>
      <p className="text-body-medium text-foreground mb-6 leading-relaxed">
        You are responsible for maintaining the confidentiality of your account
        credentials and for all activity under your account. Authentication is
        application-managed; we do not use third-party sign-in providers.
      </p>
      <h2 className="text-title-2-semibold text-foreground mb-3">Data ownership</h2>
      <p className="text-body-medium text-foreground mb-6 leading-relaxed">
        You retain ownership of the data you enter into Persora. You may export or
        delete your data at any time through your workspace settings.
      </p>
      <h2 className="text-title-2-semibold text-foreground mb-3">Limitation of liability</h2>
      <p className="text-body-medium text-foreground mb-6 leading-relaxed">
        Persora is provided "as is" without warranties of any kind. To the extent
        permitted by law, we are not liable for indirect or consequential damages.
      </p>
    </div>
  );
}
