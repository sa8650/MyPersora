# URL Manager — Feature Documentation

## Purpose

Organize, tag, and favorite bookmarks with visit tracking.

## Functionality

- Save URLs with title, URL, description, category, tags, favorite flag.
- Filter by category.
- Click to open bookmark (tracks visit).
- Edit and delete bookmarks.
- View visit count and last visited.

## User Workflows

1. Navigate to `/dashboard/urls`.
2. Filter by category chips (All, or specific categories).
3. Click a bookmark title to open it in a new tab.
4. Add/edit/delete via API-backed forms.

## UI Structure

- Page title: `text-display-4-bold` ("URL Manager").
- Category filter chips: `Button` outline/secondary.
- Table with title link, hostname, category, tags (badges), visit count.
- Star icon for favorites.

## Database Requirements

- `urls` — id, user_id, title, url, description, category, tags (JSON array
  string), is_favorite, visit_count, last_visited, created_at, updated_at.
- Indexes on user_id, category, is_favorite.

## API / Server-side Logic

- `GET /api/urls` — list URLs (optional `category` filter).
- `POST /api/urls` — create URL (zod validation; tags stored as JSON).
- `GET/PUT/DELETE /api/urls/[id]` — URL CRUD.

All require `withAuth`.

## Permissions

- Authenticated users only.
- User-scoped queries.

## Validations

- `title`: required, 1–200 chars.
- `url`: valid URL, max 1000 chars.
- `description`: max 1000 chars.
- `category`: max 100 chars.
- `tags`: array of strings.

## Important Dependencies

- `src/lib/api.ts` — `withAuth`.