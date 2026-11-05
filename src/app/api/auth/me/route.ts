/**
 * Persora — GET /api/auth/me
 *
 * Returns the currently authenticated user (validated against D1), or 401.
 */

import { NextResponse } from "next/server";
import { getEnv } from "@/lib/context";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const env = getEnv();
  if (!env) {
    return NextResponse.json({ error: "Configuration unavailable" }, { status: 500 });
  }

  const user = await getCurrentUser(env);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
