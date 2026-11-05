# Persora — Deployment Guide

Persora runs as a **Next.js 15 App Router** application on **Cloudflare Workers** through
**OpenNext for Cloudflare** (`@opennextjs/cloudflare`), with **Cloudflare D1** as the database
and **R2** for object storage.

> Last verified: building and running the Worker locally (`wrangler dev --local`) on
> 5 November 2026 — all public pages, the workspace, the admin console, authentication and
> the module APIs were exercised against a real D1 database. See `AUDIT.md`.

---

## 1. Architecture

| Component | Technology | Notes |
|---|---|---|
| Runtime | Cloudflare Workers | `compatibility_date` + `nodejs_compat` |
| Adapter | `@opennextjs/cloudflare` | Output: `.open-next/worker.js` + `.open-next/assets/` |
| Database | Cloudflare D1 (SQLite) | binding `DB` |
| Storage | Cloudflare R2 | binding `R2_BUCKET` |
| Auth | Application-managed | bcrypt hashes + D1 sessions, `persora_session` cookie |
| Styling | Tailwind CSS v4 | compiled through `postcss.config.mjs` (`@tailwindcss/postcss`) |

### Route map

Route groups (`(marketing)`, `(dashboard)`, `(admin)`) do **not** add a URL segment.

**Public website** — shared header and footer from `src/app/(marketing)/layout.tsx`

| Route | File |
|---|---|
| `/` | `src/app/(marketing)/page.tsx` |
| `/about` | `src/app/(marketing)/about/page.tsx` |
| `/blog` | `src/app/(marketing)/blog/page.tsx` |
| `/contact` | `src/app/(marketing)/contact/page.tsx` |
| `/privacy` | `src/app/(marketing)/privacy/page.tsx` |
| `/terms` | `src/app/(marketing)/terms/page.tsx` |

**Authentication**

| Route | Purpose |
|---|---|
| `/login` | user sign-in |
| `/register` (`/signup` redirects here) | registration |
| `/forgot-password` | request reset link |
| `/reset-password?token=…` | set a new password |
| `/admin/login` | administrator sign-in |

**User workspace** — `src/app/(dashboard)/`, guarded by `getCurrentUser()`

`/overview`, `/profile`, `/habit-tracker`, `/contacts`, `/wallet`, `/accounts`,
`/subscriptions`, `/purchases`, `/urls`
(`/dashboard` is a permanent redirect to `/overview`.)

**Admin console** — `src/app/(admin)/admin/`, guarded by `role === "admin"`

`/admin`, `/admin/users`, `/admin/roles`, `/admin/features`, `/admin/storage`,
`/admin/content`, `/admin/settings`

### Access control layers

1. `src/middleware.ts` — cookie presence only (fast edge gate). Public/asset/auth-API paths
   pass through; `/api/*` is never redirected (handlers answer 401/403 themselves).
2. `src/app/(dashboard)/layout.tsx` — validates the session against D1 on every request.
3. `src/app/(admin)/layout.tsx` — additionally requires the `admin` role, otherwise
   redirects to `/overview?error=forbidden`.
4. `src/lib/api.ts` — `withAuth()` / `withAdmin()` on every route handler.

---

## 2. First-time setup

```bash
npm install

# 1. Create the database and bucket (once)
npx wrangler d1 create persora-db          # copy the database_id into wrangler.toml
npx wrangler r2 bucket create persora-assets

# 2. Apply both migrations (schema + recovery/contact tables)
npm run db:migrate:remote

# 3. Required secrets
npx wrangler secret put SESSION_SECRET     # openssl rand -hex 32 — used to encrypt sensitive fields
npx wrangler secret put RESEND_API_KEY     # optional: enables password-recovery e-mails
npx wrangler secret put EMAIL_FROM         # optional: e.g. "Persora <no-reply@yourdomain>"
```

Set `NEXT_PUBLIC_APP_URL` in `wrangler.toml` → `[vars]` to the Worker URL; reset links use it.

> `SESSION_SECRET` is **required** for Wallet Cards and Accounts: card numbers, CVVs and
> account credentials are AES-GCM encrypted before insert. Without it those write endpoints
> return `503` instead of storing plaintext.

### Local development

```bash
npm run db:migrate:local                 # creates the local D1 database
echo 'SESSION_SECRET="local-dev-secret-please-replace-32chars"' > .dev.vars   # git-ignored
npm run preview                          # wrangler dev (real Worker + local D1/R2)
```

`npm run dev` also works: `next.config.ts` calls `initOpenNextCloudflareForDev()` so the D1/R2
bindings are available to `next dev`.

---

## 3. Deploy

```bash
npm run build:cf   # opennextjs-cloudflare build + non-fatal asset patch
npm run deploy     # wrangler deploy
```

GitHub-connected builds (Workers Builds → Connect to Git):

* Build command: `npm run build:cf`
* Deploy command: `npx wrangler deploy`
* Set build variable `NODE_VERSION=22` (Wrangler 4 requires Node ≥ 22)

`wrangler.toml` must contain the real `database_id` and the bindings:

```toml
[[d1_databases]]
binding = "DB"
database_name = "persora-db"
database_id = "<uuid from `wrangler d1 create persora-db`>"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "persora-assets"

[assets]
directory = ".open-next/assets"
binding = "ASSETS"
```

---

## 4. Verify a deployment

```bash
BASE=https://<your-worker>.workers.dev

# stylesheet is real Tailwind output, not an empty file
CSS=$(curl -s $BASE/ | grep -o '/_next/static/css/[^"]*' | head -1)
curl -s -o /tmp/app.css -w '%{http_code} %{content_type}\n' "$BASE$CSS"
grep -c '\.flex{' /tmp/app.css     # expected: > 0

# public site + header/footer
curl -s $BASE/ | grep -c 'All rights reserved'

# guard rails
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' $BASE/overview      # 307 → /login
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' $BASE/admin         # 307 → /admin/login
curl -s -o /dev/null -w '%{http_code}\n' $BASE/api/admin/stats               # 401 when anonymous
```

---

## 5. Administrator accounts

Registration always creates `role = 'user'`. Promote an existing account once, deliberately:

```bash
npx wrangler d1 execute persora-db --remote \
  --command "UPDATE users SET role='admin' WHERE email='you@example.com';"
```

Then sign in at `/admin/login`. The admin console is never reachable from the user workspace
unless the account actually carries the role.

---

## 6. Operational notes

* `scripts/patch-worker.js` is a fallback asset patch. Cloudflare already serves
  `.open-next/assets` through the `[assets]` binding, so the script logs a warning and
  **does not fail the build** if the adapter output changes.
* `npm run build:cf` no longer runs `next build` twice (OpenNext runs the Next build itself).
* Fonts are self-hosted at build time by `next/font/google`, so no runtime font requests
  leave the Worker.
* Keep `package.json` and `package-lock.json` in sync — Cloudflare's build uses `npm ci`.
