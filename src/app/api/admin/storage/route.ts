/**
 * Persora — GET /api/admin/storage
 * Database & R2 storage overview (admin).
 */
import type { PersoraEnv } from "@/lib/db";


import { withAdmin } from "@/lib/api";

async function getHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const dbInfo: Record<string, unknown> = {};
  try {
    const tables = ["users", "sessions", "habits", "habit_entries", "contacts", "wallet_cards", "urls", "accounts", "subscriptions", "purchases", "feature_flags"];
    for (const t of tables) {
      const { results } = await env.DB.prepare(`SELECT COUNT(*) AS c FROM ${t}`).all<{ c: number }>();
      dbInfo[t] = results?.[0]?.c ?? 0;
    }
  } catch {
    // Table may not exist yet in a fresh environment.
  }
  let r2Info: Record<string, unknown> = {};
  try {
    const { objects } = await env.R2_BUCKET.list({ limit: 5 });
    r2Info = {
      sampleObjects: (objects ?? []).map((o) => {
        const obj = o as { key: string; size: number };
        return { key: obj.key, size: obj.size };
      }),
    };
  } catch {
    r2Info = { error: "R2 bucket not accessible" };
  }
  return Response.json({ database: dbInfo, r2: r2Info });
}

export const GET = withAdmin(getHandler);
