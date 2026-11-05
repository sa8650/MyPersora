/**
 * Persora — GET/POST /api/purchases
 * Purchases & warranty manager.
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { z } from "zod";

const purchaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().nonnegative().optional(),
  currency: z.string().length(3).default("USD"),
  warranty_months: z.number().int().min(0).optional(),
  serial_number: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

async function listHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  let sql = "SELECT * FROM purchases WHERE user_id = ?";
  const params: unknown[] = [user.id];
  if (category) { sql += " AND category = ?"; params.push(category); }
  sql += " ORDER BY purchase_date DESC";
  const { results } = await env.DB.prepare(sql).bind(...params).all();
  return Response.json({ purchases: results ?? [] });
}

async function createHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const parsed = purchaseSchema.safeParse(await request.json() as any);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO purchases (id, user_id, title, description, brand, model, category, purchase_date, purchase_price, currency, warranty_months, serial_number, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user.id, parsed.data.title, parsed.data.description ?? null, parsed.data.brand ?? null, parsed.data.model ?? null, parsed.data.category ?? null, parsed.data.purchase_date ?? null, parsed.data.purchase_price ?? null, parsed.data.currency, parsed.data.warranty_months ?? null, parsed.data.serial_number ?? null, parsed.data.notes ?? null, now, now).run();
  return Response.json({ id, user_id: user.id, ...parsed.data, created_at: now, updated_at: now }, { status: 201 });
}

export const GET = withAuth(listHandler);
export const POST = withAuth(createHandler);
