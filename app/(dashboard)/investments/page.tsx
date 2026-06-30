import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase-server";
import { formatCurrency, formatROI, formatDate } from "@/lib/format";
import type { InvestmentWithOpportunity, InvestmentStatus } from "@/lib/types";

export const metadata = {
  title: "My Investments — Banna Capital",
  description: "Track your investment portfolio, view status, and monitor returns.",
};

/* ── Status badge config ──────────────────────────────────────────── */
const statusConfig: Record<
  InvestmentStatus,
  { bg: string; text: string; icon: typeof Clock; label: string }
> = {
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    icon: Hourglass,
    label: "Pending",
  },
  approved: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    icon: CheckCircle2,
    label: "Approved",
  },
  active: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    icon: TrendingUp,
    label: "Active",
  },
  completed: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    icon: CheckCircle2,
    label: "Completed",
  },
  rejected: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    icon: XCircle,
    label: "Rejected",
  },
};

export default async function InvestmentsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let investments: InvestmentWithOpportunity[] = [];
  let totalInvested = 0;
  let totalProfit = 0;
  let activeCount = 0;

  if (user) {
    const { data } = await supabase
      .from("investments")
      .select(
        "*, opportunities(title, category, roi, duration_months, risk_level)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    investments = (data as InvestmentWithOpportunity[]) ?? [];

    for (const inv of investments) {
      if (inv.status !== "rejected") {
        totalInvested += Number(inv.amount);
      }
      if (inv.status === "completed" && inv.profit) {
        totalProfit += Number(inv.profit);
      }
      if (inv.status === "active" || inv.status === "approved") {
        activeCount++;
        totalProfit +=
          (Number(inv.amount) * Number(inv.opportunities.roi)) / 100;
      }
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-400" />
          My Investments
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Track and manage your investment portfolio
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={DollarSign}
          label="Total Invested"
          value={formatCurrency(totalInvested)}
          color="emerald"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Expected Returns"
          value={formatCurrency(totalProfit)}
          color="sky"
        />
        <SummaryCard
          icon={Wallet}
          label="Active Investments"
          value={String(activeCount)}
          color="violet"
        />
      </div>

      {/* Investments list */}
      {investments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {investments.map((inv) => (
            <InvestmentCard key={inv.id} investment={inv} />
          ))}
        </div>
      )}
    </>
  );
}

/* ── Investment Card ──────────────────────────────────────────────── */
function InvestmentCard({
  investment,
}: {
  investment: InvestmentWithOpportunity;
}) {
  const status = statusConfig[investment.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;
  const expectedReturn =
    (Number(investment.amount) * Number(investment.opportunities.roi)) / 100;

  return (
    <Link
      href={`/investments/${investment.id}`}
      className="group flex flex-col gap-4 rounded-xl border border-white/5 bg-zinc-900/50 p-5 transition-all duration-200 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-900/10 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Left side */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
            {investment.opportunities.title}
          </h3>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.bg} ${status.text}`}
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span>Invested {formatDate(investment.invested_at)}</span>
          {investment.maturity_date && (
            <>
              <span>•</span>
              <span>Matures {formatDate(investment.maturity_date)}</span>
            </>
          )}
          <span>•</span>
          <span>{formatROI(investment.opportunities.roi)} ROI</span>
        </div>
      </div>

      {/* Right side — amounts */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-zinc-500">Invested</p>
          <p className="text-sm font-bold text-white">
            {formatCurrency(Number(investment.amount))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Expected Return</p>
          <p className="text-sm font-bold text-emerald-400">
            +{formatCurrency(expectedReturn)}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-emerald-400" />
      </div>
    </Link>
  );
}

/* ── Summary Card ─────────────────────────────────────────────────── */
const accentMap: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: {
    bg: "bg-emerald-600/15",
    text: "text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  sky: {
    bg: "bg-sky-600/15",
    text: "text-sky-400",
    ring: "ring-sky-500/20",
  },
  violet: {
    bg: "bg-violet-600/15",
    text: "text-violet-400",
    ring: "ring-violet-500/20",
  },
};

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  color: string;
}) {
  const a = accentMap[color] ?? accentMap.emerald;

  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-5">
      <div
        className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${a.bg} ring-1 ${a.ring}`}
      >
        <Icon className={`h-4 w-4 ${a.text}`} />
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

/* ── Empty State ──────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-zinc-900/30 py-16 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
        <Wallet className="h-6 w-6 text-zinc-500" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">
        No investments yet
      </h3>
      <p className="mt-1 text-sm text-zinc-400">
        Start investing by browsing available opportunities.
      </p>
      <Link
        href="/opportunities"
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        Browse Opportunities
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
