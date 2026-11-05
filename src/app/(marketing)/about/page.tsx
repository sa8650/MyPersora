/**
 * Persora — About page (/about).
 */

import Link from "next/link";
import { PageShell, Section } from "@/components/marketing/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Database, Server, Layers } from "lucide-react";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Application-managed auth",
    desc: "Accounts, passwords and sessions are handled by Persora itself — bcrypt hashes, HTTP-only cookies and a session row validated on every request.",
  },
  {
    icon: Database,
    title: "Cloudflare D1",
    desc: "Every module stores rows tagged with your user id, and each query is filtered by that id, so workspaces stay isolated from each other.",
  },
  {
    icon: Server,
    title: "Cloudflare R2",
    desc: "Uploads such as avatars and receipts belong in R2 object storage rather than the relational database.",
  },
  {
    icon: Layers,
    title: "One design system",
    desc: "Public site, user workspace and admin console share the same typography scale, spacing, cards, buttons and form controls.",
  },
];

export default function AboutPage() {
  return (
    <PageShell
      title="About Persora"
      description="Persora is a personal management platform: one private workspace for the details of everyday life that usually end up spread across notes, spreadsheets and bookmarks."
      breadcrumb={[{ label: "About" }]}
    >
      <Section title="What Persora is">
        <p>
          Persora brings habits, contacts, saved cards, accounts, subscriptions and
          purchase records into a single application with a consistent interface. Instead
          of six tools with six logins, you maintain one account and move between modules
          from a persistent sidebar.
        </p>
        <p>
          The platform runs on Cloudflare Workers with Cloudflare D1 as its database and
          R2 for object storage. New modules are built on the same primitives: a D1 table
          scoped by <code className="rounded bg-secondary px-1 py-0.5 text-caption-2-medium">user_id</code>,
          a route handler guarded by the session, and a page inside the shared workspace
          shell.
        </p>
      </Section>

      <Section title="How it is built">
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <Card key={pillar.title} className="p-5">
              <pillar.icon className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="text-title-3-semibold text-foreground">{pillar.title}</h3>
              <p className="mt-1 text-body-2-medium leading-relaxed text-muted-foreground">
                {pillar.desc}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="What is live today">
        <p>
          The modules that are functional today are the Habit Tracker, Contacts Manager,
          Wallet Cards, URL Manager, Accounts Manager, Subscriptions, Purchases &amp;
          Warranty, the user overview and the administrator console (users, roles, feature
          flags, storage overview, public-site contact submissions and platform settings).
        </p>
        <p>
          Modules listed in the product roadmap but not yet implemented — tasks, calendar,
          documents, tables, forms, PDF tools, photo and audio studios, password vault and
          travel planning — are intentionally not exposed in the navigation. Persora does
          not display placeholder screens for features that do not exist.
        </p>
      </Section>

      <Section title="Principles">
        <ul className="list-disc space-y-2 pl-5">
          <li>Your rows belong to your account; every query is scoped by user id.</li>
          <li>No third-party identity provider sits in front of your account.</li>
          <li>Sensitive fields are encrypted before they are written to the database.</li>
          <li>Secrets live in Cloudflare environment variables, never in the repository.</li>
        </ul>
      </Section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/register">Create your account</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </PageShell>
  );
}
