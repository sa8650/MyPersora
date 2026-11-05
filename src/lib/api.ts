/**
 * Persora — API route helpers.
 *
 * Wraps Next.js Route Handlers with application-managed session validation
 * against Cloudflare D1. All mutating endpoints require authentication; admin
 * endpoints require the admin role. Route `params` are forwarded to handlers.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { PersoraEnv } from "@/lib/db";
import { getEnv } from "@/lib/context";
import { getCurrentUser, type PersoraUser } from "@/lib/auth";

type ResolvedParams = { [key: string]: string };

type RouteContext = {
  params: Promise<{ [key: string]: string }>;
};

type InnerHandler = (
  request: NextRequest,
  user: PersoraUser,
  env: PersoraEnv,
  context: { params: ResolvedParams },
) => Promise<Response> | Response;

/** Require authentication, then run the handler with (request, user, env, context). */
export function withAuth(handler: InnerHandler) {
  return async (
    request: NextRequest,
    context: RouteContext,
  ): Promise<Response> => {
    const env = getEnv();
    if (!env) {
      return NextResponse.json({ error: "Configuration unavailable" }, { status: 500 });
    }
    const user = await getCurrentUser(env);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(request, user, env as PersoraEnv, {
      params: await resolveParams(context),
    });
  };
}

/** Require the admin role, then run the handler. */
export function withAdmin(handler: InnerHandler) {
  return async (
    request: NextRequest,
    context: RouteContext,
  ): Promise<Response> => {
    const env = getEnv();
    if (!env) {
      return NextResponse.json({ error: "Configuration unavailable" }, { status: 500 });
    }
    // Resolve the session first so an unauthenticated caller gets 401 and a
    // signed-in non-admin gets 403 — `requireAdmin()` throws, which surfaced
    // as an unhandled 500 from every /api/admin/* endpoint.
    const user = await getCurrentUser(env);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(request, user, env as PersoraEnv, {
      params: await resolveParams(context),
    });
  };
}

/**
 * Route handlers without a dynamic segment (e.g. /api/contacts) receive
 * `context.params === undefined`. Calling Object.entries() on that threw a
 * TypeError, so every collection endpoint answered 500. Always resolve to an
 * object.
 */
async function resolveParams(context: RouteContext | undefined): Promise<ResolvedParams> {
  const rawParams = (await context?.params) ?? {};
  const resolved: ResolvedParams = {};
  for (const [key, value] of Object.entries(rawParams)) {
    resolved[String(key)] = String(value);
  }
  return resolved;
}

/** Parse JSON body or return 400. */
export async function parseBody(request: NextRequest): Promise<{
  ok: true;
  body: unknown;
} | { ok: false; response: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }
  return { ok: true, body };
}
