import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  Shield,
  DollarSign,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase-server";
import { formatCurrency, formatROI, formatDuration, formatDate } from "@/lib/format";
import type { Opportunity, RiskLevel } from "@/lib/types";
import InvestForm from "./InvestForm";

/* ── Risk config ──────────────────────────────────────────────────── */
const riskConfig: Record<
  RiskLevel,
  { color: string; bg: string; label: string; icon: typeof Shield; description: string }
> = {
  low: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Low Risk",
    icon: CheckCircle2,
    description: "Conservative investment with stable, predictable returns.",
  },
  medium: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    label: "Medium Risk",
    icon: Shield,
    description: "Balanced risk-reward profile with moderate growth potential.",
  },
  high: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "High Risk",
    icon: AlertTriangle,
    description: "Higher potential returns with increased volatility.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("opportunities")
    .select("title, description")
    .eq("id", id)
    .single();

  if (!data) return { title: "Opportunity Not Found — Banna Capital" };

  return {
    title: `${data.title} — Banna Capital`,
    description: data.description?.slice(0, 160),
  };
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const opp = data as any;
  const riskLevel = opp.risk_level || "medium";
  const risk = riskConfig[riskLevel as RiskLevel] ?? riskConfig.medium;
  const RiskIcon = risk.icon;

  return (
    <>
      {/* Back link */}
      <Link
        href="/opportunities"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Opportunities
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header card */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                {opp.category}
              </span>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${risk.bg} ${risk.color}`}
              >
                <RiskIcon className="h-3 w-3" />
                {risk.label}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white">{opp.title}</h1>

            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {opp.description}
            </p>

            <p className="mt-3 text-xs text-zinc-600">
              Listed on {formatDate(opp.created_at)}
            </p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard
              icon={TrendingUp}
              label="Expected ROI"
              value={formatROI(opp.roi)}
              color="text-emerald-400"
            />
            <MetricCard
              icon={Clock}
              label="Duration"
              value={formatDuration(opp.duration_months || 12)}
              color="text-sky-400"
            />
            <MetricCard
              icon={DollarSign}
              label="Min Investment"
              value={formatCurrency(opp.min_investment)}
              color="text-violet-400"
            />
            <MetricCard
              icon={CalendarDays}
              label="Maturity"
              value={formatDuration(opp.duration_months || 12)}
              color="text-amber-400"
            />
          </div>

          {/* Risk assessment */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-6">
            <h3 className="text-sm font-semibold text-white mb-3">
              Risk Assessment
            </h3>
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${risk.bg}`}
              >
                <RiskIcon className={`h-5 w-5 ${risk.color}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${risk.color}`}>
                  {risk.label}
                </p>
                <p className="mt-0.5 text-sm text-zinc-400">
                  {risk.description}
                </p>
              </div>
            </div>

            {/* Risk bars */}
            <div className="mt-4 space-y-2">
              <RiskBar label="Volatility" level={riskLevel as RiskLevel} />
              <RiskBar
                label="Liquidity"
                level={(opp.duration_months || 12) > 24 ? "high" : (opp.duration_months || 12) > 12 ? "medium" : "low"}
              />
              <RiskBar
                label="Return Potential"
                level={opp.roi > 25 ? "high" : opp.roi > 15 ? "medium" : "low"}
              />
            </div>
          </div>
        </div>

        {/* Right — Invest Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl border border-white/5 bg-zinc-900/50 p-6">
            <h3 className="text-base font-semibold text-white mb-1">
              Invest Now
            </h3>
            <p className="mb-5 text-xs text-zinc-500">
              Minimum investment: {formatCurrency(opp.min_investment)}
            </p>

            <InvestForm
              opportunityId={opp.id}
              minInvestment={Number(opp.min_investment)}
              roi={Number(opp.roi)}
              durationMonths={opp.duration_months || 12}
              title={opp.title}
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Metric Card ──────────────────────────────────────────────────── */
function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-4">
      <Icon className={`h-4 w-4 ${color} mb-2`} />
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

/* ── Risk Bar ─────────────────────────────────────────────────────── */
function RiskBar({ label, level }: { label: string; level: RiskLevel }) {
  const widths: Record<RiskLevel, string> = {
    low: "w-1/3",
    medium: "w-2/3",
    high: "w-full",
  };
  const colors: Record<RiskLevel, string> = {
    low: "bg-emerald-500",
    medium: "bg-amber-500",
    high: "bg-red-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className="capitalize text-zinc-500">{level}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${colors[level]} ${widths[level]} transition-all`}
        />
      </div>
    </div>
  );
}
