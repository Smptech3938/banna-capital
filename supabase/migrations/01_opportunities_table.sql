-- ============================================================
-- Phase 3 · Migration 01 — Opportunities Table
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Create enums
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE opportunity_status AS ENUM ('active', 'closed', 'upcoming');

-- 2. Create table
CREATE TABLE IF NOT EXISTS opportunities (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  category      TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  roi           NUMERIC(5,2) NOT NULL,              -- e.g. 18.00 = 18%
  duration_months INTEGER NOT NULL,
  min_investment NUMERIC(12,2) NOT NULL,
  risk_level    risk_level NOT NULL DEFAULT 'medium',
  image_url     TEXT,                                -- path or URL to image
  status        opportunity_status NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
--    Anyone authenticated can READ active opportunities
CREATE POLICY "Anyone can view active opportunities"
  ON opportunities
  FOR SELECT
  USING (true);

--    Only admins can INSERT / UPDATE / DELETE
CREATE POLICY "Admins can manage opportunities"
  ON opportunities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
