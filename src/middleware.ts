/**
 * Persora — Next.js middleware.
 *
 * Edge-level gatekeeper. It only checks for the presence of the session
 * cookie (cheap, no database round-trip); real session validation and
 * role-based authorization happen server-side in:
 *
 *   - src/app/(dashboard)/layout.tsx   → getCurrentUser()  (any signed-in user)
 *   - src/app/(admin)/layout.tsx       → role === "admin"
 *   - src/lib/api.ts                   → withAuth() / withAdmin() on every API
 *
 * Public pages never require a session, authenticated users are bounced away
 * from the auth pages, and every other route inside the application
 * (workspace + admin console) requires a session.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "persora_session";

/** Publicly reachable pages (exact match). */
const PUBLIC_PAGES = new Set([
  "/",
  "/about",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
  "/login",
  "/register",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin/login",
]);

/** Publicly reachable prefixes (assets, public APIs, blog articles). */
const PUBLIC_PREFIXES = [
  "/api/auth/",
  "/api/contact",
  "/_next/",
  "/favicon.ico",
  "/blog/",
  "/robots.txt",
  "/sitemap.xml",
];

/** Auth screens: a signed-in user should not see these. */
const AUTH_PAGES = new Set([
  "/login",
  "/register",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin/login",
]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_PAGES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function redirectTo(request: NextRequest, pathname: string, callbackUrl?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (callbackUrl && callbackUrl !== pathname) {
    url.searchParams.set("callbackUrl", callbackUrl);
  }
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Public website, static assets and auth APIs are always reachable.
  if (isPublic(pathname)) {
    // Signed-in users do not need the sign-in / sign-up screens.
    if (hasSession && AUTH_PAGES.has(pathname)) {
      return redirectTo(
        request,
        pathname === "/admin/login" ? "/admin" : "/overview",
      );
    }
    return NextResponse.next();
  }

  // API routes answer for themselves (withAuth/withAdmin return 401/403 JSON).
  // Redirecting them would break fetch() callers and mask the real status.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Admin console: unauthenticated visitors go to the admin sign-in screen.
  // Role checks happen in the admin layout and in every /api/admin handler.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!hasSession) {
      return redirectTo(request, "/admin/login", pathname);
    }
    return NextResponse.next();
  }

  // Everything else is the authenticated workspace.
  if (!hasSession) {
    return redirectTo(request, "/login", pathname + (search || ""));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match every request except Next.js static assets, image optimisation
     * and files with an extension (fonts, images, css, js).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff|woff2|ttf|otf)$).*)",
  ],
};
