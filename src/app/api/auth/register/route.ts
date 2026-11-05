/**
 * Persora — POST /api/auth/register
 *
 * Custom application-managed registration (no third-party auth).
 * Validates input, hashes the password with bcrypt, creates the user in D1,
 * and establishes a session cookie.
 */

import { NextResponse } from "next/server";
import type { D1Database } from "@/lib/db";
import { z } from "zod";
import { getEnv } from "@/lib/context";
import { hashPassword, createUser, createSession } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(request: Request) {
  const env = getEnv();
  if (!env) {
    return NextResponse.json({ error: "Configuration unavailable" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json() as any;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { email, password, name } = parsed.data;

  // Reject duplicate email.
  const existing = await (env.DB as D1Database)
    .prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(env, email, passwordHash, name ?? null, "user");

  await createSession(env, user.id);

  return NextResponse.json(
    {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    },
    { status: 201 },
  );
}
