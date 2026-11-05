-- ============================================================================
-- Persora — Cloudflare D1 Schema (SQLite)
-- ============================================================================
-- Run via: wrangler d1 execute persora-db --file=./migrations/schema.sql
-- Never commit seed data with real credentials.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Users & sessions (authentication)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name         TEXT,
  role         TEXT NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id   ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ---------------------------------------------------------------------------
-- Habit Tracker
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habits (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  frequency    TEXT NOT NULL DEFAULT 'daily', -- daily | weekly | monthly
  target       INTEGER NOT NULL DEFAULT 1,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

CREATE TABLE IF NOT EXISTS habit_entries (
  id          TEXT PRIMARY KEY,
  habit_id    TEXT NOT NULL,
  user_id     TEXT NOT NULL,
  date        TEXT NOT NULL, -- YYYY-MM-DD
  count       INTEGER NOT NULL DEFAULT 0,
  completed   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_entries_habit_date ON habit_entries(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_entries_user_id ON habit_entries(user_id);

-- ---------------------------------------------------------------------------
-- Contacts Manager (Google Contacts-style)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  first_name   TEXT,
  last_name    TEXT,
  email        TEXT,
  phone        TEXT,
  company      TEXT,
  job_title    TEXT,
  address      TEXT,
  notes        TEXT,
  avatar_url   TEXT, -- R2 object path
  is_favorite  INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id   ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email     ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_favorite  ON contacts(is_favorite);

-- ---------------------------------------------------------------------------
-- Wallet Cards (saved currency & payment cards; sensitive fields encrypted)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallet_cards (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL,
  cardholder_name   TEXT,
  card_number_encrypted TEXT NOT NULL,
  card_number_last4 TEXT NOT NULL,
  brand             TEXT, -- visa | mastercard | amex | ...
  expiry_month      INTEGER,
  expiry_year       INTEGER,
  cvv_encrypted     TEXT,
  currency          TEXT NOT NULL DEFAULT 'USD',
  type              TEXT NOT NULL DEFAULT 'payment', -- payment | currency
  balance           REAL DEFAULT 0,
  is_active         INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_wallet_cards_user_id ON wallet_cards(user_id);

-- ---------------------------------------------------------------------------
-- URL Manager (bookmarks)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS urls (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  description  TEXT,
  category     TEXT,
  tags         TEXT, -- JSON array string
  is_favorite  INTEGER NOT NULL DEFAULT 0,
  visit_count  INTEGER NOT NULL DEFAULT 0,
  last_visited TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_urls_user_id      ON urls(user_id);
CREATE INDEX IF NOT EXISTS idx_urls_category     ON urls(category);
CREATE INDEX IF NOT EXISTS idx_urls_favorite     ON urls(is_favorite);

-- ---------------------------------------------------------------------------
-- Account Manager (internet & bank account records)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL,
  type               TEXT NOT NULL, -- internet | bank
  provider_name      TEXT NOT NULL,
  account_name       TEXT,
  account_number_masked TEXT,
  username_encrypted TEXT,
  password_encrypted TEXT,
  url                TEXT,
  notes              TEXT,
  is_active          INTEGER NOT NULL DEFAULT 1,
  created_at         TEXT NOT NULL,
  updated_at         TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type    ON accounts(type);

-- ---------------------------------------------------------------------------
-- Subscription Manager
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  name          TEXT NOT NULL,
  provider      TEXT NOT NULL,
  category      TEXT,
  amount        REAL NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  interval      TEXT NOT NULL DEFAULT 'monthly', -- monthly | yearly | weekly
  start_date    TEXT,
  renewal_date  TEXT,
  status        TEXT NOT NULL DEFAULT 'active', -- active | cancelled | paused | past_due
  payment_method_id TEXT, -- references wallet_cards.id
  notes         TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ---------------------------------------------------------------------------
-- Purchases & Warranty Manager
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  brand          TEXT,
  model          TEXT,
  category       TEXT,
  purchase_date  TEXT,
  purchase_price REAL,
  currency       TEXT NOT NULL DEFAULT 'USD',
  warranty_months INTEGER,
  warranty_expires TEXT,
  serial_number  TEXT,
  receipt_url    TEXT, -- R2 object path
  notes          TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id     ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_category    ON purchases(category);
CREATE INDEX IF NOT EXISTS idx_purchases_warranty_exp ON purchases(warranty_expires);

-- ---------------------------------------------------------------------------
-- End of schema
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Feature flags & platform settings (admin)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feature_flags (
  id           TEXT PRIMARY KEY,
  name         TEXT UNIQUE NOT NULL,
  description  TEXT,
  enabled      INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);

CREATE TABLE IF NOT EXISTS platform_settings (
  id          TEXT PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,
  value       TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);

-- ---------------------------------------------------------------------------
-- End of schema
-- ============================================================================
