/*
# Create generations table (single-tenant, no auth)

1. New Tables
- `generations`
  - `id` (uuid, primary key)
  - `tool` (text, not null) — 'text' | 'image' | 'code' | 'social'
  - `prompt` (text, not null) — the user's input prompt
  - `options` (jsonb) — tool-specific options (contentType, artStyle, language, objective, audience, tone)
  - `result` (jsonb, not null) — the generated output
  - `created_at` (timestamptz, default now)

2. Security
- Enable RLS on `generations`.
- Allow anon + authenticated CRUD (no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool text NOT NULL,
  prompt text NOT NULL,
  options jsonb DEFAULT '{}'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_generations" ON generations;
CREATE POLICY "anon_select_generations" ON generations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_generations" ON generations;
CREATE POLICY "anon_insert_generations" ON generations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_generations" ON generations;
CREATE POLICY "anon_update_generations" ON generations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_generations" ON generations;
CREATE POLICY "anon_delete_generations" ON generations FOR DELETE
  TO anon, authenticated USING (true);
