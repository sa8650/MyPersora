/**
 * Persora — GET/PATCH /api/admin/contact
 *
 * Contact submissions from the public website. Admins can read them and move
 * them between `new`, `read` and `archived`.
 */

import type { PersoraEnv } from "@/lib/db";
import { withAdmin } from "@/lib/api";

async function listHandler(_request: Request, _user: unknown, env: PersoraEnv) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, email, subject, message, status, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 100",
    ).all();
    return Response.json({ messages: results ?? [] });
  } catch {
    return Response.json({ messages: [], error: "contact_messages table not available" });
  }
}

async function patchHandler(request: Request, _user: unknown, env: PersoraEnv) {
  let body: { id?: string; status?: string };
  try {
    body = (await request.json()) as { id?: string; status?: string };
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.id || !body.status || !["new", "read", "archived"].includes(body.status)) {
    return Response.json({ error: "id and a valid status are required" }, { status: 400 });
  }
  await env.DB.prepare("UPDATE contact_messages SET status = ? WHERE id = ?")
    .bind(body.status, body.id)
    .run();
  return Response.json({ ok: true });
}

export const GET = withAdmin(listHandler);
export const PATCH = withAdmin(patchHandler);
