/**
 * Persora — GET/POST /api/admin/users
 * Admin user management (requires admin role).
 */
import type { PersoraEnv } from "@/lib/db";


import { withAdmin } from "@/lib/api";
import { z } from "zod";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(100).optional(),
  role: z.enum(["admin", "user"]).default("user"),
});

async function listHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  let sql = "SELECT id, email, name, role, created_at FROM users";
  const params: unknown[] = [];
  if (role) { sql += " WHERE role = ?"; params.push(role); }
  sql += " ORDER BY created_at DESC";
  const { results } = await env.DB.prepare(sql).bind(...params).all();
  return Response.json({ users: results ?? [] });
}

async function createHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const { hashPassword, createUser } = await import("@/lib/auth");
  const parsed = createSchema.safeParse(await request.json() as any);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(parsed.data.email).first();
  if (existing) return Response.json({ error: "Email already registered" }, { status: 409 });
  const passwordHash = await hashPassword(parsed.data.password);
  const newUser = await createUser(env, parsed.data.email, passwordHash, parsed.data.name ?? null, parsed.data.role);
  return Response.json({ user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } }, { status: 201 });
}

export const GET = withAdmin(listHandler);
export const POST = withAdmin(createHandler);
