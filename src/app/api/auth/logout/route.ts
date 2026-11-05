/**
 * Persora — POST /api/auth/logout
 *
 * Destroys the session (D1 row + cookie) and responds OK.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/context";
import { destroySession } from "@/lib/auth";

export async function POST() {
  const env = getEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get("persora_session")?.value;

  if (env && token) {
    await destroySession(env);
  } else {
    cookieStore.delete("persora_session");
  }

  return NextResponse.json({ ok: true });
}
