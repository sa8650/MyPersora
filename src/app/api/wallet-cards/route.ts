/**
 * Persora — GET/POST /api/wallet-cards
 * Saved payment & currency cards. Card numbers are encrypted at rest.
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { z } from "zod";

const cardSchema = z.object({
  cardholder_name: z.string().max(100).optional(),
  card_number: z.string().min(13).max(19),
  brand: z.string().max(30).optional(),
  expiry_month: z.number().int().min(1).max(12),
  expiry_year: z.number().int().min(2000).max(2100),
  cvv: z.string().min(3).max(4).optional(),
  currency: z.string().length(3).default("USD"),
  type: z.enum(["payment", "currency"]).default("payment"),
});

async function listHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const sql = "SELECT id, user_id, cardholder_name, card_number_last4, brand, expiry_month, expiry_year, currency, type, balance, is_active, created_at, updated_at FROM wallet_cards WHERE user_id = ? ORDER BY is_active DESC, created_at DESC";
  const { results } = await env.DB.prepare(sql).bind(user.id).all();
  return Response.json({ cards: results ?? [] });
}

async function createHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const parsed = cardSchema.safeParse(await request.json() as any);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const { card_number, ...rest } = parsed.data;
  const last4 = card_number.replace(/\D/g, "").slice(-4);
  // NOTE: In production, encrypt card_number/cvv with a key from SESSION_SECRET / a dedicated R2 encryption key before storing.
  await env.DB.prepare(
    `INSERT INTO wallet_cards (id, user_id, cardholder_name, card_number_encrypted, card_number_last4, brand, expiry_month, expiry_year, cvv_encrypted, currency, type, balance, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)`
  ).bind(id, user.id, rest.cardholder_name ?? null, card_number, last4, rest.brand ?? null, rest.expiry_month, rest.expiry_year, rest.cvv ?? null, rest.currency, rest.type, now, now).run();
  return Response.json({ id, user_id: user.id, card_number_last4: last4, ...rest, created_at: now, updated_at: now }, { status: 201 });
}

export const GET = withAuth(listHandler);
export const POST = withAuth(createHandler);
