# Habit Tracker — Feature Documentation

## Purpose

Let users build and track daily, weekly, or monthly routines by logging
completion entries per day.

## Functionality

- Create habits with name, description, frequency (daily/weekly/monthly), and
  target count.
- List active habits with today's completion status.
- Mark a habit complete for today (increments count, sets completed flag).
- View habit entries over time.
- Edit or delete habits.

## User Workflows

1. Navigate to `/dashboard/habit-tracker`.
2. Fill the "Add habit" form (name, frequency) and submit.
3. New habit appears in "Today's Habits" table.
4. Click the + button to log completion for today.
5. Use Refresh to reload data.

## UI Structure

- Page title: `text-display-4-bold` ("Habit Tracker").
- Add form: `Input` + `Label` + `Button` in a grid.
- Table: `table` with `thead`/`tbody`, `Badge` for frequency, `Button` ghost for
  actions.
- Skeleton loader while fetching.

## Database Requirements

- `habits` — id, user_id, name, description, frequency, target, is_active,
  created_at, updated_at.
- `habit_entries` — id, habit_id, user_id, date, count, completed,
  created_at, updated_at. Unique index on (habit_id, date).

## API / Server-side Logic

- `GET /api/habits?active=1` — list active habits for user.
- `POST /api/habits` — create habit (zod validation).
- `GET /api/habit-entries` — list entries (filters: habit_id, from, to).
- `POST /api/habit-entries` — upsert entry (ON CONFLICT on habit_id + date).
- `GET/PUT/DELETE /api/habits/[id]` — habit CRUD.

All require `withAuth`.

## Permissions

- Authenticated users only.
- All queries scoped by `user_id` — users cannot access other users' habits.

## Validations

- `name`: required, 1–100 chars.
- `frequency`: daily | weekly | monthly.
- `target`: positive integer 1–1000.
- `date`: YYYY-MM-DD format.
- `count`: non-negative integer.

## Important Dependencies

- `src/components/ui/button.tsx`, `input.tsx`, `label.tsx`, `badge.tsx`,
  `separator.tsx`, `tabs.tsx`.
- `src/lib/api.ts` — `withAuth`.
- `src/lib/db.ts` — D1 helpers.