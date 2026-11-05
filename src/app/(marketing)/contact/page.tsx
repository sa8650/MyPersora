/**
 * Persora — Contact page (/contact).
 *
 * The form posts to /api/contact, which stores the submission in D1 and makes
 * it visible to administrators in the Admin Console. There is no public
 * support e-mail address configured in this repository, so the form is the
 * supported contact channel.
 */

"use client";

import * as React from "react";
import { useState } from "react";
import { PageShell, Section } from "@/components/marketing/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Mail, MessageSquare, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Could not send your message. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageShell
      title="Contact Persora"
      description="Questions about the platform, your workspace or administration access? Send a message and it reaches the Persora team."
      breadcrumb={[{ label: "Contact" }]}
    >
      <div className="grid gap-8 md:grid-cols-[1fr_260px]">
        <Card className="p-6">
          {sent ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              <div>
                <h2 className="text-title-3-semibold text-foreground">Message received</h2>
                <p className="mt-1 text-body-medium text-muted-foreground">
                  Thank you — your message has been stored and is visible to the Persora
                  administrators. No e-mail copy is sent automatically.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSent(false)}
                >
                  Send another message
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" required maxLength={120} autoComplete="name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" name="email" type="email" required maxLength={200} autoComplete="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={7}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-body-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="How can we help?"
                />
              </div>
              {/* Honeypot — hidden from humans and assistive tech. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              {error && <p className="text-body-2-medium text-destructive">{error}</p>}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <Mail className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-title-3-semibold text-foreground">What to include</h2>
            <p className="mt-1 text-body-2-medium text-muted-foreground">
              The e-mail address on your account, the module you were using, and what you
              expected to happen.
            </p>
          </Card>
          <Card className="p-5">
            <ShieldCheck className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-title-3-semibold text-foreground">Never send secrets</h2>
            <p className="mt-1 text-body-2-medium text-muted-foreground">
              Do not include passwords, full card numbers or account credentials in a
              message. Persora staff never need them.
            </p>
          </Card>
          <Card className="p-5">
            <MessageSquare className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-title-3-semibold text-foreground">Account access</h2>
            <p className="mt-1 text-body-2-medium text-muted-foreground">
              For administrator access requests, use the subject “Admin access” so the
              request is routed correctly.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-10">
        <Section title="Response times">
          <p>
            Messages are stored immediately and reviewed by the platform administrators.
            This deployment does not run automated e-mail notifications, so replies happen
            manually.
          </p>
        </Section>
      </div>
    </PageShell>
  );
}
