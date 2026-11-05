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
import { getCurrentUser, requireAdmin, type PersoraUser } from "@/lib/auth";

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
    const rawParams = await context.params;
    const resolvedParams: ResolvedParams = {};
    for (const [key, value] of Object.entries(rawParams)) {
      resolvedParams[String(key)] = String(value);
    }
    return handler(request, user, env as PersoraEnv, { params: resolvedParams });
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
    const user = await requireAdmin(env);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rawParams = await context.params;
    const resolvedParams: ResolvedParams = {};
    for (const [key, value] of Object.entries(rawParams)) {
      resolvedParams[String(key)] = String(value);
    }
    return handler(request, user, env as PersoraEnv, { params: resolvedParams });
  };
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
