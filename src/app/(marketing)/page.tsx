/**
 * Persora — Public landing page (/).
 *
 * The header and footer come from the (marketing) layout, so this page only
 * renders the page-level sections.
 */

import Link from "next/link";
import {
  Activity,
  Users,
  CreditCard,
  Link as LinkIcon,
  Banknote,
  Tag,
  ShoppingCart,
  Lock,
  Database,
  Server,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const MODULES = [
  {
    title: "Habit Tracker",
    desc: "Create daily habits, log completions and follow your progress.",
    icon: Activity,
    href: "/overview",
  },
  {
    title: "Contacts Manager",
    desc: "A Google Contacts-style address book with favourites and search.",
    icon: Users,
    href: "/overview",
  },
  {
    title: "Wallet Cards",
    desc: "Saved card records with sensitive fields encrypted at rest.",
    icon: CreditCard,
    href: "/overview",
  },
  {
    title: "URL Manager",
    desc: "Organise, categorise and favourite the links you keep coming back to.",
    icon: LinkIcon,
    href: "/overview",
  },
  {
    title: "Accounts Manager",
    desc: "Internet and bank account records with notes and details.",
    icon: Banknote,
    href: "/overview",
  },
  {
    title: "Subscriptions",
    desc: "Track recurring costs, renewal dates and payment methods.",
    icon: Tag,
    href: "/overview",
  },
  {
    title: "Purchases & Warranty",
    desc: "Purchase records with prices, sellers and warranty expiry.",
    icon: ShoppingCart,
    href: "/overview",
  },
  {
    title: "Profiles & Settings",
    desc: "Your account, session and workspace preferences in one place.",
    icon: ShieldCheck,
    href: "/overview",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    desc: "Register with an email address and password. Passwords are hashed with bcrypt before they ever reach the database.",
  },
  {
    step: "02",
    title: "Open your workspace",
    desc: "Sign in and land on your overview: habits, contacts, wallet cards, accounts, subscriptions and purchases, in one shell.",
  },
  {
    step: "03",
    title: "Keep everything in one place",
    desc: "Every module reads and writes your own rows, isolated by user id, behind a validated session cookie.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-5">
              Personal Management Platform
            </Badge>
            <h1 className="text-display-3-bold tracking-tight text-foreground sm:text-display-2-bold">
              Organize your life.{" "}
              <span className="text-primary">Securely.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-headline-medium leading-relaxed text-muted-foreground">
              Persora is a private workspace for the things you actually keep track
              of — habits, contacts, cards, accounts, subscriptions and purchases —
              built on Cloudflare Workers, D1 and R2.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/register">
                  Create your account
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <p className="mt-4 text-caption-2-medium text-muted-foreground">
              Free to create · No third-party login providers · Your data stays in your workspace
            </p>
          </div>
        </div>
      </section>

      {/* Value strip */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Lock, title: "Custom auth", desc: "bcrypt hashing, D1 sessions" },
            { icon: Database, title: "Cloudflare D1", desc: "SQL data, per-user isolation" },
            { icon: Server, title: "Cloudflare R2", desc: "Attachment object storage" },
            { icon: ShieldCheck, title: "Role-based access", desc: "User and admin scopes" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-body-medium font-semibold text-foreground">{item.title}</p>
                <p className="text-caption-2-medium text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-title-1-bold tracking-tight text-foreground">
              Everything you manage, in one workspace
            </h2>
            <p className="mt-3 text-body-medium text-muted-foreground">
              Modules that ship today, reachable from a single persistent sidebar.
              Each one reads and writes only your own records.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((module) => (
              <Card key={module.title} className="p-5 transition-shadow hover:shadow-md">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <module.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mb-1.5 text-title-3-semibold text-foreground">{module.title}</h3>
                <p className="text-body-2-medium leading-relaxed text-muted-foreground">
                  {module.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-secondary/30 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-title-1-bold tracking-tight text-foreground">How Persora works</h2>
            <p className="mt-3 text-body-medium text-muted-foreground">
              One account, one workspace, no third-party identity providers.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.step} className="rounded-xl border border-border bg-background p-6">
                <span className="text-title-2-bold text-primary">{step.step}</span>
                <h3 className="mt-3 text-title-3-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-body-2-medium leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & privacy */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-title-1-bold tracking-tight text-foreground">
              Built for privacy and control
            </h2>
            <p className="mt-3 text-body-medium leading-relaxed text-muted-foreground">
              Persora uses application-managed authentication: credentials are
              hashed, sessions are validated against the database on every request,
              and sensitive fields are encrypted at rest. Secrets are configured as
              Cloudflare environment variables — never in the repository.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Passwords stored as bcrypt hashes (cost 12)",
                "HTTP-only, SameSite session cookies with 30-day expiry",
                "Every API route scoped to the authenticated user id",
                "Admin console guarded by role checks on the server and in each API",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-body-medium text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button variant="outline" asChild>
                <Link href="/privacy">Read the privacy policy</Link>
              </Button>
            </div>
          </div>
          <Card className="p-6">
            <p className="mb-4 text-caption-2-medium font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace at a glance
            </p>
            <div className="space-y-3">
              {[
                { label: "Habits & daily completions", value: "D1" },
                { label: "Contacts with favourites", value: "D1" },
                { label: "Wallet cards & accounts", value: "D1" },
                { label: "Subscriptions & renewals", value: "D1" },
                { label: "Purchases & warranty", value: "D1" },
                { label: "Avatars, receipts, uploads", value: "R2" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-body-2-medium text-foreground">{row.label}</span>
                  <Badge variant="secondary">{row.value}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-title-1-bold text-primary-foreground">Ready to get organized?</h2>
          <p className="mt-3 text-body-medium text-primary-foreground/90">
            Create your Persora workspace in under a minute.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
              <Link href="/register">Create your account</Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="w-full text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
