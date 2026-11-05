/**
 * Persora — GET/POST /api/urls
 * URL / bookmark manager.
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { z } from "zod";

const urlSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url().max(1000),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  is_favorite: z.boolean().default(false),
});

async function listHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  let sql = "SELECT * FROM urls WHERE user_id = ?";
  const params: unknown[] = [user.id];
  if (category) { sql += " AND category = ?"; params.push(category); }
  sql += " ORDER BY is_favorite DESC, lower(title)";
  const { results } = await env.DB.prepare(sql).bind(...params).all();
  return Response.json({ urls: results ?? [] });
}

async function createHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const parsed = urlSchema.safeParse(await request.json() as any);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const { tags, ...rest } = parsed.data;
  await env.DB.prepare(
    `INSERT INTO urls (id, user_id, title, url, description, category, tags, is_favorite, visit_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
  ).bind(id, user.id, rest.title, rest.url, rest.description ?? null, rest.category ?? null, JSON.stringify(tags), rest.is_favorite ? 1 : 0, now, now).run();
  return Response.json({ id, user_id: user.id, ...rest, tags, created_at: now, updated_at: now }, { status: 201 });
}

export const GET = withAuth(listHandler);
export const POST = withAuth(createHandler);
