/**
 * Persora — GET/PUT/DELETE /api/contacts/[id]
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { z } from "zod";

const updateSchema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(100).optional(),
  job_title: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  notes: z.string().max(1000).optional(),
  is_favorite: z.boolean().optional(),
  avatar_url: z.string().max(500).optional(),
});

async function getHandler(request: Request, user: { id: string }, env: PersoraEnv, context: { params: { [key: string]: string } }) {
  const { id } = context.params;
  const row = await env.DB.prepare("SELECT * FROM contacts WHERE id = ? AND user_id = ?").bind(id, user.id).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ contact: row });
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
  await env.DB.prepare(`UPDATE contacts SET ${setClause}, updated_at = ? WHERE id = ? AND user_id = ?`).bind(...values, now, id, user.id).run();
  const row = await env.DB.prepare("SELECT * FROM contacts WHERE id = ? AND user_id = ?").bind(id, user.id).first();
  return Response.json({ contact: row });
}

async function delHandler(request: Request, user: { id: string }, env: PersoraEnv, context: { params: { [key: string]: string } }) {
  const { id } = context.params;
  await env.DB.prepare("DELETE FROM contacts WHERE id = ? AND user_id = ?").bind(id, user.id).run();
  return Response.json({ ok: true });
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(delHandler);
