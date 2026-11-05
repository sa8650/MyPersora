/**
 * Persora — Admin Console overview (/admin).
 *
 * Reads aggregate platform counters from /api/admin/stats (admin-only) and
 * shows runtime configuration health. Counts only — no user content.
 */

"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  Activity,
  Database,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Mail,
  Link2,
} from "lucide-react";
import NextLink from "next/link";

interface Stats {
  users: { total: number; admins: number; newLast7Days: number; activeSessions: number };
  database: { status: string; counts: Record<string, number> };
  r2: { objects: number; bytes: number; error?: string };
  runtime: {
    encryptionConfigured: boolean;
    emailConfigured: boolean;
    appUrlConfigured: boolean;
    generatedAt: string;
  };
}

const TABLE_LABELS: Record<string, string> = {
  users: "Users",
  sessions: "Sessions",
  habits: "Habits",
  habit_entries: "Habit entries",
  contacts: "Contacts",
  wallet_cards: "Wallet cards",
  urls: "Saved URLs",
  accounts: "Accounts",
  subscriptions: "Subscriptions",
  purchases: "Purchases",
  feature_flags: "Feature flags",
  contact_messages: "Contact messages",
  password_resets: "Reset tokens",
};

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as Stats & { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Could not load platform statistics.");
        return;
      }
      setStats(json);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-display-4-bold text-foreground">Platform overview</h1>
          <p className="text-body-medium text-muted-foreground">
            Accounts, database health and storage for this Persora deployment.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" aria-hidden="true" />
          <p className="text-body-2-medium text-destructive">{error}</p>
        </div>
      )}

      {loading && !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="reui-skeleton h-28" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total users", value: stats.users.total, icon: Users },
              { label: "Administrators", value: stats.users.admins, icon: ShieldCheck },
              { label: "New (7 days)", value: stats.users.newLast7Days, icon: UserCheck },
              { label: "Active sessions", value: stats.users.activeSessions, icon: Activity },
            ].map((tile) => (
              <Card key={tile.label} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-caption-2-medium font-medium uppercase tracking-wide text-muted-foreground">
                    {tile.label}
                  </p>
                  <tile.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="mt-2 text-display-4-bold text-foreground">{tile.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-title-3-semibold">
                  <Database className="h-4 w-4" aria-hidden="true" />
                  Cloudflare D1
                </CardTitle>
                <CardDescription>
                  Row counts per table. A dash means the table has not been migrated in this
                  environment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {Object.entries(TABLE_LABELS).map(([table, label]) => {
                    const value = stats.database.counts[table];
                    return (
                      <div
                        key={table}
                        className="flex items-center justify-between border-b border-border py-1.5 last:border-0"
                      >
                        <dt className="text-body-2-medium text-muted-foreground">{label}</dt>
                        <dd className="text-body-2-medium font-medium text-foreground">
                          {value === undefined || value < 0 ? "—" : value}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-title-3-semibold">
                    <HardDrive className="h-4 w-4" aria-hidden="true" />
                    R2 storage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-body-2-medium text-muted-foreground">Objects (first 1000)</span>
                    <span className="text-body-2-medium font-medium">{stats.r2.objects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body-2-medium text-muted-foreground">Size</span>
                    <span className="text-body-2-medium font-medium">{formatBytes(stats.r2.bytes)}</span>
                  </div>
                  {stats.r2.error && (
                    <p className="text-caption-2-medium text-destructive">{stats.r2.error}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-title-3-semibold">Configuration</CardTitle>
                  <CardDescription>Runtime secrets detected on this Worker.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    {
                      label: "SESSION_SECRET (encryption)",
                      ok: stats.runtime.encryptionConfigured,
                      icon: ShieldCheck,
                    },
                    { label: "E-mail delivery (Resend)", ok: stats.runtime.emailConfigured, icon: Mail },
                    { label: "NEXT_PUBLIC_APP_URL", ok: stats.runtime.appUrlConfigured, icon: Link2 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-body-2-medium text-muted-foreground">
                        <row.icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {row.label}
                      </span>
                      <Badge variant={row.ok ? "default" : "secondary"}>
                        {row.ok ? "configured" : "missing"}
                      </Badge>
                    </div>
                  ))}
                  <p className="pt-2 text-caption-2-medium text-muted-foreground">
                    Generated {new Date(stats.runtime.generatedAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-title-3-semibold">Service health</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "D1 database", ok: stats.database.status === "ok" },
                { label: "R2 bucket", ok: !stats.r2.error },
                { label: "Runtime API", ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  )}
                  <span className="text-body-2-medium text-foreground">{item.label}</span>
                  <Badge variant={item.ok ? "default" : "secondary"} className="ml-auto">
                    {item.ok ? "ok" : "degraded"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <NextLink href="/admin/users">Manage users</NextLink>
            </Button>
            <Button asChild variant="outline">
              <NextLink href="/admin/storage">Storage diagnostics</NextLink>
            </Button>
            <Button asChild variant="outline">
              <NextLink href="/admin/features">Feature flags</NextLink>
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
