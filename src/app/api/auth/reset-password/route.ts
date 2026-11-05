/**
 * Persora — POST /api/auth/reset-password
 *
 * Consumes a single-use reset token, stores the new bcrypt hash and revokes
 * every existing session for that user (so a stolen session cannot outlive a
 * password reset).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "@/lib/context";
import { hashPassword } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: Request) {
  const env = getEnv();
  if (!env) {
    return NextResponse.json({ error: "Configuration unavailable" }, { status: 500 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const tokenHash = await sha256Hex(parsed.data.token);
  const row = await env.DB.prepare(
    `SELECT id, user_id, expires_at, used_at
     FROM password_resets
     WHERE token_hash = ?`,
  )
    .bind(tokenHash)
    .first<{ id: string; user_id: string; expires_at: string; used_at: string | null }>();

  if (!row) {
    return NextResponse.json({ error: "This reset link is invalid." }, { status: 400 });
  }
  if (row.used_at) {
    return NextResponse.json({ error: "This reset link has already been used." }, { status: 400 });
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This reset link has expired." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(parsed.data.password);

  await env.DB.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
    .bind(passwordHash, now, row.user_id)
    .run();
  await env.DB.prepare("UPDATE password_resets SET used_at = ? WHERE id = ?")
    .bind(now, row.id)
    .run();
  await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(row.user_id).run();

  return NextResponse.json({ ok: true });
}
