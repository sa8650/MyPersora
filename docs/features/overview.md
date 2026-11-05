# Overview — Feature Documentation

## Purpose

The Overview module is the landing dashboard of the Persora User Console. It
gives the user a quick snapshot of activity across all personal management
modules and provides one-click entry points to each feature.

## Functionality

- Displays key stats: active habits, contacts, wallet cards, active
  subscriptions.
- Grid of module cards linking to each workspace feature.
- Loading skeletons while stats are fetched.
- Responsive layout (stacked on mobile, multi-column on desktop).

## User Workflows

1. User signs in and lands on `/dashboard` (Overview).
2. Stats load asynchronously from the feature APIs.
3. User clicks a module card to navigate to that feature.

## UI Structure

- Page title: `text-display-4-bold` ("Overview").
- Intro text: `text-body-medium` + `text-muted-foreground`.
- Stat cards using `Card` + `CardHeader` + `CardTitle` + `CardContent` +
  `Badge`.
- Module grid using `Card` (hover:shadow-md, cursor-pointer) with `IconTile`
  style icons and `CardTitle`/`CardDescription`.

## Database Requirements

Reads from (via API):

- `habits` (is_active = 1)
- `contacts`
- `wallet_cards`
- `subscriptions` (status = 'active')

No writes.

## API / Server-side Logic

- `GET /api/habits?active=1` — count active habits.
- `GET /api/contacts` — count contacts.
- `GET /api/wallet-cards` — count cards.
- `GET /api/subscriptions?status=active` — count active subscriptions.

All endpoints require authentication (`withAuth`).

## Permissions

- Authenticated users only (`withAuth`).
- Users see only their own data (user_id-scoped queries).

## Validations

- None (read-only dashboard). API routes validate session only.

## Important Dependencies

- `src/components/layout/sidebar.tsx` — persistent workspace navigation.
- `src/components/ui/card.tsx`, `badge.tsx` — ReUI primitives.
- `src/lib/api.ts` — `withAuth` wrapper.
- `src/lib/context.ts` — Cloudflare env accessor.