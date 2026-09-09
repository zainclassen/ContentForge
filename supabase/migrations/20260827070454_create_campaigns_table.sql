/*
# Create campaigns table (single-tenant, no auth)

1. New Tables
- `campaigns`
  - `id` (uuid, primary key)
  - `topic` (text, not null) — the content topic/brief
  - `objective` (text, not null) — Conversion / Awareness / Engagement
  - `audience` (text, not null) — target audience description
  - `tone` (text, not null) — tone of voice
  - `result` (jsonb, not null) — the full generated content package
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)

2. Security
- Enable RLS on `campaigns`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  objective text NOT NULL DEFAULT 'Conversion',
  audience text NOT NULL DEFAULT 'General audience',
  tone text NOT NULL DEFAULT 'Professional',
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_campaigns" ON campaigns;
CREATE POLICY "anon_select_campaigns" ON campaigns FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_campaigns" ON campaigns;
CREATE POLICY "anon_insert_campaigns" ON campaigns FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_campaigns" ON campaigns;
CREATE POLICY "anon_update_campaigns" ON campaigns FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_campaigns" ON campaigns;
CREATE POLICY "anon_delete_campaigns" ON campaigns FOR DELETE
  TO anon, authenticated USING (true);
