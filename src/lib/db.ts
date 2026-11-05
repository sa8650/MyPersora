/**
 * Persora — Database (Cloudflare D1) helpers.
 *
 * D1 is a SQL database. All queries are parameterised to prevent SQL
 * injection. The binding is injected by Cloudflare (Pages / Workers) and must
 * never be hard-coded or committed.
 *
 * The D1Database, D1Result and R2Bucket types are declared locally to avoid a
 * peer-dependency conflict between @cloudflare/next-on-pages (which expects
 * @cloudflare/workers-types@^4) and the latest workers-types@5. Cloudflare
 * Pages provides these types natively at build time.
 */

/** Minimal local type declarations for Cloudflare D1 (SQLite). */
interface D1PreparedStatement {
  bind(...params: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<{ results: T[]; meta?: unknown }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

interface D1Result {
  results: unknown[];
  meta?: unknown;
}

interface R2Bucket {
  list(options?: unknown): Promise<{ objects: unknown[] }>;
}

export interface PersoraEnv {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  /** Signing / encryption key material. Required for field-level encryption. */
  SESSION_SECRET: string;
  /** Absolute URL of the deployment, used in e-mails (e.g. reset links). */
  NEXT_PUBLIC_APP_URL?: string;
  /** Transactional e-mail provider key (Resend). Optional — see lib/email.ts. */
  RESEND_API_KEY?: string;
  /** From address for transactional e-mail. */
  EMAIL_FROM?: string;
}

/** Run a parameterised D1 query and return the first row's columns array. */
export async function dbQuery(
  db: D1Database,
  sql: string,
  params: unknown[] = [],
): Promise<D1Result> {
  return db.prepare(sql).bind(...params).run();
}

/** Run a parameterised D1 query and return raw results. */
export async function dbSelect(
  db: D1Database,
  sql: string,
  params: unknown[] = [],
): Promise<D1Result> {
  return db.prepare(sql).bind(...params).all();
}

/** Run a parameterised D1 query and return the first row. */
export async function dbSelectOne(
  db: D1Database,
  sql: string,
  params: unknown[] = [],
): Promise<Record<string, unknown> | null> {
  const result = await db.prepare(sql).bind(...params).first();
  return result ? (result as Record<string, unknown>) : null;
}

export type { D1Database, D1Result, R2Bucket };
