/**
 * Persora — POST /api/auth/login
 *
 * Custom application-managed login. Verifies credentials against D1 and
 * establishes a secure session cookie.
 */

import { NextResponse } from "next/server";
import type { D1Database } from "@/lib/db";
import { z } from "zod";
import { getEnv } from "@/lib/context";
import { getUserByEmail, verifyPassword, createSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  const user = await getUserByEmail(env, email);
  if (!user) {
    // Generic message to avoid user enumeration.
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Fetch the stored hash separately (getUserByEmail does not return it).
  const row = await (env.DB as D1Database)
    .prepare("SELECT password_hash FROM users WHERE id = ?")
    .bind(user.id)
    .first();
  if (!row?.password_hash) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await verifyPassword(password, String(row.password_hash));
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(env, user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
