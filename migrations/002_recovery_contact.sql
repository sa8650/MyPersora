-- ============================================================================
-- Persora — Migration 002
-- Password recovery tokens + public contact submissions.
--
-- Additive only: no existing table or row is modified or dropped.
-- Run with:
--   npx wrangler d1 execute persora-db --remote --file=./migrations/002_recovery_contact.sql
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Password recovery
-- Only the SHA-256 hash of the token is stored, never the token itself.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_resets (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  used_at    TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id    ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

-- ---------------------------------------------------------------------------
-- Public contact form submissions (visible in the Admin Console)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'new', -- new | read | archived
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status     ON contact_messages(status);
