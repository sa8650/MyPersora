/**
 * Persora — GET/PUT /api/admin/settings
 * Platform settings (admin).
 */
import type { PersoraEnv } from "@/lib/db";


import { withAdmin } from "@/lib/api";

const SETTINGS_KEYS = ["site_name", "site_tagline", "registration_enabled", "maintenance_mode"];

async function listHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const { results } = await env.DB.prepare("SELECT * FROM platform_settings ORDER BY key").all();
  return Response.json({ settings: results ?? [] });
}

async function updateHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  let body: { key: string; value: string };
  try { body = await request.json() as any; } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!SETTINGS_KEYS.includes(body.key)) return Response.json({ error: "Invalid setting key" }, { status: 400 });
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO platform_settings (id, key, value, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).bind(id, body.key, String(body.value), now, now).run();
  return Response.json({ ok: true });
}

export const GET = withAdmin(listHandler);
export const PUT = withAdmin(updateHandler);
