# Persora — Personal Management Platform

Persora is a modern, secure personal management SaaS for individual users and
administrators. Built with React, Next.js, TypeScript, Cloudflare D1 (SQLite)
and Cloudflare R2, it provides a unified workspace for habits, contacts, wallet
cards, URLs, accounts, subscriptions, and purchases — all with a consistent
ReUI design system.

## Core Features

### User Console (workspace)
1. **Overview** — Dashboard with key stats across all modules.
2. **Habit Tracker** — Build and track daily/weekly/monthly routines.
3. **Contacts Manager** — Google Contacts-style address book with favorites.
4. **Wallet Cards** — Securely saved payment & currency cards (encrypted at rest).
5. **URL Manager** — Organize, tag and favorite bookmarks.
6. **Account Manager** — Internet and bank account records (encrypted credentials).
7. **Subscription Manager** — Recurring billing and renewal tracking.
8. **Purchases & Warranty Manager** — Track purchases and warranty coverage.
9. **Profile & Settings** — Account details and preferences.
10. **Logout**

### Admin Console
- User management, roles & access control (RBAC)
- Feature & module activation/deactivation
- Database & R2 storage management
- Public website content management
- Platform settings, monitoring & administration

### Public Website
- Landing Page, About, Contact, Blog, Privacy Policy, Terms of Service

## Technology Stack

- **TypeScript** — type safety throughout
- **React** + **Next.js** (App Router)
- **Cloudflare D1** — SQLite database (users, sessions, all feature data)
- **Cloudflare R2** — object storage (avatars, receipts, uploads)
- **Tailwind CSS v4** — styling
- **ReUI** design system (shadcn/ui-aligned primitives)
- **bcryptjs** — password hashing (cost 12)
- **Zod** — request validation
- **React Hook Form** — form management
- **Lucide React** — icons

## Repository Structure

```
persora/
├── README.md
├── DEPLOYMENT.md
├── DESIGN_SYSTEM.md
├── migrations/
│   └── schema.sql              # Cloudflare D1 schema
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── wrangler.toml               # Cloudflare Workers configuration
├── open-next.config.ts         # OpenNext for Cloudflare configuration
├── .wranglerignore             # Wrangler deployment exclusions
├── middleware.ts               # Route protection
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (theme + toasts)
│   │   ├── globals.css         # Design tokens + typography (52 tokens)
│   │   ├── (dashboard)/        # User Console
│   │   │   ├── layout.tsx      # Persistent workspace sidebar
│   │   │   ├── overview/
│   │   │   ├── habit-tracker/
│   │   │   ├── contacts/
│   │   │   ├── wallet/
│   │   │   ├── urls/
│   │   │   ├── accounts/
│   │   │   ├── subscriptions/
│   │   │   ├── purchases/
│   │   │   └── profile/
│   │   ├── (admin)/            # Admin Console
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── features/
│   │   │   ├── storage/
│   │   │   ├── content/
│   │   │   └── settings/
│   │   ├── (marketing)/        # Public Website
│   │   │   ├── page.tsx        # Landing
│   │   │   ├── about/, contact/, blog/, privacy/, terms/
│   │   ├── login/
│   │   ├── register/
│   │   ├── admin/login/
│   │   └── api/                # Route Handlers
│   │       ├── auth/           # register, login, logout, me
│   │       ├── habits, contacts, wallet-cards, urls, accounts
│   │       ├── subscriptions, purchases
│   │       └── admin/          # users, features, storage, settings
│   ├── components/
│   │   ├── ui/                 # ReUI primitives (button, input, card, …)
│   │   ├── layout/             # Sidebar, workspace shell
│   │   └── features/           # Feature-specific components
│   ├── lib/
│   │   ├── utils.ts            # cn() + typography token merging
│   │   ├── db.ts               # D1 helpers + PersoraEnv
│   │   ├── auth.ts             # bcrypt, sessions, RBAC
│   │   ├── api.ts              # withAuth / withAdmin wrappers
│   │   └── context.ts          # Cloudflare env accessor
│   └── middleware.ts
├── docs/features/              # Per-feature documentation
│   ├── overview.md
│   ├── habit-tracker.md
│   ├── contacts-manager.md
│   ├── wallet-cards.md
│   ├── url-manager.md
│   ├── account-manager.md
│   ├── subscription-manager.md
│   └── purchases-warranty.md
├── .env.example                # Placeholder values only (never commit real .env)
└── .gitignore
```

## Authentication & Security

- Custom application-managed authentication — no Supabase Auth, Google auth, or
  third-party auth services. (Google sign-in may be added later.)
- Passwords hashed with bcrypt (cost 12).
- Sessions stored in D1; session token in a secure `HttpOnly`, `SameSite=Lax`
  cookie.
- Protected routes via Next.js middleware + server-side session validation.
- Role-Based Access Control (RBAC): `admin` and `user` roles.
- Secrets (D1/R2 bindings, `SESSION_SECRET`) live exclusively in Cloudflare
  environment variables — never in source code or Git.
- `.env.example` contains placeholder values only. Never commit real `.env`.

## Design System — ReUI

Persora follows the Persora Design System (ReUI-aligned):

- Centralized typography tokens (52 total: 13 families × 4 weights) per
  `uploads/typography.txt`.
- Global theme colors: Sidebar RGB(23,23,23) / RGB(247,247,247); Workspace
  RGB(18,18,18) / RGB(255,255,255).
- Light and dark theme support via `next-themes`.
- ReUI component primitives: Button, Input, Label, Card, Badge, Dialog,
  Popover, Tabs, ScrollArea, Separator, Avatar, Switch, Skeleton, IconStack,
  IconTile, Link.
- `cn()` utility with typography-token class merging.

See `DESIGN_SYSTEM.md` for the complete design token reference.

## Documentation

- `README.md` — this file (project overview)
- `DEPLOYMENT.md` — step-by-step GitHub + Cloudflare Pages deployment
- `DESIGN_SYSTEM.md` — design tokens, typography, ReUI standards
- `docs/features/` — per-feature documentation

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Type check
npx tsc --noEmit

# Build for Cloudflare Workers (Next.js build + OpenNext adaptation)
npm run build:cf

# Deploy to Cloudflare Workers
npm run deploy

# Local preview
npm run preview

# Lint
npm run lint
```

## Deployment

Persora is designed for Cloudflare Workers with Next.js via OpenNext. See
`DEPLOYMENT.md` for the full step-by-step guide covering GitHub integration,
Cloudflare Workers deployment, D1 database creation, R2 bucket setup,
environment variables, and custom domain configuration.

## License

Private — Persora Personal Management Platform.