-- ============================================================
-- Pave Sunrise Drive — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── Pledges table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pledges (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT        NOT NULL CHECK (char_length(name) >= 2),
  house_number  TEXT,
  amount        NUMERIC(10,2) NOT NULL CHECK (amount >= 100),
  message       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anyone to read pledges (public leaderboard)
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pledges_select" ON pledges FOR SELECT USING (true);
CREATE POLICY "pledges_insert" ON pledges FOR INSERT WITH CHECK (true);


-- ── Messages table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name   TEXT        NOT NULL CHECK (char_length(author_name) >= 2),
  content       TEXT        NOT NULL CHECK (char_length(content) >= 5),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anyone to read and post messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (true);


-- ── Enable Realtime (run these separately if needed) ─────────────────────────
-- In Supabase: Database → Replication → check "pledges" and "messages" tables
-- Or run:
ALTER PUBLICATION supabase_realtime ADD TABLE pledges;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
