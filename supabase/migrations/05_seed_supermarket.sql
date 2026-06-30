-- ============================================================
-- BANNA CAPITAL - Complete Seed Data
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Step 1: Seed Investment Opportunities ────────────────────
-- (Uses UPSERT to avoid duplicates on re-run)

INSERT INTO opportunities (title, category, description, roi, duration_months, min_investment, status)
VALUES
-- ACTIVE Supermarket Deal
(
  'MegaMart Supermarket Expansion',
  'Supermarket',
  'Invest in the expansion of MegaMart retail supermarkets across tier-2 cities. This project will fund the setup of 5 new stores, inventory acquisition, and local marketing campaigns. A stable asset-backed investment offering steady returns.',
  16.50,
  18,
  30000,
  'active'
),
-- ACTIVE Real Estate Deal
(
  'Banna Residency Phase II',
  'Real Estate',
  'Premium residential apartments in the rapidly developing south-east corridor. The project covers 120 units across three towers with modern amenities. Phase I is fully sold out and Phase II offers early-bird pricing for investors.',
  22.00,
  24,
  100000,
  'active'
),
-- ACTIVE Agriculture Deal
(
  'Organic Spice Plantation',
  'Agriculture',
  'High-yield organic spice cultivation across 50 acres in Kerala. This project taps into the booming international demand for certified organic spices. Includes drip irrigation, post-harvest processing, and direct export contracts.',
  18.00,
  12,
  25000,
  'active'
),
-- ACTIVE Technology Deal
(
  'FinTech SaaS Platform',
  'Technology',
  'Early-stage investment in a B2B fintech SaaS platform providing lending infrastructure to NBFCs and cooperative banks. The platform already has 12 paying customers and is growing 20% month-over-month.',
  28.00,
  36,
  50000,
  'active'
),
-- ACTIVE Commodities Deal
(
  'Gold-Backed Fixed Income Fund',
  'Commodities',
  'A physically-backed gold fund that provides stable fixed-income returns. Assets are stored in bonded vaults with third-party audits. Ideal for risk-averse investors seeking capital preservation with modest upside.',
  12.50,
  12,
  10000,
  'active'
),
-- UPCOMING: Green Energy
(
  'Green Energy Solar Farm',
  'Technology',
  'An upcoming solar energy project aiming to build a 5MW grid-connected solar power plant. Currently in final licensing and approval phase. Ideal for ESG-focused investors seeking long-term yield.',
  21.00,
  24,
  50000,
  'upcoming'
),
-- UPCOMING: Agro Processing
(
  'Banna Agro-Processing Unit',
  'Agriculture',
  'Upcoming modern processing unit for high-value agricultural crops. Designed to reduce post-harvest losses and export directly to Middle Eastern markets.',
  14.80,
  12,
  20000,
  'upcoming'
),
-- UPCOMING: Supermarket 2
(
  'QuickBuy Retail Chain Launch',
  'Supermarket',
  'An upcoming franchise model for launching a chain of neighbourhood supermarkets in tier-3 cities. Combines bulk procurement with hyperlocal delivery to maximise margins.',
  15.00,
  18,
  40000,
  'active'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Step 2: Set yourself as Admin
-- ============================================================
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual user ID.
-- 
-- To find your user ID:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click on your user → Copy the UUID
--
-- Then uncomment and run this:
--
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = 'YOUR_USER_ID_HERE';
--
-- Example:
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = '12345678-abcd-1234-efgh-123456789012';
-- ============================================================
