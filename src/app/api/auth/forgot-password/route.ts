/**
 * Persora — POST /api/auth/forgot-password
 *
 * Creates a single-use password reset token and e-mails the reset link.
 * The response never reveals whether an account exists (no user enumeration).
 * If e-mail delivery is not configured the endpoint returns 503 with a clearly
 * labelled reason instead of pretending the mail was sent.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "@/lib/context";
import { sendEmail, emailConfigured } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

const TOKEN_TTL_MINUTES = 30;

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const GENERIC_RESPONSE = {
  ok: true,
  message: "If an account exists for that address, a reset link has been sent.",
};

export async function POST(request: Request) {
  const env = getEnv();
  if (!env) {
    return NextResponse.json({ error: "Configuration unavailable" }, { status: 500 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  if (!emailConfigured(env)) {
    return NextResponse.json(
      {
        error:
          "Password recovery is not available yet: e-mail delivery is not configured on this deployment.",
        code: "email_not_configured",
      },
      { status: 503 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();

  const user = await env.DB.prepare("SELECT id, email FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string; email: string }>();

  if (user) {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const tokenHash = await sha256Hex(token);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

    // Invalidate previous tokens for this user, then store the new hash.
    await env.DB.prepare("UPDATE password_resets SET used_at = ? WHERE user_id = ? AND used_at IS NULL")
      .bind(now.toISOString(), user.id)
      .run();
    await env.DB.prepare(
      `INSERT INTO password_resets (id, user_id, token_hash, expires_at, used_at, created_at)
       VALUES (?, ?, ?, ?, NULL, ?)`,
    )
      .bind(crypto.randomUUID(), user.id, tokenHash, expiresAt, now.toISOString())
      .run();

    const baseUrl = (env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
    const link = `${baseUrl}/reset-password?token=${token}`;

    const result = await sendEmail(env, {
      to: user.email,
      subject: "Reset your Persora password",
      text: [
        "We received a request to reset the password for your Persora account.",
        "",
        `Open this link within ${TOKEN_TTL_MINUTES} minutes to choose a new password:`,
        link,
        "",
        "If you did not request this, you can safely ignore this e-mail.",
      ].join("\n"),
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: "Could not send the reset e-mail. Please try again shortly.",
          code: result.reason,
        },
        { status: 502 },
      );
    }
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
