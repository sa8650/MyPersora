/**
 * Persora — transactional e-mail delivery.
 *
 * Password recovery needs to send a single-use link to the account's e-mail
 * address. No e-mail provider is wired into this repository yet, so delivery
 * is implemented against Resend's HTTP API (no extra dependency) and is
 * activated purely by configuration:
 *
 *   npx wrangler secret put RESEND_API_KEY     # provider key
 *   npx wrangler secret put EMAIL_FROM         # e.g. "Persora <no-reply@yourdomain>"
 *   [vars] NEXT_PUBLIC_APP_URL = "https://persora.example.workers.dev"
 *
 * When the key is missing the API returns a clearly-labelled 503 instead of
 * pretending an e-mail was sent.
 */

export interface EmailResult {
  ok: boolean;
  /** Machine-readable reason when delivery is impossible. */
  reason?: "not_configured" | "provider_error";
  detail?: string;
}

export function emailConfigured(env: {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}): boolean {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

export async function sendEmail(
  env: { RESEND_API_KEY?: string; EMAIL_FROM?: string },
  message: { to: string; subject: string; text: string },
): Promise<EmailResult> {
  if (!emailConfigured(env)) {
    return {
      ok: false,
      reason: "not_configured",
      detail:
        "E-mail delivery is not configured. Set the RESEND_API_KEY and EMAIL_FROM Worker secrets.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: "provider_error",
        detail: `Provider responded ${response.status}.`,
      };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: "provider_error",
      detail: error instanceof Error ? error.message : "Unknown transport error.",
    };
  }
}
