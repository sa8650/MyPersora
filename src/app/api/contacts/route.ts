/**
 * Persora — GET/POST /api/contacts
 * Google Contacts-style contact management for the authenticated user.
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { z } from "zod";

const contactSchema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  company: z.string().max(100).optional(),
  job_title: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  notes: z.string().max(1000).optional(),
  is_favorite: z.boolean().default(false),
});

async function listHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const favorite = searchParams.get("favorite");
  let sql = "SELECT * FROM contacts WHERE user_id = ?";
  const params: unknown[] = [user.id];
  if (q) { sql += " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company LIKE ?)"; const like = `%${q}%`; params.push(like, like, like, like); }
  if (favorite === "1") { sql += " AND is_favorite = 1"; }
  sql += " ORDER BY is_favorite DESC, lower(first_name), lower(last_name)";
  const { results } = await env.DB.prepare(sql).bind(...params).all();
  return Response.json({ contacts: results ?? [] });
}

async function createHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const parsed = contactSchema.safeParse(await request.json() as any);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const { first_name, last_name, email, phone, company, job_title, address, notes, is_favorite } = parsed.data;
  await env.DB.prepare(
    `INSERT INTO contacts (id, user_id, first_name, last_name, email, phone, company, job_title, address, notes, is_favorite, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user.id, first_name ?? null, last_name ?? null, email || null, phone || null, company ?? null, job_title ?? null, address ?? null, notes ?? null, is_favorite ? 1 : 0, now, now).run();
  return Response.json({ id, user_id: user.id, ...parsed.data, created_at: now, updated_at: now }, { status: 201 });
}

export const GET = withAuth(listHandler);
export const POST = withAuth(createHandler);
