import Link from "next/link";
import {
  Compass,
  TrendingUp,
  Clock,
  Shield,
  ArrowRight,
  Search,
} from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase-server";
import { formatCurrency, formatROI, formatDuration } from "@/lib/format";
import type { Opportunity, RiskLevel } from "@/lib/types";

export const metadata = {
  title: "Investment Opportunities — Banna Capital",
  description:
    "Browse available investment opportunities across real estate, agriculture, technology, and commodities.",
};

/* ── Risk badge colours ───────────────────────────────────────────── */
const riskStyles: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Low Risk" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Medium Risk" },
  high: { bg: "bg-red-500/10", text: "text-red-400", label: "High Risk" },
};

/* ── Category colours ─────────────────────────────────────────────── */
const categoryStyles: Record<string, { bg: string; text: string }> = {
  "Real Estate": { bg: "bg-blue-500/10", text: "text-blue-400" },
  Agriculture: { bg: "bg-green-500/10", text: "text-green-400" },
  Technology: { bg: "bg-purple-500/10", text: "text-purple-400" },
  Commodities: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  Supermarket: { bg: "bg-orange-500/10", text: "text-orange-400" },
};

const defaultCategory = { bg: "bg-zinc-500/10", text: "text-zinc-400" };

export default async function OpportunitiesPage() {
  const supabase = await createSupabaseServer();
  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .eq("category", "Supermarket")
    .in("status", ["active", "upcoming"])
    .order("created_at", { ascending: false });

  const opps: Opportunity[] = (opportunities as Opportunity[]) ?? [];

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400" />
            Investment Opportunities
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Explore and invest in curated opportunities
          </p>
        </div>
      </div>

      {/* Opportunities grid */}
      {opps.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {opps.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}
    </>
  );
}

/* ── Opportunity Card ─────────────────────────────────────────────── */
function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const riskKey = (opportunity.risk_level ?? "medium") as RiskLevel;
  const risk = riskStyles[riskKey];
  const cat = categoryStyles[opportunity.category] ?? defaultCategory;
  const isUpcoming = opportunity.status === "upcoming";

  const CardContent = (
    <>
      {/* Top row: category + risk */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.bg} ${cat.text}`}
          >
            {opportunity.category}
          </span>
          {isUpcoming && (
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
              Coming Soon
            </span>
          )}
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${risk.bg} ${risk.text}`}
        >
          <Shield className="h-3 w-3" />
          {risk.label}
        </span>
      </div>

      {/* Title */}
      <h3 className={`text-base font-semibold transition-colors ${isUpcoming ? "text-zinc-500" : "text-white group-hover:text-emerald-400"}`}>
        {opportunity.title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
        {opportunity.description}
      </p>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
        <div>
          <div className="flex items-center gap-1 text-zinc-500">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[10px] uppercase tracking-wider">ROI</span>
          </div>
          <p className={`mt-0.5 text-sm font-bold ${isUpcoming ? "text-zinc-500" : "text-emerald-400"}`}>
            {formatROI(opportunity.roi)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-zinc-500">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] uppercase tracking-wider">
              Duration
            </span>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-white">
            {formatDuration(opportunity.duration_months || 12)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-zinc-500">
            <span className="text-[10px] uppercase tracking-wider">Min</span>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-white">
            {formatCurrency(opportunity.min_investment)}
          </p>
        </div>
      </div>

      {/* CTA */}
      {!isUpcoming ? (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">
          View Details
          <ArrowRight className="h-3 w-3" />
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-zinc-500">
          Register Interest
        </div>
      )}
    </>
  );

  if (isUpcoming) {
    return (
      <div
        className="group flex flex-col rounded-xl border border-white/5 bg-zinc-900/30 p-5 opacity-60 cursor-not-allowed transition-all duration-200"
      >
        {CardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/opportunities/${opportunity.id}`}
      className="group flex flex-col rounded-xl border border-white/5 bg-zinc-900/50 p-5 transition-all duration-200 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-900/10"
    >
      {CardContent}
    </Link>
  );
}

/* ── Empty State ──────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-zinc-900/30 py-16 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
        <Search className="h-6 w-6 text-zinc-500" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">
        No opportunities available
      </h3>
      <p className="mt-1 text-sm text-zinc-400">
        Check back soon — new investment opportunities are added regularly.
      </p>
    </div>
  );
}
