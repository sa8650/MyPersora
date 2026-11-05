/**
 * Persora — GET/POST /api/accounts
 * Internet & bank account records. Credentials encrypted at rest.
 */
import type { PersoraEnv } from "@/lib/db";


import { withAuth } from "@/lib/api";
import { encryptSecret, encryptionAvailable } from "@/lib/crypto";
import { z } from "zod";

const accountSchema = z.object({
  type: z.enum(["internet", "bank"]),
  provider_name: z.string().min(1).max(100),
  account_name: z.string().max(100).optional(),
  account_number_masked: z.string().max(50).optional(),
  username: z.string().max(100).optional(),
  password: z.string().max(200).optional(),
  url: z.string().url().max(500).optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});

async function listHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const sql = "SELECT id, user_id, type, provider_name, account_name, account_number_masked, url, is_active, created_at, updated_at FROM accounts WHERE user_id = ? ORDER BY provider_name";
  const { results } = await env.DB.prepare(sql).bind(user.id).all();
  return Response.json({ accounts: results ?? [] });
}

async function createHandler(request: Request, user: { id: string }, env: PersoraEnv) {
  const parsed = accountSchema.safeParse(await request.json() as any);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const { password, username, ...rest } = parsed.data;
  if ((password || username) && !encryptionAvailable(env)) {
    return Response.json(
      { error: "Credentials cannot be stored: SESSION_SECRET is not configured on this Worker." },
      { status: 503 },
    );
  }
  // Stored as AES-GCM ciphertext (v1:…) — never plaintext.
  const usernameEncrypted = username ? await encryptSecret(env, username) : null;
  const passwordEncrypted = password ? await encryptSecret(env, password) : null;
  await env.DB.prepare(
    `INSERT INTO accounts (id, user_id, type, provider_name, account_name, account_number_masked, username_encrypted, password_encrypted, url, notes, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  ).bind(id, user.id, rest.type, rest.provider_name, rest.account_name ?? null, rest.account_number_masked ?? null, usernameEncrypted, passwordEncrypted, rest.url || null, rest.notes ?? null, now, now).run();
  return Response.json({ id, user_id: user.id, ...rest, created_at: now, updated_at: now }, { status: 201 });
}

export const GET = withAuth(listHandler);
export const POST = withAuth(createHandler);
