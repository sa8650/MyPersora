/**
 * Persora — Cloudflare environment accessor.
 *
 * Provides the D1 / R2 / secret bindings to server-side code (Server
 * Components, Route Handlers, Server Actions) during an active request.
 * Returns undefined outside a request (e.g. static build time), which is
 * expected: Persora's data is dynamic, never build-time.
 *
 * Source: @opennextjs/cloudflare (getCloudflareContext).
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { PersoraEnv } from "./db";

export function getEnv(): PersoraEnv | undefined {
  let context: { env?: unknown } | undefined;
  try {
    context = getCloudflareContext({ async: false });
  } catch {
    // No Cloudflare context available (e.g. outside an active request).
    return undefined;
  }
  return context?.env as PersoraEnv | undefined;
}

export function requireEnv(): PersoraEnv {
  const env = getEnv();
  if (!env) {
    throw new Error(
      "Cloudflare environment bindings are unavailable outside an active request.",
    );
  }
  return env;
}
