/**
 * Persora — GET/POST /api/subscriptions
 * Recurring subscription manager.
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { z } from "zod";

const subscriptionSchema = z.object({
  name: z.string().min(1).max(100),
  provider: z.string().min(1).max(100),
  category: z.string().max(100).optional(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  interval: z.enum(["monthly", "yearly", "weekly"]).default("monthly"),
  start_date: z.string().optional(),
  renewal_date: z.string().optional(),
  status: z.enum(["active", "cancelled", "paused", "past_due"]).default("active"),
  payment_method_id: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

async function listHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  let sql = "SELECT * FROM subscriptions WHERE user_id = ?";
  const params: unknown[] = [user.id];
  if (status) { sql += " AND status = ?"; params.push(status); }
  sql += " ORDER BY renewal_date ASC";
  const { results } = await env.DB.prepare(sql).bind(...params).all();
  return Response.json({ subscriptions: results ?? [] });
}

async function createHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const parsed = subscriptionSchema.safeParse(await request.json() as any);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO subscriptions (id, user_id, name, provider, category, amount, currency, interval, start_date, renewal_date, status, payment_method_id, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user.id, parsed.data.name, parsed.data.provider, parsed.data.category ?? null, parsed.data.amount, parsed.data.currency, parsed.data.interval, parsed.data.start_date ?? null, parsed.data.renewal_date ?? null, parsed.data.status, parsed.data.payment_method_id ?? null, parsed.data.notes ?? null, now, now).run();
  return Response.json({ id, user_id: user.id, ...parsed.data, created_at: now, updated_at: now }, { status: 201 });
}

export const GET = withAuth(listHandler);
export const POST = withAuth(createHandler);
