-- ============================================================
-- Phase 3 · Migration 02 — Investments Table
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Create investment status enum
CREATE TYPE investment_status AS ENUM (
  'pending',
  'approved',
  'active',
  'completed',
  'rejected'
);

-- 2. Drop the old investments table if it exists (Phase 1 placeholder)
DROP TABLE IF EXISTS investments;

-- 3. Create the investments table with proper relations
CREATE TABLE investments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  amount          NUMERIC(12,2) NOT NULL,
  status          investment_status NOT NULL DEFAULT 'pending',
  invested_at     TIMESTAMPTZ DEFAULT now(),
  maturity_date   DATE,
  profit          NUMERIC(12,2),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes for common queries
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_opportunity_id ON investments(opportunity_id);
CREATE INDEX idx_investments_status ON investments(status);

-- 5. Enable RLS
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Users can view their own investments
CREATE POLICY "Users can view own investments"
  ON investments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert investments for themselves
CREATE POLICY "Users can create own investments"
  ON investments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all investments
CREATE POLICY "Admins can view all investments"
  ON investments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Admins can update any investment (approve, reject, complete)
CREATE POLICY "Admins can update investments"
  ON investments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
