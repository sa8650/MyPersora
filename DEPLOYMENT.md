# Persora — Deployment Guide

Step-by-step instructions for deploying Persora to **Cloudflare Workers** with
GitHub integration, Cloudflare D1, Cloudflare R2, and secure environment
variables.

Persora uses **OpenNext** (`@opennextjs/cloudflare`) as its Cloudflare
deployment adapter. `@cloudflare/next-on-pages` is deprecated and is not used.
Cloudflare Pages was rejected because its 25 MiB per-file size limit cannot
accommodate Next.js build output (the Webpack cache alone exceeds 45 MiB).

## Deployment Architecture

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Deployment adapter | `@opennextjs/cloudflare` | Next.js on Cloudflare Workers |
| Build | Next.js 15.5.29 + OpenNext | Server-rendered App Router with API routes, adapted to Worker |
| Database | Cloudflare D1 (SQLite) | Users, sessions, habits, contacts, wallet cards, URLs, accounts, subscriptions, purchases, feature flags, settings |
| Storage | Cloudflare R2 | Avatars, receipts, file uploads |
| Auth | Custom (bcrypt + sessions) | Application-managed authentication, no third-party auth |
| Session cookie | `persora_session` | HttpOnly, SameSite=Lax, secure |
| Worker entry point | `.open-next/worker.js` | OpenNext-adapted Next.js server |

## Prerequisites

- A GitHub account with the Persora repository pushed.
- A Cloudflare account (https://dash.cloudflare.com).
- Wrangler CLI (optional, for local D1/R2 management):
  `npm install -g wrangler`

## Configuration Files

| File | Purpose |
|------|---------|
| `wrangler.toml` | Cloudflare Workers configuration (D1/R2 bindings, compatibility flags, worker entry point) |
| `open-next.config.ts` | OpenNext for Cloudflare configuration |
| `.wranglerignore` | Files excluded from deployment (source, cache, node_modules) |
| `next.config.ts` | Next.js build configuration |
| `package.json` | Build/deploy scripts (`build:cf`, `deploy`, `preview`) |

## Step 1 — Push the repository to GitHub

All development happens directly in the GitHub repository. Push the code:

```bash
git add .
git commit -m "Persora deployment-ready"
git push origin main
```

Never commit `.env` or real secret values. Use `.env.example` with placeholders
only.

## Step 2 — Create the D1 database

In the Cloudflare dashboard (or via Wrangler):

```bash
# Via Wrangler
wrangler d1 create persora-db
```

Note the `database_id` returned — you'll need it for the Workers binding.

Apply the schema:

```bash
wrangler d1 execute persora-db --file=./migrations/schema.sql
```

## Step 3 — Create the R2 bucket

```bash
wrangler r2 bucket create persora-assets
```

Note the bucket name and your Cloudflare account ID.

## Step 4 — Configure bindings and environment variables

In the Cloudflare dashboard for your Workers project:

**Workers & Pages → D1 Databases:**
- Bind the D1 database `persora-db` to the binding name `DB`.

**Workers & Pages → R2 Buckets:**
- Bind the R2 bucket `persora-assets` to the binding name `R2_BUCKET`.

**Workers & Pages → Environment variables → Production:**
Add the following variables (replace with real values):

| Variable | Value |
|----------|-------|
| `SESSION_SECRET` | A strong random string (e.g. `openssl rand -hex 32`) |
| `NEXT_PUBLIC_APP_URL` | `https://<your-project>.workers.dev` |

Do **NOT** add `SESSION_SECRET` to `.env.example` with a real value — use a
placeholder only.

## Step 5 — Deploy to Cloudflare Workers

### Option A: GitHub-connected deployment

1. Go to Cloudflare Dashboard → **Workers & Pages** → **Create application** →
   **Workers** → **Connect to Git**.
2. Select the Persora repository and branch (e.g. `main`).
3. Configure the build:
   - Build command: `npm run build:cf`
   - This runs `next build` then `opennextjs-cloudflare build`
4. Cloudflare will detect `wrangler.toml` and use it for the Worker
   configuration.
5. Click **Deploy site**.

### Option B: Manual deploy via Wrangler

```bash
# Build and adapt for Cloudflare
npm run build:cf

# Deploy to Workers
npm run deploy
# or: npx wrangler deploy
```

## Step 6 — Verify deployment

1. Visit the Cloudflare-provided Workers URL.
2. Register a user at `/register`.
3. Sign in at `/login` and verify the User Console workspace loads.
4. Sign in as an admin at `/admin/login` (you may need to insert an admin user
   directly into D1 initially):
   ```sql
   INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
   VALUES ('<uuid>', 'admin@example.com', '<bcrypt hash>', 'Admin', 'admin',
           datetime('now'), datetime('now'));
   ```
5. Verify admin routes (`/admin/users`, `/admin/features`, `/admin/storage`,
   `/admin/settings`).

## Step 7 — GitHub-triggered deployments

Once connected, every `git push` to the configured branch triggers an automatic
Cloudflare Workers deployment. Review deployment previews in the Cloudflare
dashboard before they go live.

## Step 8 — Custom domain (later)

When ready to migrate to a custom domain without disrupting users:

1. In Cloudflare Dashboard → **Workers & Pages** → **Domains** → **Add a domain**.
2. Follow the DNS configuration instructions.
3. Update `NEXT_PUBLIC_APP_URL` to the custom domain.
4. Cookies are domain-scoped; existing sessions remain valid as long as the
   domain cookie scope is compatible.
5. Data (D1 + R2) is untouched by domain changes — no migration required.

## Environment requirements

| Binding | Type | Purpose |
|---------|------|---------|
| `DB` | D1 Database | Users, sessions, habits, contacts, wallet cards, URLs, accounts, subscriptions, purchases, feature flags, settings |
| `R2_BUCKET` | R2 Bucket | Avatars, receipts, file uploads |
| `SESSION_SECRET` | Secret | Session cookie signing / encryption key material |

Never expose these in the repository.

## Local development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Type check
npx tsc --noEmit

# Build for Cloudflare Workers (Next.js + OpenNext adaptation)
npm run build:cf

# Local preview (wrangler dev)
npm run preview

# Deploy to Cloudflare Workers
npm run deploy
```

## Dependency integrity

`package.json` and `package-lock.json` must remain in sync. Cloudflare uses
`npm ci` which requires an exact match. After any dependency change:

```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
```

## Previous deployment errors (resolved)

1. **Asset size limit (45 MiB > 25 MiB)**: Cloudflare Pages rejects individual
   files over 25 MiB. The Webpack cache `0.pack` was 45 MiB. Migrating to
   Cloudflare Workers with OpenNext eliminates this — the worker bundle is
   produced from small source files (largest 4.4 MB) and stays well under the
   limit.

2. **Invalid wrangler.toml**: The previous `wrangler.toml` used Pages-specific
   `[build]` configuration and was missing `pages_build_output_dir`. Replaced
   with a valid Workers configuration pointing `main` to
   `.open-next/worker.js`.

3. **Deprecated adapter**: `@cloudflare/next-on-pages` is deprecated. Replaced
   with `@opennextjs/cloudflare`, Cloudflare's recommended Next.js adapter.

4. **Blank / white page (static assets return 404)**: After deploying to
   Cloudflare Workers, all `/_next/static/css/*` and `/_next/static/chunks/*`
   requests returned 404 because the OpenNext-generated worker does not serve
   static assets from `.open-next/assets/`. The worker needs an `env.ASSETS`
   binding and explicit `env.ASSETS.fetch()` calls for static routes.

   **Fix:**
   - Added `[assets]` section to `wrangler.toml`:
     ```toml
     [assets]
     directory = ".open-next/assets"
     binding = "ASSETS"
     ```
   - Created `scripts/patch-worker.js` which patches the OpenNext-generated
     `.open-next/worker.js` to call `env.ASSETS.fetch(request)` for
     `/_next/static/*` and `/favicon.ico` routes before falling through to the
     Next.js middleware/server function handler.
   - The `build:cf` script runs the patch after `opennextjs-cloudflare build`:
     ```json
     "build:cf": "next build && opennextjs-cloudflare build && node scripts/patch-worker.js"
     ```
   - In the Cloudflare dashboard, set the **Build command** to
     `npm run build:cf` (not `npx opennextjs-cloudflare build`) so the patch
     runs on every deployment.