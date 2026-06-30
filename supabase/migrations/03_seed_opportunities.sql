-- ============================================================
-- Phase 3 · Migration 03 — Seed Opportunities
-- Run this in the Supabase SQL Editor AFTER 01 & 02
-- ============================================================

INSERT INTO opportunities (title, category, description, roi, duration_months, min_investment, risk_level, status)
VALUES
(
  'Premium Real Estate Fund',
  'Real Estate',
  'Invest in a diversified portfolio of premium residential and commercial properties across major Indian cities. This fund focuses on high-growth urban areas with strong rental yields and capital appreciation potential. Managed by experienced real estate professionals with a proven track record.',
  18.00,
  24,
  50000,
  'medium',
  'active'
),
(
  'Organic Agriculture Project',
  'Agriculture',
  'Support sustainable organic farming initiatives across fertile regions. This project covers crop cultivation, processing, and distribution with guaranteed buy-back agreements. Benefits from government subsidies and growing demand for organic produce in urban markets.',
  15.50,
  12,
  25000,
  'low',
  'active'
),
(
  'Tech Startup Accelerator',
  'Technology',
  'Back the next wave of Indian tech innovation. This accelerator fund invests in early-stage startups across AI, fintech, and SaaS verticals. Portfolio approach minimises risk while maximising upside potential. Previous cohorts have delivered exceptional returns.',
  32.00,
  36,
  100000,
  'high',
  'active'
),
(
  'Gold Trading Fund',
  'Commodities',
  'A systematic gold trading strategy that capitalises on price movements in the precious metals market. Uses a combination of physical gold holdings and derivatives to generate consistent returns. Ideal for investors seeking a hedge against inflation and market volatility.',
  12.00,
  6,
  10000,
  'low',
  'active'
);
