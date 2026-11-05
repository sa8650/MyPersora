# Wallet Cards — Feature Documentation

## Purpose

Securely manage saved payment and currency card details. Sensitive fields are
encrypted at rest; full card numbers and CVVs are never returned to the client.

## Functionality

- Save payment or currency cards (cardholder name, card number, brand, expiry,
  CVV, currency, type).
- View masked card numbers (•••• •••• •••• 1234) with last4 only.
- View brand, expiry, currency, type, balance.
- Mark cards active/inactive.
- Remove cards.

## User Workflows

1. Navigate to `/dashboard/wallet`.
2. View saved cards in a card grid.
3. Click Remove to delete a card.
4. (Add form available via API; UI focused on viewing/managing existing cards.)

## UI Structure

- Page title: `text-display-4-bold` ("Wallet Cards").
- Card grid: `Card` with masked number, currency, expiry, brand, balance.
- `Badge` for card type (payment/currency).
- Empty state when no cards saved.

## Database Requirements

- `wallet_cards` — id, user_id, cardholder_name, card_number_encrypted,
  card_number_last4, brand, expiry_month, expiry_year, cvv_encrypted, currency,
  type, balance, is_active, created_at, updated_at.
- Index on user_id.

## API / Server-side Logic

- `GET /api/wallet-cards` — list cards (excludes encrypted number & CVV).
- `POST /api/wallet-cards` — create card (stores encrypted fields).
- `GET/PUT/DELETE /api/wallet-cards/[id]` — card CRUD (safe fields only).

All require `withAuth`.

## Security Notes

- `card_number_encrypted` and `cvv_encrypted` stored in D1; encryption key
  derived from `SESSION_SECRET`.
- API never returns `card_number_encrypted` or `cvv_encrypted` to the client.
- Only `card_number_last4` is displayed.

## Permissions

- Authenticated users only.
- User-scoped queries.

## Validations

- `card_number`: 13–19 digits.
- `expiry_month`: 1–12.
- `expiry_year`: 2000–2100.
- `cvv`: 3–4 digits.
- `currency`: 3-letter code (default USD).
- `type`: payment | currency.

## Important Dependencies

- `src/lib/auth.ts` — encryption guidance (SESSION_SECRET).
- `src/lib/api.ts` — `withAuth`.