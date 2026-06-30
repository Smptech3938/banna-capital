/**
 * Shared TypeScript interfaces for Banna Capital.
 * These mirror the Supabase database schema.
 */

/* ── Enums ─────────────────────────────────────────────────────────── */

export type RiskLevel = "low" | "medium" | "high";
export type OpportunityStatus = "active" | "closed" | "upcoming";
export type InvestmentStatus =
  | "pending"
  | "approved"
  | "active"
  | "completed"
  | "rejected";

export type UserRole = "investor" | "admin" | "owner";

/* ── Database Row Types ────────────────────────────────────────────── */

export interface Profile {
  id: string;
  name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  description: string;
  roi: number; // e.g. 18.00 = 18%
  duration_months: number;
  min_investment: number;
  risk_level: RiskLevel;
  image_url: string | null;
  status: OpportunityStatus;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  opportunity_id: string;
  amount: number;
  status: InvestmentStatus;
  invested_at: string;
  maturity_date: string | null;
  profit: number | null;
  created_at: string;
}

/** Investment joined with its opportunity data (for portfolio views) */
export interface InvestmentWithOpportunity extends Investment {
  opportunities: Pick<
    Opportunity,
    "title" | "category" | "roi" | "duration_months" | "risk_level"
  >;
}
