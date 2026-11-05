# Subscription Manager — Feature Documentation

## Purpose

Track recurring subscriptions and upcoming renewals with spending totals.

## Functionality

- Create subscriptions (name, provider, category, amount, currency, interval,
  start/renewal dates, status, payment method, notes).
- Filter by status (active, cancelled, paused, past_due).
- View monthly total of active subscriptions.
- Edit and delete subscriptions.

## User Workflows

1. Navigate to `/dashboard/subscriptions`.
2. View active subscriptions and monthly total.
3. Filter by status chips.
4. Add/edit/delete subscriptions.

## UI Structure

- Page title: `text-display-4-bold` ("Subscription Manager").
- Monthly total stat (text-2xl font-bold).
- Status filter chips.
- Table with subscription name, provider, amount, interval, renewal date,
  status badge.
- `Switch` for status toggle in future versions.

## Database Requirements

- `subscriptions` — id, user_id, name, provider, category, amount, currency,
  interval, start_date, renewal_date, status, payment_method_id, notes,
  created_at, updated_at.
- Indexes on user_id, status.

## API / Server-side Logic

- `GET /api/subscriptions` — list subscriptions (optional `status` filter).
- `POST /api/subscriptions` — create subscription (zod validation).
- `GET/PUT/DELETE /api/subscriptions/[id]` — subscription CRUD.

All require `withAuth`.

## Permissions

- Authenticated users only.
- User-scoped queries.

## Validations

- `name`: required, 1–100 chars.
- `provider`: required, 1–100 chars.
- `amount`: positive number.
- `currency`: 3-letter code (default USD).
- `interval`: monthly | yearly | weekly.
- `status`: active | cancelled | paused | past_due.

## Important Dependencies

- `src/lib/api.ts` — `withAuth`.