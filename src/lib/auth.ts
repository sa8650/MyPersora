/**
 * Persora — Custom application-managed authentication (Cloudflare D1).
 *
 * - Password hashing: bcryptjs (bcrypt, cost 12)
 * - Sessions: secure HTTP-only same-site cookie containing a random token
 *   validated against D1 `sessions` table
 * - Roles: RBAC (admin / user)
 *
 * Never use Supabase Auth, Google auth, or third-party auth. Google sign-in
 * may be added later behind the same session model.
 */

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { dbSelect, dbSelectOne, dbQuery, type PersoraEnv } from "./db";

const BCRYPT_COST = 12;
const SESSION_COOKIE_NAME = "persora_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type UserRole = "admin" | "user";

export interface PersoraUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

/** Hash a plaintext password with bcrypt. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

/** Verify a plaintext password against a bcrypt hash. */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Generate a cryptographically random session token. */
export function generateSessionToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

/** Look up a user by email from D1. */
export async function getUserByEmail(
  env: PersoraEnv,
  email: string,
): Promise<PersoraUser | null> {
  const row = await dbSelectOne(
    env.DB,
    "SELECT id, email, name, role FROM users WHERE email = ?",
    [email],
  );
  if (!row) return null;
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    role: (row.role as UserRole) ?? "user",
  };
}

/** Look up a user by id from D1. */
export async function getUserById(
  env: PersoraEnv,
  id: string,
): Promise<PersoraUser | null> {
  const row = await dbSelectOne(
    env.DB,
    "SELECT id, email, name, role FROM users WHERE id = ?",
    [id],
  );
  if (!row) return null;
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    role: (row.role as UserRole) ?? "user",
  };
}

/** Create a user in D1. */
export async function createUser(
  env: PersoraEnv,
  email: string,
  passwordHash: string,
  name: string | null,
  role: UserRole = "user",
): Promise<PersoraUser> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await dbQuery(
    env.DB,
    `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, email, passwordHash, name, role, now, now],
  );
  return { id, email, name, role };
}

/** Validate a session token from D1 and return the user, or null. */
export async function validateSession(
  env: PersoraEnv,
  token: string,
): Promise<PersoraUser | null> {
  const row = await dbSelectOne(
    env.DB,
    `SELECT u.id, u.email, u.name, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > ?`,
    [token, new Date().toISOString()],
  );
  if (!row) return null;
  // Refresh expiry on activity.
  await dbQuery(
    env.DB,
    `UPDATE sessions SET expires_at = ? WHERE id = ?`,
    [
      new Date(Date.now() + SESSION_TTL_MS).toISOString(),
      token,
    ],
  );
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    role: (row.role as UserRole) ?? "user",
  };
}

/** Create a session in D1 and set the secure session cookie. */
export async function createSession(
  env: PersoraEnv,
  userId: string,
): Promise<void> {
  const token = generateSessionToken();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await dbQuery(
    env.DB,
    `INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
    [token, userId, expiresAt, now],
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

/** Remove the current session (cookie + D1 row). */
export async function destroySession(env: PersoraEnv): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await dbQuery(env.DB, "DELETE FROM sessions WHERE id = ?", [token]);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Read the current session cookie. */
export function getSessionToken(): string | undefined {
  // Note: cookies() is async; this sync helper is intentionally not used in
  // async server contexts. Prefer getCurrentUser(env).
  return undefined;
}

/** Get the currently authenticated user from the session cookie. */
export async function getCurrentUser(
  env: PersoraEnv,
): Promise<PersoraUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return validateSession(env, token);
}

/** Require authentication. Returns user or throws a 401 error. */
export async function requireUser(env: PersoraEnv): Promise<PersoraUser> {
  const user = await getCurrentUser(env);
  if (!user) {
    const error = new Error("Unauthorized") as Error & { status?: number };
    error.status = 401;
    throw error;
  }
  return user;
}

/** Require the admin role. Returns user or throws 401/403. */
export async function requireAdmin(env: PersoraEnv): Promise<PersoraUser> {
  const user = await requireUser(env);
  if (user.role !== "admin") {
    const error = new Error("Forbidden") as Error & { status?: number };
    error.status = 403;
    throw error;
  }
  return user;
}

/** Role-based access check helper. */
export function hasRole(user: PersoraUser | null, allowed: UserRole[]) {
  return !!user && allowed.includes(user.role);
}
