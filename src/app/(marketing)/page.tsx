/**
 * Persora — Public Landing Page
 */

import Link from "next/link";
import {
  Rocket, Shield, Lock, Layers, Globe, Heart, Wand2, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-headline-bold">P</span>
              </div>
              <span className="text-title-2-semibold tracking-tight">Persora</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-body-medium">
              <Link href="/" className="text-foreground font-medium">Home</Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-body-medium text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
              <Button asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-body-2-medium text-muted-foreground mb-6">
            <Badge variant="secondary" className="text-xs">Personal Management SaaS</Badge>
          </div>
          <h1 className="text-display-1-bold text-foreground tracking-tight sm:text-display-2 mb-6">
            Organize your life. <span className="text-primary">Securely.</span>
          </h1>
          <p className="text-headline text-muted-foreground mb-8 max-w-2xl mx-auto">
            Persora is your personal workspace for habits, contacts, wallet cards,
            URLs, accounts, subscriptions and purchases — all in one private,
            application-managed platform powered by Cloudflare D1 and R2.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/register">Create your account</Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-title-1-bold text-center text-foreground mb-4">Everything you manage, in one place</h2>
          <p className="text-body-medium text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Ten dedicated modules, persistent workspace navigation and role-based
            access control for individuals and administrators.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[{
              title: "Habit Tracker",
              desc: "Build and track daily routines with progress entries.",
              icon: Heart,
            }, {
              title: "Contacts Manager",
              desc: "Google Contacts-style address book with favorites.",
              icon: Layers,
            }, {
              title: "Wallet Cards",
              desc: "Securely saved payment & currency cards, encrypted at rest.",
              icon: Shield,
            }, {
              title: "URL Manager",
              desc: "Organize, tag and favorite your bookmarks.",
              icon: Globe,
            }, {
              title: "Account Manager",
              desc: "Internet and bank account records, encrypted credentials.",
              icon: Lock,
            }, {
              title: "Subscriptions",
              desc: "Recurring billing and upcoming renewal tracking.",
              icon: Rocket,
            }].map((feature) => (
              <Card key={feature.title} className="reui-card p-6 hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-title-3-semibold mb-2">{feature.title}</h3>
                <p className="text-body-2-medium text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security / trust */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-title-1-bold text-center text-foreground mb-4">Built for privacy and control</h2>
          <p className="text-body-medium text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Custom application-managed authentication. Your credentials and
            sensitive data are hashed and encrypted; secrets live only in
            Cloudflare environment variables — never in source code.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {[{
              label: "Custom Auth",
              desc: "Application-managed login with bcrypt password hashing.",
              icon: Lock,
            }, {
              label: "Cloudflare D1",
              desc: "SQLite database for users and application data.",
              icon: BarChart3,
            }, {
              label: "Cloudflare R2",
              desc: "Object storage for avatars, receipts and uploads.",
              icon: Wand2,
            }].map((item) => (
              <Card key={item.label} className="reui-card p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground mx-auto mb-4">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-title-3-semibold mb-2">{item.label}</h3>
                <p className="text-body-2-medium text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-title-1-bold text-primary-foreground mb-4">Ready to get organized?</h2>
          <p className="text-body-medium text-primary/80 mb-8">
            Create your free Persora workspace in seconds.
          </p>
          <Button size="lg" className="bg-background text-primary hover:bg-primary/90" asChild>
            <Link href="/register">Create your account</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-secondary/30 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-caption-2-medium text-muted-foreground">
            Persora — Personal Management Platform. &copy; {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 text-caption-2-medium">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
