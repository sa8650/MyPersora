/**
 * Persora — Terms of Service (/terms).
 */

import { PageShell, Section } from "@/components/marketing/page-shell";

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Service"
      description="The terms that apply to your use of a Persora deployment. Last updated 5 November 2026."
      breadcrumb={[{ label: "Terms of Service" }]}
    >
      <Section title="1. Acceptance">
        <p>
          By creating an account or using Persora you agree to these terms. If you do not
          agree, do not use the application.
        </p>
      </Section>

      <Section title="2. Your account">
        <ul className="list-disc space-y-2 pl-5">
          <li>You must provide an accurate e-mail address and keep your password secret.</li>
          <li>You are responsible for activity performed with your session.</li>
          <li>One person per account; accounts may not be shared or resold.</li>
          <li>
            Administrator access is granted by an existing administrator. It is never
            granted automatically by registration.
          </li>
        </ul>
      </Section>

      <Section title="3. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the service to store or distribute unlawful material.</li>
          <li>Store other people&apos;s credentials or payment data without authorisation.</li>
          <li>Attempt to access another account, probe the database or bypass access controls.</li>
          <li>Interfere with the availability of the deployment, for example by automated flooding.</li>
        </ul>
      </Section>

      <Section title="4. Your content">
        <p>
          You keep ownership of the records you create. You are responsible for their
          lawfulness and accuracy. Deleting a record in a module removes it from the
          database for your account.
        </p>
      </Section>

      <Section title="5. Availability and changes">
        <p>
          Persora is provided as-is. Features may change, and modules that are documented
          as planned but not implemented are not part of the service. The operator may
          suspend a deployment for maintenance or security reasons.
        </p>
      </Section>

      <Section title="6. Security expectations">
        <p>
          Persora hashes passwords, encrypts sensitive fields and validates sessions on
          every request, but no service can guarantee absolute security. Report suspected
          vulnerabilities through the contact form rather than testing them against other
          users&apos; data.
        </p>
      </Section>

      <Section title="7. Termination">
        <p>
          You may stop using Persora at any time and sign out to revoke your session. The
          operator may suspend accounts that violate these terms or endanger the
          deployment.
        </p>
      </Section>

      <Section title="8. Liability">
        <p>
          To the extent permitted by law, the operator is not liable for indirect or
          consequential loss arising from use of the application, including loss of data
          stored in a self-managed deployment.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>Questions about these terms can be sent through the public contact form.</p>
      </Section>
    </PageShell>
  );
}
