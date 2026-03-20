-- ============================================================
-- Sunrise Drive Paving — Supabase RLS Fix
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. Settings table (create if missing) ─────────────────────
-- This table stores project-wide settings like project_goal.
-- If it already exists, the CREATE TABLE is safely skipped.

CREATE TABLE IF NOT EXISTS settings (
  id         bigint generated always as identity primary key,
  key        text   unique not null,
  value      text   not null,
  created_at timestamptz default now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ── 2. RLS policies: messages ──────────────────────────────────
-- Allows the admin panel to delete chat messages.

DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages"
  ON messages
  FOR DELETE
  TO anon
  USING (true);

-- ── 3. RLS policies: pledges ───────────────────────────────────
-- Allows the admin panel to delete and edit (UPDATE) pledge records.

DROP POLICY IF EXISTS "anon_delete_pledges" ON pledges;
CREATE POLICY "anon_delete_pledges"
  ON pledges
  FOR DELETE
  TO anon
  USING (true);

DROP POLICY IF EXISTS "anon_update_pledges" ON pledges;
CREATE POLICY "anon_update_pledges"
  ON pledges
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ── 4. RLS policies: settings ─────────────────────────────────
-- Allows the admin panel to read, insert, and update settings
-- (e.g. saving a new project_goal value).

DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings"
  ON settings
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings"
  ON settings
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings"
  ON settings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ── 5. Pledge transaction log (append-only audit trail) ───────
-- A separate table that accumulates every pledge, update, and
-- deletion event. Never has a DELETE policy — records stay forever.

CREATE TABLE IF NOT EXISTS pledge_log (
  id           bigint generated always as identity primary key,
  created_at   timestamptz default now(),
  type         text    not null,   -- 'pledge' | 'update' | 'delete'
  house_number text,
  name         text,
  amount       numeric,
  message      text
);

ALTER TABLE pledge_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pledge_log" ON pledge_log;
CREATE POLICY "anon_select_pledge_log"
  ON pledge_log FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_insert_pledge_log" ON pledge_log;
CREATE POLICY "anon_insert_pledge_log"
  ON pledge_log FOR INSERT TO anon WITH CHECK (true);

-- Note: intentionally NO delete policy on pledge_log.
-- The transaction log is append-only by design.

-- ── Done! ──────────────────────────────────────────────────────
-- After running, all admin operations should work:
--   • Moderation  → Delete message
--   • Finances    → Update Project Goal (persists across reloads)
--   • Finances    → Edit / save a pledge record
--   • Finances    → Delete / remove a pledge record
--   • Transactions → Full append-only audit trail of all pledge events
