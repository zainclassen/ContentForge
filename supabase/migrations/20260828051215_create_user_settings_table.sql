/*
# Create user_settings table (single-tenant, no auth)

1. New Tables
- `user_settings`
  - `id` (int, primary key, always 1 — singleton row)
  - `name` (text)
  - `email` (text)
  - `bio` (text)
  - `avatar_url` (text)
  - `social_links` (jsonb) — { tiktok, instagram, twitter, linkedin, facebook, youtube }
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `user_settings`.
- Allow anon + authenticated CRUD (no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS user_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name text DEFAULT '',
  email text DEFAULT '',
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  social_links jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO user_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_user_settings" ON user_settings;
CREATE POLICY "anon_select_user_settings" ON user_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_user_settings" ON user_settings;
CREATE POLICY "anon_insert_user_settings" ON user_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_user_settings" ON user_settings;
CREATE POLICY "anon_update_user_settings" ON user_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_user_settings" ON user_settings;
CREATE POLICY "anon_delete_user_settings" ON user_settings FOR DELETE
  TO anon, authenticated USING (true);
