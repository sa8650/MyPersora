/**
 * Persora — POST /api/contact
 *
 * Public contact form endpoint. Stores the submission in D1 (`contact_messages`)
 * where administrators can review it in the Admin Console → Public Website.
 *
 * Deliberately minimal: strict validation, length caps and a honeypot field to
 * blunt trivial bots. No e-mail is sent from here (see lib/email.ts).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "@/lib/context";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email address").max(200),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(4000),
  /** Honeypot: real users never fill this in. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const env = getEnv();
  if (!env) {
    return NextResponse.json({ error: "Configuration unavailable" }, { status: 500 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { name, email, subject, message, website } = parsed.data;

  // Silent success for honeypot hits so bots do not learn anything.
  if (website) return NextResponse.json({ ok: true });

  try {
    await env.DB.prepare(
      `INSERT INTO contact_messages (id, name, email, subject, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'new', ?)`,
    )
      .bind(crypto.randomUUID(), name, email, subject, message, new Date().toISOString())
      .run();
  } catch {
    return NextResponse.json(
      {
        error:
          "The contact form is not available yet on this deployment (storage table missing).",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
