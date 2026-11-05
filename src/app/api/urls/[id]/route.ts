/**
 * Persora — GET/PUT/DELETE /api/urls/[id]
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  url: z.string().url().max(1000).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  is_favorite: z.boolean().optional(),
  visit_count: z.number().int().min(0).optional(),
});

async function getHandler(request: Request, user: { id: string }, env: PersoraEnv, context: { params: { [key: string]: string } }) {
  const { id } = context.params;
  const row = await env.DB.prepare("SELECT * FROM urls WHERE id = ? AND user_id = ?").bind(id, user.id).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({
    url: { ...row, tags: row.tags ? JSON.parse(String(row.tags)) : [] },
  });
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
  const setClause = fields.map(([k]) => (k === "tags" ? "tags = ?" : `${k} = ?`)).join(", ");
  const values = fields.map(([k, v]) => (k === "tags" ? JSON.stringify(v) : typeof v === "boolean" ? (v ? 1 : 0) : v));
  await env.DB.prepare(`UPDATE urls SET ${setClause}, updated_at = ? WHERE id = ? AND user_id = ?`).bind(...values, now, id, user.id).run();
  const row = await env.DB.prepare("SELECT * FROM urls WHERE id = ? AND user_id = ?").bind(id, user.id).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({
    url: { ...row, tags: row.tags ? JSON.parse(String(row.tags)) : [] },
  });
}

async function delHandler(request: Request, user: { id: string }, env: PersoraEnv, context: { params: { [key: string]: string } }) {
  const { id } = context.params;
  await env.DB.prepare("DELETE FROM urls WHERE id = ? AND user_id = ?").bind(id, user.id).run();
  return Response.json({ ok: true });
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(delHandler);
