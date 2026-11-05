/**
 * Persora — Privacy Policy (/privacy).
 *
 * Written against what the code actually does today. No certifications,
 * retention guarantees or third-party processors are claimed that are not
 * implemented in this repository.
 */

import { PageShell, Section } from "@/components/marketing/page-shell";

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      description="What Persora stores, where it is stored and what controls you have. Last updated 5 November 2026."
      breadcrumb={[{ label: "Privacy Policy" }]}
    >
      <Section title="1. Who operates this deployment">
        <p>
          Persora is an application deployed by its operator on Cloudflare Workers. This
          policy describes the behaviour of the application code in this repository; the
          operator of a given deployment is responsible for the data held in it.
        </p>
      </Section>

      <Section title="2. Data we store">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Account data:</strong> e-mail address, display name, a bcrypt password
            hash, a role (user or admin) and timestamps. Plaintext passwords are never
            stored.
          </li>
          <li>
            <strong>Sessions:</strong> a random session identifier, the owning user and an
            expiry timestamp. The identifier is held in an HTTP-only cookie.
          </li>
          <li>
            <strong>Workspace data you create:</strong> habits and habit entries, contacts,
            wallet card records, saved URLs, account records, subscriptions and purchase
            records.
          </li>
          <li>
            <strong>Sensitive fields:</strong> card numbers, CVVs and account credentials
            are encrypted with AES-GCM before being written to the database. Only the last
            four digits of a card are stored unencrypted so a card can be identified in a
            list.
          </li>
          <li>
            <strong>Contact messages:</strong> if you use the public contact form, the name,
            e-mail address, subject and message you submit are stored so an administrator
            can read and reply.
          </li>
        </ul>
      </Section>

      <Section title="3. Where data is stored">
        <p>
          Application data is stored in Cloudflare D1 (a SQLite-compatible database) and
          Cloudflare R2 (object storage) attached to the Worker. The application does not
          send your workspace data to any other service.
        </p>
        <p>
          If the operator configures a transactional e-mail provider for password recovery,
          the recipient address and the message body are transmitted to that provider for
          delivery only.
        </p>
      </Section>

      <Section title="4. Cookies">
        <p>
          Persora sets a single first-party cookie, <code className="rounded bg-secondary px-1 py-0.5 text-caption-2-medium">persora_session</code>,
          after you sign in. It is HTTP-only, SameSite=Lax, sent only over HTTPS and is
          used solely to identify your session. There are no advertising or analytics
          cookies in this codebase.
        </p>
      </Section>

      <Section title="5. What we do not do">
        <ul className="list-disc space-y-2 pl-5">
          <li>We do not sell or rent your personal data.</li>
          <li>We do not use third-party identity providers for sign-in.</li>
          <li>We do not run advertising trackers or behavioural profiling.</li>
          <li>Administrators can see account metadata and aggregate counts, not your password or card data.</li>
        </ul>
      </Section>

      <Section title="6. Your controls">
        <p>
          You can edit or delete the records you create inside each module, change your
          account details from the profile page, and sign out at any time — which revokes
          the session in the database. Self-service account deletion is not implemented
          yet; to request removal of an account, use the contact form.
        </p>
      </Section>

      <Section title="7. Administrative access">
        <p>
          Accounts with the admin role can view user accounts (e-mail, name, role,
          creation date), feature flags, platform settings, aggregate storage statistics and
          contact submissions. Sensitive stored values are never returned by the API, and
          every administrative endpoint verifies the role on the server.
        </p>
      </Section>

      <Section title="8. Changes to this policy">
        <p>
          When the storage model or the features of a deployment change, this page is
          updated in the same repository. The date at the top reflects the last change.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          Questions about this policy can be sent through the contact form on the public
          website, which stores your message for the platform administrators.
        </p>
      </Section>
    </PageShell>
  );
}
