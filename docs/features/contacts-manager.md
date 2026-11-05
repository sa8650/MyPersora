# Contacts Manager — Feature Documentation

## Purpose

Google Contacts-style address book for storing personal and professional
contacts with search and favorite support.

## Functionality

- Create contacts (first name, last name, email, phone, company, job title,
  address, notes, favorite flag, avatar URL).
- Search contacts by name, email, or company.
- Mark contacts as favorites.
- Edit and delete contacts.
- Click-to-email / click-to-call links.
- Avatar display with initials fallback.

## User Workflows

1. Navigate to `/dashboard/contacts`.
2. Search existing contacts or click "Add contact".
3. Fill the contact form and save.
4. Contact appears in the table (favorites first, then alphabetical).
5. Click email/phone to communicate; click trash to delete.

## UI Structure

- Page title: `text-display-4-bold` ("Contacts Manager").
- Search input: `Input` + `Label`.
- Table with `Avatar` (image or initials fallback), `Badge` for favorite star.
- Actions column with delete button.

## Database Requirements

- `contacts` — id, user_id, first_name, last_name, email, phone, company,
  job_title, address, notes, avatar_url, is_favorite, created_at, updated_at.
- Indexes on user_id, email, is_favorite.

## API / Server-side Logic

- `GET /api/contacts` — list contacts (optional `q` search, `favorite` filter).
- `POST /api/contacts` — create contact (zod validation).
- `GET/PUT/DELETE /api/contacts/[id]` — contact CRUD.

All require `withAuth`.

## Permissions

- Authenticated users only.
- User-scoped queries.

## Validations

- `email`: valid email format, max 200 chars.
- `phone`: max 50 chars.
- `first_name`/`last_name`: max 100 chars.
- `company`/`job_title`: max 100 chars.
- `address`: max 300 chars.
- `notes`: max 1000 chars.

## Important Dependencies

- `src/components/ui/avatar.tsx` — avatar with fallback.
- `src/lib/api.ts` — `withAuth`.