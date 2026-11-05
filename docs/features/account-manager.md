# Account Manager — Feature Documentation

## Purpose

Store internet and bank account records. Credentials are encrypted at rest and
never returned to the client.

## Functionality

- Save account records (type: internet | bank, provider name, account name,
  masked account number, username, password, URL, notes).
- View provider, type, account, masked number, status (active/inactive).
- Edit and delete records.
- Credentials hidden from the UI (stored encrypted).

## User Workflows

1. Navigate to `/dashboard/accounts`.
2. View saved accounts in a table.
3. Add new records via form (API).
4. Edit or remove records.

## UI Structure

- Page title: `text-display-4-bold` ("Account Manager").
- Table with provider icon, type badge, account details, status badge.
- Security note in CardFooter about encrypted credentials.

## Database Requirements

- `accounts` — id, user_id, type, provider_name, account_name,
  account_number_masked, username_encrypted, password_encrypted, url, notes,
  is_active, created_at, updated_at.
- Indexes on user_id, type.

## API / Server-side Logic

- `GET /api/accounts` — list accounts (excludes encrypted credentials).
- `POST /api/accounts` — create account (stores encrypted username/password).
- `GET/PUT/DELETE /api/accounts/[id]` — account CRUD (safe fields only).

All require `withAuth`.

## Security Notes

- `username_encrypted` and `password_encrypted` stored in D1; encryption key
  derived from `SESSION_SECRET`.
- API never returns encrypted credentials to the client.

## Permissions

- Authenticated users only.
- User-scoped queries.

## Validations

- `type`: internet | bank.
- `provider_name`: required, 1–100 chars.
- `account_name`: max 100 chars.
- `account_number_masked`: max 50 chars.
- `username`/`password`: max 100/200 chars.
- `url`: valid URL, max 500 chars.
- `notes`: max 1000 chars.

## Important Dependencies

- `src/lib/auth.ts` — encryption guidance.
- `src/lib/api.ts` — `withAuth`.