# Purchases & Warranty Manager — Feature Documentation

## Purpose

Track purchases, receipts, and warranty coverage for owned items.

## Functionality

- Record purchases (title, description, brand, model, category, purchase date,
  price, currency, warranty months, serial number, notes).
- View warranty status (Active / Expiring soon / Expired / No warranty).
- Filter by category.
- Edit and delete purchase records.

## User Workflows

1. Navigate to `/dashboard/purchases`.
2. View purchases in a table with warranty badges.
3. Filter by category.
4. Add/edit/delete purchases.

## UI Structure

- Page title: `text-display-4-bold` ("Purchases & Warranty").
- Table with item, brand/model, category, price, purchased date, warranty
  badge.
- Warranty badge color: secondary (active), outline (expiring/none),
  destructive (expired).

## Database Requirements

- `purchases` — id, user_id, title, description, brand, model, category,
  purchase_date, purchase_price, currency, warranty_months, serial_number,
  receipt_url (R2 object path), notes, created_at, updated_at.
- Indexes on user_id, category, warranty_expires.

## API / Server-side Logic

- `GET /api/purchases` — list purchases (optional `category` filter).
- `POST /api/purchases` — create purchase (zod validation).
- `GET/PUT/DELETE /api/purchases/[id]` — purchase CRUD.

All require `withAuth`.

## Permissions

- Authenticated users only.
- User-scoped queries.

## Validations

- `title`: required, 1–200 chars.
- `description`: max 1000 chars.
- `brand`/`model`: max 100 chars.
- `category`: max 100 chars.
- `purchase_price`: non-negative number.
- `currency`: 3-letter code (default USD).
- `warranty_months`: non-negative integer.
- `serial_number`: max 100 chars.
- `notes`: max 1000 chars.

## Important Dependencies

- Cloudflare R2 for `receipt_url` (file uploads).
- `src/lib/api.ts` — `withAuth`.