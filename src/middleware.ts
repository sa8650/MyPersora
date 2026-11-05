/**
 * Persora — Next.js middleware.
 *
 * Route protection (cookie presence only; full session validation against D1
 * happens in server layouts/API route handlers). On Cloudflare Pages this
 * middleware runs at the edge before a route is rendered.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "persora_session";

/** Public routes that never require a session. */
const PUBLIC_PREFIXES = ["/api/", "/_next/", "/favicon.ico", "/auth"];

function hasSession(request: NextRequest): boolean {
  return request.cookies.has(SESSION_COOKIE);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static / API / auth routes.
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/login" || pathname === "/admin/login";

  // Dashboard routes require a session.
  if (isDashboard) {
    if (!hasSession(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    // Already logged in on /login -> go to dashboard.
    if (isLogin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Admin routes require a session.
  if (isAdmin) {
    if (!hasSession(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Auth pages: redirect authenticated users out.
  if (isLogin && hasSession(request)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/admin/login",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
