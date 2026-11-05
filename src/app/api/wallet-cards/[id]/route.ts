/**
 * Persora — GET/PUT/DELETE /api/wallet-cards/[id]
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { z } from "zod";

const updateSchema = z.object({
  cardholder_name: z.string().max(100).optional(),
  brand: z.string().max(30).optional(),
  expiry_month: z.number().int().min(1).max(12).optional(),
  expiry_year: z.number().int().min(2000).max(2100).optional(),
  currency: z.string().length(3).optional(),
  type: z.enum(["payment", "currency"]).optional(),
  balance: z.number().optional(),
  is_active: z.boolean().optional(),
});

async function getHandler(request: Request, user: { id: string }, env: PersoraEnv, context: { params: { [key: string]: string } }) {
  const { id } = context.params;
  const row = await env.DB.prepare("SELECT * FROM wallet_cards WHERE id = ? AND user_id = ?").bind(id, user.id).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  // Never return full card number or CVV.
  const { card_number_encrypted, cvv_encrypted, ...safe } = row;
  return Response.json({ card: safe });
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
  await env.DB.prepare(`UPDATE wallet_cards SET ${setClause}, updated_at = ? WHERE id = ? AND user_id = ?`).bind(...values, now, id, user.id).run();
  const row = await env.DB.prepare("SELECT * FROM wallet_cards WHERE id = ? AND user_id = ?").bind(id, user.id).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  const { card_number_encrypted, cvv_encrypted, ...safe } = row;
  return Response.json({ card: safe });
}

async function delHandler(request: Request, user: { id: string }, env: PersoraEnv, context: { params: { [key: string]: string } }) {
  const { id } = context.params;
  await env.DB.prepare("DELETE FROM wallet_cards WHERE id = ? AND user_id = ?").bind(id, user.id).run();
  return Response.json({ ok: true });
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(delHandler);
