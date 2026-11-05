/**
 * Persora — GET/PUT/DELETE /api/purchases/[id]
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  warranty_months: z.number().int().min(0).optional(),
  serial_number: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

async function getHandler(request: Request, user: { id: string }, env: PersoraEnv, context: { params: { [key: string]: string } }) {
  const { id } = context.params;
  const row = await env.DB.prepare("SELECT * FROM purchases WHERE id = ? AND user_id = ?").bind(id, user.id).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ purchase: row });
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
  const values = fields.map(([, v]) => v);
  await env.DB.prepare(`UPDATE purchases SET ${setClause}, updated_at = ? WHERE id = ? AND user_id = ?`).bind(...values, now, id, user.id).run();
  const row = await env.DB.prepare("SELECT * FROM purchases WHERE id = ? AND user_id = ?").bind(id, user.id).first();
  return Response.json({ purchase: row });
}

async function delHandler(request: Request, user: { id: string }, env: PersoraEnv, context: { params: { [key: string]: string } }) {
  const { id } = context.params;
  await env.DB.prepare("DELETE FROM purchases WHERE id = ? AND user_id = ?").bind(id, user.id).run();
  return Response.json({ ok: true });
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(delHandler);
