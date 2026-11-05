/**
 * Persora — GET /api/admin/stats
 *
 * Platform-wide counters for the Admin Console overview. Requires the admin
 * role (enforced by withAdmin). Returns aggregate counts only — never user
 * content, credentials or file contents.
 */

import type { PersoraEnv } from "@/lib/db";
import { withAdmin } from "@/lib/api";

const COUNTED_TABLES = [
  "users",
  "sessions",
  "habits",
  "habit_entries",
  "contacts",
  "wallet_cards",
  "urls",
  "accounts",
  "subscriptions",
  "purchases",
  "feature_flags",
  "contact_messages",
  "password_resets",
] as const;

async function handler(_request: Request, _user: unknown, env: PersoraEnv) {
  const counts: Record<string, number> = {};

  for (const table of COUNTED_TABLES) {
    try {
      const row = await env.DB.prepare(`SELECT COUNT(*) AS c FROM ${table}`).first<{ c: number }>();
      counts[table] = Number(row?.c ?? 0);
    } catch {
      // Table not migrated yet in this environment.
      counts[table] = -1;
    }
  }

  let admins = 0;
  let newUsers7d = 0;
  let activeSessions = 0;
  try {
    const adminRow = await env.DB.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'").first<{ c: number }>();
    admins = Number(adminRow?.c ?? 0);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const newRow = await env.DB.prepare("SELECT COUNT(*) AS c FROM users WHERE created_at >= ?")
      .bind(since)
      .first<{ c: number }>();
    newUsers7d = Number(newRow?.c ?? 0);
    const sessionRow = await env.DB.prepare("SELECT COUNT(*) AS c FROM sessions WHERE expires_at > ?")
      .bind(new Date().toISOString())
      .first<{ c: number }>();
    activeSessions = Number(sessionRow?.c ?? 0);
  } catch {
    // Ignore; counters stay at their defaults.
  }

  let r2: { objects: number; bytes: number; error?: string } = { objects: 0, bytes: 0 };
  try {
    const listed = await env.R2_BUCKET.list({ limit: 1000 });
    const objects = (listed.objects ?? []) as { size?: number }[];
    r2 = {
      objects: objects.length,
      bytes: objects.reduce((total, object) => total + Number(object.size ?? 0), 0),
    };
  } catch {
    r2 = { objects: 0, bytes: 0, error: "R2 bucket not accessible" };
  }

  const databaseOk = counts.users !== undefined && counts.users >= 0;

  return Response.json({
    users: {
      total: Math.max(counts.users ?? 0, 0),
      admins,
      newLast7Days: newUsers7d,
      activeSessions,
    },
    database: {
      status: databaseOk ? "ok" : "unavailable",
      counts,
    },
    r2,
    runtime: {
      encryptionConfigured: Boolean(env.SESSION_SECRET && env.SESSION_SECRET.length >= 16),
      emailConfigured: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
      appUrlConfigured: Boolean(env.NEXT_PUBLIC_APP_URL),
      generatedAt: new Date().toISOString(),
    },
  });
}

export const GET = withAdmin(handler);
