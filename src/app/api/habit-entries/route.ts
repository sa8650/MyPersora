/**
 * Persora — GET/POST /api/habit-entries
 * List entries for a habit, or record/check off an entry.
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { z } from "zod";

const entrySchema = z.object({
  habit_id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  count: z.number().int().min(0).default(0),
  completed: z.boolean().default(false),
});

async function listHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const { searchParams } = new URL(request.url);
  const habit_id = searchParams.get("habit_id");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  let sql = "SELECT * FROM habit_entries WHERE user_id = ?";
  const params: unknown[] = [user.id];
  if (habit_id) { sql += " AND habit_id = ?"; params.push(habit_id); }
  if (from) { sql += " AND date >= ?"; params.push(from); }
  if (to) { sql += " AND date <= ?"; params.push(to); }
  sql += " ORDER BY date DESC";
  const { results } = await env.DB.prepare(sql).bind(...params).all();
  return Response.json({ entries: results ?? [] });
}

async function createHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const parsed = entrySchema.safeParse(await request.json() as any);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { habit_id, date, count, completed } = parsed.data;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO habit_entries (id, habit_id, user_id, date, count, completed, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(habit_id, date) DO UPDATE SET count = excluded.count, completed = excluded.completed, updated_at = excluded.updated_at`
  ).bind(id, habit_id, user.id, date, count, completed ? 1 : 0, now, now).run();
  return Response.json({ id, habit_id, date, count, completed, created_at: now, updated_at: now }, { status: 201 });
}

export const GET = withAuth(listHandler);
export const POST = withAuth(createHandler);
