/**
 * Persora — GET/POST /api/habits
 * List and create habits for the authenticated user.
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  target: z.number().int().min(1).max(1000).default(1),
});

async function listHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const { searchParams } = new URL(request.url);
  const active = searchParams.get("active");
  let sql = "SELECT * FROM habits WHERE user_id = ?";
  const params: unknown[] = [user.id];
  if (active === "1") {
    sql += " AND is_active = 1";
  }
  sql += " ORDER BY created_at DESC";
  const { results } = await env.DB.prepare(sql).bind(...params).all<{ id: string; user_id: string; name: string; description: string | null; frequency: string; target: number; is_active: number; created_at: string; updated_at: string }>();
  return Response.json({ habits: results ?? [] });
}

async function createHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const parsed = createSchema.safeParse(await request.json() as any);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const { name, description, frequency, target } = parsed.data;
  await env.DB.prepare(
    `INSERT INTO habits (id, user_id, name, description, frequency, target, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
  ).bind(id, user.id, name, description ?? null, frequency, target, now, now).run();
  return Response.json({ id, user_id: user.id, name, description, frequency, target, is_active: 1, created_at: now, updated_at: now }, { status: 201 });
}

export const GET = withAuth((req, user, env) => listHandler(req, user, env));
export const POST = withAuth((req, user, env) => createHandler(req, user, env));
