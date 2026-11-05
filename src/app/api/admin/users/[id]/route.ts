/**
 * Persora — GET/PUT/DELETE /api/admin/users/[id]
 */
import type { PersoraEnv } from "@/lib/db";


import { withAdmin } from "@/lib/api";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().max(100).optional(),
  role: z.enum(["admin", "user"]).optional(),
  is_active: z.boolean().optional(),
});

async function getHandler(request: Request, user: { id: string }, env: PersoraEnv, context: { params: { [key: string]: string } }) {
  const { id } = context.params;
  const row = await env.DB.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?").bind(id).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ user: row });
}

async function putHandler(request: Request, user: { id: string }, env: PersoraEnv, context: { params: { [key: string]: string } }) {
  const { id } = context.params;
  const parsed = updateSchema.safeParse(await request.json() as any);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const now = new Date().toISOString();
  const fields = Object.entries(parsed.data).filter(([, v]) => v !== undefined);
  if (fields.length === 0) return Response.json({ error: "No fields to update" }, { status: 400 });
  const setClause = fields.map(([k]) => `${k} = ?`).join(", ");
  const values = fields.map(([, v]) => (typeof v === "boolean" ? (v ? 1 : 0) : v));
  await env.DB.prepare(`UPDATE users SET ${setClause}, updated_at = ? WHERE id = ?`).bind(...values, now, id).run();
  const row = await env.DB.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?").bind(id).first();
  return Response.json({ user: row });
}

async function delHandler(request: Request, user: { id: string }, env: PersoraEnv, context: { params: { [key: string]: string } }) {
  const { id } = context.params;
  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
  return Response.json({ ok: true });
}

export const GET = withAdmin(getHandler);
export const PUT = withAdmin(putHandler);
export const DELETE = withAdmin(delHandler);
