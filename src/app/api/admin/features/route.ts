/**
 * Persora — GET/POST /api/admin/features
 * Feature & module activation/deactivation (admin).
 */
import type { PersoraEnv } from "@/lib/db";


import { withAdmin } from "@/lib/api";

async function listHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const { results } = await env.DB.prepare("SELECT * FROM feature_flags ORDER BY name").all();
  return Response.json({ features: results ?? [] });
}

async function createHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  let body: { name: string; description?: string; enabled?: boolean };
  try { body = await request.json() as any; } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.name) return Response.json({ error: "name is required" }, { status: 400 });
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO feature_flags (id, name, description, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(name) DO UPDATE SET enabled = excluded.enabled, description = excluded.description, updated_at = excluded.updated_at`
  ).bind(id, body.name, body.description ?? null, body.enabled ? 1 : 0, now, now).run();
  return Response.json({ id, name: body.name, enabled: !!body.enabled }, { status: 201 });
}

export const GET = withAdmin(listHandler);
export const POST = withAdmin(createHandler);
