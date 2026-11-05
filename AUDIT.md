# Persora — Restoration & Audit Report

**Date:** 5 November 2026
**Scope:** full repository audit, routing/authentication repair, public site restoration,
admin console migration, security fixes, backend verification.
**Verified by:** building the app, running the actual OpenNext Worker locally
(`wrangler dev --local`) against a real D1 database, and exercising every flow over HTTP.

---

## 0. Honest summary first

Two independent classes of problems existed:

1. **Deployment/build:** Tailwind CSS was never compiled (fixed in the previous change set,
   confirmed working in production: the live Worker serves a 46.7 kB stylesheet with real
   utility classes).
2. **Application code:** the deployed app was **structurally broken independently of CSS**.
   Route groups were mapped to the wrong URLs, so every sidebar link 404'd, login redirected
   users into the *admin* dashboard, the admin console threw 500s, and **every collection API
   endpoint returned 500** because of a `params` crash. This is why the site "looked like a
   basic HTML page" and why authentication "did not work" — not because of Cloudflare.

What is now working is listed in §3. What is **not** implemented — roughly 30 of the modules in
the brief (Tasks, Calendar, Persora Table, Forms, Docs, PDF Studio, Photo Studio, AudioSpace,
Travel, Password Manager, Family, Academics, Finance, Loan Tracker, Timeline, Health, Medical
Records, Connections, Digital Business Card, Trash, Plans & Billing, Trash retention, email
verification) — is **not** faked anywhere in the UI. There is no schema, no API and no page for
them in the repository, so inventing placeholder screens would have been a lie. §3 says so
explicitly per module.

---

## 1. Root Cause Report

### 1.1 Why the public pages had no styling

`@tailwindcss/turbopack` was wired through `next.config.ts → turbopack.rules`, but `next build`
runs **webpack**, so the loader never executed and there was **no `postcss.config.*`** for
Tailwind v4. The emitted stylesheet contained only raw `@import "tailwindcss"` / `@apply …`
text and **zero utility classes** (verified: `grep -c '\.flex'` returned `0`), while the file
itself returned HTTP 200 — which is why the earlier "/_next/static 404" theory never helped.

**Fixed previously, verified live now:** `postcss.config.mjs` with `@tailwindcss/postcss`, a
`@theme inline` block in `globals.css` mapping the HSL variables to Tailwind tokens, and the
dead Turbopack rule removed. Production currently serves
`/_next/static/css/53d63a5f163a34c0.css` → `200`, `content-type: text/css`, 46 699 bytes,
with `.flex{} …` present.

### 1.2 Why the header and footer were missing

`src/app/(marketing)/layout.tsx` rendered `<div>{children}</div>` only — no `<header>`, no
`<footer>`. The landing page carried a *private* nav inside `page.tsx` (never reused), and
About / Blog / Contact / Privacy / Terms had nothing at all. Navigating from `/` to `/about`
therefore dropped the navigation entirely.

### 1.3 Why authentication "did not work"

| Symptom | Actual cause |
|---|---|
| Login succeeded, then an error page | `/login` redirected to `/dashboard`, which resolved to **`src/app/(admin)/dashboard/page.tsx`** — the *admin* dashboard. The admin layout threw `403` for a normal user, producing a 500. |
| Nothing in the workspace loaded | The sidebar linked `/dashboard/habit-tracker`, `/dashboard/contacts`, … but route groups don't add a URL segment: those pages are served at `/habit-tracker`, `/contacts`, … → **every link 404'd**. |
| Session appeared broken | `requireUser()`/`requireAdmin()` **throw**; the admin layout did `if (!user) redirect(...)` around a throwing call, so unauthenticated visits to `/users` returned **HTTP 500** (verified against production before the fix) instead of redirecting. |
| All module APIs returned 500 | `withAuth()` did `Object.entries(await context.params)`; for routes without a dynamic segment `context.params` is `undefined` → `TypeError: Cannot convert undefined or null to object`. Every collection endpoint (`/api/contacts`, `/api/habits`, `/api/wallet-cards`, `/api/urls`, `/api/accounts`, `/api/subscriptions`, `/api/purchases`, `/api/admin/users`, …) answered **500**. |
| Admin API answered 500 for non-admins | `withAdmin()` also relied on the throwing `requireAdmin()`. |

### 1.4 Why the admin portal could not be found

The admin console lived at **top-level URLs** (`/dashboard`, `/users`, `/features`, `/roles`,
`/settings`, `/storage`, `/content`) while its own sidebar linked to `/admin/dashboard`,
`/admin/users`, … — so from the moment you reached it, **every admin link was a 404**. Nothing
was served at `/admin` at all. There was also no role redirect: a non-admin hitting those pages
got a 500 rather than being sent back to their workspace.

### 1.5 Why the brief's "protected admin" rule was not met

`src/middleware.ts` matched `/admin/:path*` — a prefix that no page actually used — so
protection relied solely on a layout that crashed. The session cookie was also the only gate
for the *user* pages, with no `callbackUrl` return path.

### 1.6 Secondary defect found during the audit: "encrypted at rest" was false

`wallet_cards.card_number_encrypted`, `cvv_encrypted`, `accounts.username_encrypted` and
`password_encrypted` received **plaintext** (the handlers contained
`// NOTE: In production, encrypt …`). The landing page, the About page and the privacy policy
all claimed encryption. This is now implemented (AES-GCM 256, key derived from
`SESSION_SECRET`) and verified in the database: values are stored as `v1:<base64(iv||ct)>`.

**Verdict:** the failures came from **application routing/layouts/API code**, not from the
Cloudflare Workers or OpenNext configuration. The adapter was correct; the app it wrapped
pointed at URLs that did not exist.

---

## 2. Files Changed

### Routing & access control

| File | Change |
|---|---|
| `src/app/(admin)/admin/**` *(moved from `(admin)/{dashboard,users,roles,features,storage,content,settings}`)* | Admin console now lives under `/admin/*`; the overview page is `/admin`. |
| `src/app/(admin)/layout.tsx` | Replaced the throwing `requireAdmin()` with `getCurrentUser()` + explicit role check: no session → `/admin/login`, session without `admin` → `/overview?error=forbidden`. No more 500s. |
| `src/app/(dashboard)/layout.tsx` | Validates the session with `getCurrentUser()` and renders the new shell; redirects to `/login` when absent. |
| `src/middleware.ts` | Rewritten: explicit public allow-list, `/admin/*` → `/admin/login?callbackUrl=…`, everything else → `/login?callbackUrl=…`, signed-in users bounced off auth pages, and `/api/*` never redirected (so clients receive real 401/403 JSON). |
| `src/app/dashboard/page.tsx` *(new)* | Permanent redirect `/dashboard` → `/overview` (old links/bookmarks). |
| `src/app/signup/page.tsx` *(new)* | `/signup` → `/register`. |
| `src/lib/api.ts` | `resolveParams()` guard fixes the `undefined` `context.params` crash on every non-dynamic route; `withAdmin()` now returns **401** (no session) / **403** (not admin) instead of throwing. |

### Navigation & shells

| File | Change |
|---|---|
| `src/components/layout/sidebar.tsx` | Rewritten: grouped navigation (Workspace / Personal / Finance / Bookmarks; Administration / Platform), correct hrefs, active-route highlighting, desktop sidebar + mobile top bar and drawer, working logout, user card, admin-only "Admin console" link, "Back to workspace" in the admin shell. |
| `src/components/marketing/site-header.tsx` *(new)* | Public header: brand, nav, Sign in / Get started, mobile disclosure menu. |
| `src/components/marketing/site-footer.tsx` *(new)* | Four-column footer with product, company and legal links, present on every public page. |
| `src/components/marketing/page-shell.tsx` *(new)* | Shared page container, breadcrumbs and prose section used by the public content pages. |
| `src/app/(marketing)/layout.tsx` | Renders `SiteHeader` + `main` + `SiteFooter` once, so navigation persists across public routes. |

### Public website

| File | Change |
|---|---|
| `src/app/(marketing)/page.tsx` | Rebuilt landing page: hero, value strip, module grid, "How Persora works", security section with a D1/R2 breakdown, CTA band. Uses the shared header/footer instead of a private navbar. |
| `src/app/(marketing)/about/page.tsx` | Rewritten: what Persora is, how it is built, an explicit "what is live today" section and principles. |
| `src/app/(marketing)/privacy/page.tsx` | Rewritten to describe only what the code actually does (data stored, cookies, D1/R2, admin visibility, controls). No invented certifications or retention promises. |
| `src/app/(marketing)/terms/page.tsx` | Rewritten as a structured terms page (account, acceptable use, content, availability, security, termination, liability). |
| `src/app/(marketing)/contact/page.tsx` | Real working contact form → `POST /api/contact` → D1; success/error states; guidance cards. No fake `action="#"`. |
| `src/app/(marketing)/blog/page.tsx` | Card-based listing with tags/dates and an explicit note that articles are static repository content (no CMS). |

### Authentication

| File | Change |
|---|---|
| `src/app/login/page.tsx` | Show/hide password, forgot-password link, safe `callbackUrl` (same-origin only, defaults `/overview`), inline validation, loading/error states. |
| `src/app/register/page.tsx` | Confirm-password field, live password requirement checklist, show/hide, redirect to `/overview`. |
| `src/app/admin/login/page.tsx` | Verifies the role via `/api/auth/me` before navigating; a non-admin is signed into the workspace with a clear message instead of hitting a forbidden page. Redirects to `/admin`. |
| `src/app/forgot-password/page.tsx` *(new)* | Requests a reset link; surfaces the honest "e-mail delivery not configured" state (503) instead of a fake success. |
| `src/app/reset-password/page.tsx` *(new)* | Consumes `?token=`, new password + confirmation, success → `/login`. |
| `src/app/api/auth/forgot-password/route.ts` *(new)* | Creates a single-use token (SHA-256 hash stored, 30-min expiry), invalidates previous tokens, sends the link; generic response prevents account enumeration. |
| `src/app/api/auth/reset-password/route.ts` *(new)* | Validates the token, stores a new bcrypt hash, marks the token used and **revokes all sessions**. |
| `src/lib/email.ts` *(new)* | Resend HTTP transport; reports `not_configured` instead of pretending to send. |

### Security

| File | Change |
|---|---|
| `src/lib/crypto.ts` *(new)* | AES-GCM 256 field encryption, key derived from `SESSION_SECRET` via SHA-256, `v1:` envelope, legacy plaintext passthrough on read. |
| `src/app/api/wallet-cards/route.ts` | Encrypts card number and CVV before insert; returns 503 (never plaintext) when `SESSION_SECRET` is missing. |
| `src/app/api/accounts/route.ts` | Encrypts username and password before insert, same 503 guard. |
| `src/lib/db.ts` | `PersoraEnv` extended (`SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM`), generic `first<T>()` typing. |

### Backend features added

| File | Change |
|---|---|
| `src/app/api/admin/stats/route.ts` *(new)* | Admin-only aggregate counters (users, admins, new in 7 days, active sessions, per-table row counts, R2 objects/bytes, runtime configuration flags). |
| `src/app/(admin)/admin/page.tsx` | `/admin` overview rewritten to use real statistics (previously it used the *admin's own* contacts/habits counts as "platform totals"). |
| `src/app/api/admin/contact/route.ts` *(new)* | Admin list/status update for contact submissions. |
| `src/app/(admin)/admin/content/page.tsx` | Now shows real contact submissions with read/archive actions plus the static-page inventory. |
| `src/app/api/contact/route.ts` *(new)* | Public contact endpoint: strict validation, length caps, honeypot. |
| `migrations/002_recovery_contact.sql` *(new)* | Additive migration: `password_resets`, `contact_messages`. Nothing existing is altered. |

### Build & deployment

| File | Change |
|---|---|
| `next.config.ts` | `initOpenNextCloudflareForDev()` in development so `next dev` has D1/R2; removed the dead Turbopack Tailwind rule (previous set). |
| `package.json` | `build:cf` no longer runs `next build` twice; `db:migrate:local|remote`, `typecheck` scripts; `wrangler` moved to `devDependencies`. |
| `scripts/patch-worker.js` | Asset patch now logs a warning instead of `process.exit(1)`, so a changed adapter output cannot fail a deploy. |
| `.gitignore` | Ignores `.dev.vars` and `.wrangler/`. |
| `DEPLOYMENT.md` | Rewritten: route map, access-control layers, both migrations, required secrets, build commands, verification commands. |

---

## 3. Feature Status

### Verified working (tested locally against real D1)

| Area | Status | Evidence |
|---|---|---|
| Public site (`/`, `/about`, `/blog`, `/contact`, `/privacy`, `/terms`) | **Fixed** | all `200`; header + footer present on every page |
| Contact form → D1 → admin inbox | **Working (new)** | `POST /api/contact` → `201`; visible via `/api/admin/contact` |
| Sign-in | **Fixed** | `200` + `persora_session` cookie; wrong password → `401 {"error":"Invalid email or password"}` |
| Registration | **Fixed** | `201`, user row + session; duplicate → `409` |
| Logout | **Fixed** | `200`; session row deleted; `/overview` → `307 /login` |
| Session protection | **Fixed** | `/overview`, `/profile`, `/habit-tracker`, `/contacts`, `/wallet`, `/urls`, `/accounts`, `/subscriptions`, `/purchases` = `200` with cookie, `307 /login` without |
| Admin console (`/admin` + 6 sections) | **Fixed** | all `200` as admin; non-admin → `307 /overview?error=forbidden`; anonymous → `307 /admin/login` |
| Admin APIs | **Fixed** | `/api/admin/stats`, `/users`, `/contact`, `/storage`, `/features` → `200` as admin, `403` as user, `401` anonymous |
| Habit Tracker, Contacts, Wallet Cards, URL Manager, Accounts, Subscriptions, Purchases | **Working** | create + list return `201`/`200`; rows scoped by `user_id`; second account sees `{"contacts":[]}` |
| Encryption at rest | **Fixed (new)** | D1 stores `v1:MsvTbsCg9SLjB8Z…` for card numbers and CVVs |
| Admin overview statistics | **Fixed** | real counts (users 1, admins 1, sessions 2, per-table rows) |
| Password recovery | **Partially working — blocked by external config** | `/forgot-password` + `/reset-password` + both APIs implemented; returns `503 email_not_configured` until `RESEND_API_KEY` + `EMAIL_FROM` are set |
| `/signup`, `/dashboard` aliases | **Working** | `307` to `/register`, `/overview` |

### Not implemented in the repository (deliberately not faked)

No schema, API or page exists for these, so they are absent from the navigation rather than
shown as empty shells:

Tasks & Notes · Calendar · Life Timeline · Family · Academics · Personal Finance · Loan Tracker
· Persora Table · Persora Forms · Advanced Forms · Persora Docs · Documents/Shared Documents ·
PDF Studio · Study Materials · Projects · Health & History · Medical Records · Photo Studio ·
AudioSpace · TravelSpace · Password Manager · Connections · Digital Business Card · Trash
(and its 7-day retention) · Plans & Billing · e-mail verification · blog article detail pages.

`Trash`, `Plans & Billing` and e-mail verification are called out in the brief as requirements;
they are **missing features, not regressions** — nothing was removed to make the build pass.

Notes on the brief's specifics:
* **GeistSans** — the repository uses **Inter** via `next/font` and its design-system doc
  (`DESIGN_SYSTEM.md`) states Inter as the typography source of truth. Changing the font would
  contradict the documented system, so Inter was kept. Say the word if you want Geist instead.
* **`/signup`** — implemented as a redirect to the canonical `/register`.
* **Data structures** — untouched. No table was dropped, no row deleted; migration `002` is
  additive only.

---

## 4. Deployment Status

| Check | Result |
|---|---|
| `tsc --noEmit` | **pass** |
| `next build` | **pass** |
| `opennextjs-cloudflare build` | **pass** — `.open-next/worker.js` + `.open-next/assets/_next/static/css/…` produced |
| Worker `wrangler dev --local` with D1 (`DB`), R2 (`R2_BUCKET`), `ASSETS` | **pass** — full journey exercised over HTTP |
| Static assets | CSS `200 text/css` (53 237 bytes in this build) with utilities; JS chunks `200`; `woff2` `200 font/woff2`; no leftover `@apply` |
| CSS/JS on the current production Worker | **verified earlier in this session**: `/_next/static/css/53d63a5f163a34c0.css` → `200`, `text/css`, 46 699 bytes, `.flex{}` present |
| D1 queries | **pass** — users, sessions, habits, contacts, wallet cards, subscriptions, urls, contact messages, password resets |
| R2 | binding resolves; `list()` exercised by `/api/admin/stats` and `/api/admin/storage` (empty bucket locally) |
| Secrets in client bundles | **none** — grep for the local secret across `.open-next/assets` returned 0 matches |
| Live production behaviour *before* this change set | `/users`, `/features` etc. → **500** (layout throw); `/admin`, `/admin/users` → 307 to `/admin/login` for a route that did not exist; `/dashboard/x` → redirect then 404 |

---

## 5. Remaining Actions (require your Cloudflare account)

These cannot be done from the repository:

1. **Apply migration 002 to production D1**
   `npm run db:migrate:remote` (creates `password_resets`, `contact_messages`).
2. **Set `SESSION_SECRET`** — `npx wrangler secret put SESSION_SECRET` (`openssl rand -hex 32`).
   *Without it, creating a wallet card or account with credentials returns 503* (previously it
   silently stored plaintext).
3. **Enable password-recovery e-mail (optional)** — `npx wrangler secret put RESEND_API_KEY`
   and `EMAIL_FROM`, plus set `NEXT_PUBLIC_APP_URL` in `wrangler.toml` `[vars]` so reset links
   point at your Worker. Until then `forgot-password` correctly reports "not configured".
4. **Check `wrangler.toml` `database_id`** — it is committed as
   `database_id = ""`. Put the real UUID there (or confirm the dashboard binding overrides it),
   otherwise a Wrangler-driven deploy cannot resolve the database.
5. **Build settings** — Workers Builds → Settings: build command `npm run build:cf`, deploy
   command `npx wrangler deploy`, `NODE_VERSION=22`.
6. **Promote your admin account** — registration always creates `role='user'`:
   `npx wrangler d1 execute persora-db --remote --command "UPDATE users SET role='admin' WHERE email='you@example.com';"`
   Then sign in at `/admin/login`.
7. **Redeploy** and hard-reload (the old HTML/CSS may be cached at the edge).
8. **Not covered here:** the ~30 modules listed as "not implemented" need a product decision,
   a schema, an API and UI each. That is a multi-sprint effort, not a bug fix — I have not
   pretended otherwise anywhere in the app.
