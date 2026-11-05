/**
 * Persora — field-level encryption for sensitive data at rest.
 *
 * Wallet card numbers / CVVs and account credentials are stored in D1
 * columns named `*_encrypted`. Before this module existed those columns
 * received plaintext (the API code contained a "TODO: encrypt" note), so the
 * claim "encrypted at rest" was not true.
 *
 * Implementation:
 *   - AES-GCM 256, fresh random 96-bit IV per value
 *   - Key derived from the `SESSION_SECRET` Worker secret via SHA-256
 *   - Stored format:  v1:<base64(iv || ciphertext)>
 *   - Values that do not start with `v1:` are treated as legacy plaintext and
 *     returned unchanged (so older rows stay readable and can be re-saved).
 *
 * Requires the SESSION_SECRET secret to be configured:
 *   npx wrangler secret put SESSION_SECRET
 * When it is missing, `encryptionAvailable()` returns false and the write
 * endpoints refuse to store sensitive fields (503) instead of silently
 * persisting plaintext.
 */

const PREFIX = "v1:";
const IV_BYTES = 12;

export class EncryptionUnavailableError extends Error {
  constructor() {
    super(
      "SESSION_SECRET is not configured, so sensitive fields cannot be encrypted. " +
        "Set it with `npx wrangler secret put SESSION_SECRET`.",
    );
    this.name = "EncryptionUnavailableError";
  }
}

export function encryptionAvailable(env: { SESSION_SECRET?: string }): boolean {
  return typeof env.SESSION_SECRET === "string" && env.SESSION_SECRET.trim().length >= 16;
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Encrypt a sensitive value for storage in D1. */
export async function encryptSecret(
  env: { SESSION_SECRET?: string },
  plaintext: string,
): Promise<string> {
  if (!encryptionAvailable(env)) throw new EncryptionUnavailableError();
  const key = await deriveKey(env.SESSION_SECRET as string);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plaintext),
    ),
  );
  const combined = new Uint8Array(iv.length + ciphertext.length);
  combined.set(iv, 0);
  combined.set(ciphertext, iv.length);
  return PREFIX + toBase64(combined);
}

/**
 * Decrypt a stored value. Legacy plaintext (no `v1:` prefix) is returned
 * unchanged so existing rows keep working.
 */
export async function decryptSecret(
  env: { SESSION_SECRET?: string },
  stored: string | null,
): Promise<string | null> {
  if (stored === null) return null;
  if (!stored.startsWith(PREFIX)) return stored;
  if (!encryptionAvailable(env)) throw new EncryptionUnavailableError();
  const raw = fromBase64(stored.slice(PREFIX.length));
  const iv = raw.slice(0, IV_BYTES);
  const ciphertext = raw.slice(IV_BYTES);
  const key = await deriveKey(env.SESSION_SECRET as string);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
