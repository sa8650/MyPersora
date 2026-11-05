/**
 * Persora — Admin Console → Public Website.
 *
 * Shows submissions from the public contact form (stored in D1 by
 * /api/contact) and explains which public pages are static content in the
 * repository rather than database-driven.
 */

"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Globe, Inbox, RefreshCw, AlertTriangle } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
}

export default function AdminContentPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/contact", { cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as {
        messages?: ContactMessage[];
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Could not load contact submissions.");
        return;
      }
      setMessages(json.messages ?? []);
      if (json.error) setError(json.error);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: ContactMessage["status"]) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      }
    } finally {
      setBusyId(null);
    }
  }

  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-display-4-bold text-foreground">Public website</h1>
          <p className="text-body-medium text-muted-foreground">
            Contact submissions and the state of the public pages.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-caption-2-medium uppercase tracking-wide text-muted-foreground">
            New messages
          </p>
          <p className="mt-2 text-display-4-bold text-foreground">{newCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-caption-2-medium uppercase tracking-wide text-muted-foreground">
            Total stored
          </p>
          <p className="mt-2 text-display-4-bold text-foreground">{messages.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-caption-2-medium uppercase tracking-wide text-muted-foreground">
            Public pages
          </p>
          <p className="mt-2 text-display-4-bold text-foreground">6</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-title-3-semibold">
            <Inbox className="h-4 w-4" aria-hidden="true" />
            Contact submissions
          </CardTitle>
          <CardDescription>
            Messages sent through /contact. Marking as read or archived only changes their
            status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" aria-hidden="true" />
              <p className="text-body-2-medium text-amber-900">{error}</p>
            </div>
          )}

          {loading && messages.length === 0 && <div className="reui-skeleton h-20" />}

          {!loading && messages.length === 0 && !error && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <Inbox className="mx-auto mb-2 h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-body-medium font-medium text-foreground">No messages yet</p>
              <p className="text-body-2-medium text-muted-foreground">
                Submissions from the public contact form will appear here.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-body-medium font-semibold text-foreground">{message.subject}</p>
                  <p className="text-caption-2-medium text-muted-foreground">
                    {message.name} · {message.email} ·{" "}
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={message.status === "new" ? "default" : "secondary"}>
                  {message.status}
                </Badge>
              </div>
              <p className="mt-2 whitespace-pre-line text-body-2-medium text-foreground/90">
                {message.message}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === message.id || message.status === "read"}
                  onClick={() => void setStatus(message.id, "read")}
                >
                  Mark read
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busyId === message.id || message.status === "archived"}
                  onClick={() => void setStatus(message.id, "archived")}
                >
                  Archive
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-title-3-semibold">
            <Globe className="h-4 w-4" aria-hidden="true" />
            Static public content
          </CardTitle>
          <CardDescription>
            The landing page, About, Privacy, Terms, Blog and Contact pages are React
            components in the repository. There is no CMS or posts table yet, so they are
            edited in code and deployed with the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              "Landing page — src/app/(marketing)/page.tsx",
              "About — src/app/(marketing)/about/page.tsx",
              "Privacy — src/app/(marketing)/privacy/page.tsx",
              "Terms — src/app/(marketing)/terms/page.tsx",
              "Blog listing — src/app/(marketing)/blog/page.tsx",
              "Contact form — src/app/(marketing)/contact/page.tsx",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-body-2-medium text-muted-foreground">
                <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
