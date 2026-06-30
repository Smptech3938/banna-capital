import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  DollarSign,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Hourglass,
  ArrowUpRight,
} from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase-server";
import { formatCurrency, formatROI, formatDate, formatDuration } from "@/lib/format";
import type { InvestmentStatus } from "@/lib/types";

/* ── Status config ────────────────────────────────────────────────── */
const statusConfig: Record<
  InvestmentStatus,
  { bg: string; text: string; border: string; icon: typeof Clock; label: string }
> = {
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    icon: Hourglass,
    label: "Pending Review",
  },
  approved: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    icon: CheckCircle2,
    label: "Approved",
  },
  active: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: TrendingUp,
    label: "Active",
  },
  completed: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/30",
    icon: CheckCircle2,
    label: "Completed",
  },
  rejected: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    icon: XCircle,
    label: "Rejected",
  },
};

/* ── Timeline step order ──────────────────────────────────────────── */
const timelineSteps: InvestmentStatus[] = [
  "pending",
  "approved",
  "active",
  "completed",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("investments")
    .select("opportunities(title)")
    .eq("id", id)
    .single();

  const opp = data?.opportunities as unknown as { title: string } | null;
  return {
    title: opp
      ? `Investment: ${opp.title} — Banna Capital`
      : "Investment Details — Banna Capital",
  };
}

export default async function InvestmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data } = await supabase
    .from("investments")
    .select(
      "*, opportunities(id, title, category, roi, duration_months, description)"
    )
    .eq("id", id)
    .single();

  if (!data) notFound();

  const investment = data as any;
  const opp = investment.opportunities as any ?? {};

  const status = statusConfig[investment.status as InvestmentStatus] ?? statusConfig.pending;
  const StatusIcon = status.icon;
  const amount = Number(investment.amount);
  const expectedReturn = (amount * Number(opp.roi || 0)) / 100;
  const totalReturn = amount + expectedReturn;

  // Determine active step index for timeline
  const currentStepIndex =
    investment.status === "rejected"
      ? -1
      : timelineSteps.indexOf(investment.status as InvestmentStatus);

  return (
    <>
      {/* Back */}
      <Link
        href="/investments"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Portfolio
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status banner */}
          <div
            className={`flex items-center gap-3 rounded-xl border ${status.border} ${status.bg} p-4`}
          >
            <StatusIcon className={`h-5 w-5 ${status.text}`} />
            <div>
              <p className={`text-sm font-semibold ${status.text}`}>
                {status.label}
              </p>
              <p className="text-xs text-zinc-400">
                {investment.status === "pending" &&
                  "Your investment request is being reviewed by our team."}
                {investment.status === "approved" &&
                  "Your investment has been approved and will be activated soon."}
                {investment.status === "active" &&
                  "Your investment is active and generating returns."}
                {investment.status === "completed" &&
                  "Your investment has matured. Returns have been processed."}
                {investment.status === "rejected" &&
                  "Your investment request was not approved."}
              </p>
            </div>
          </div>

          {/* Timeline */}
          {investment.status !== "rejected" && (
            <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-6">
              <h3 className="text-sm font-semibold text-white mb-5">
                Investment Timeline
              </h3>
              <div className="flex items-center justify-between">
                {timelineSteps.map((step, i) => {
                  const stepStatus = statusConfig[step];
                  const StepIcon = stepStatus.icon;
                  const isCompleted = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;

                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                            isCompleted
                              ? `${stepStatus.bg} ${stepStatus.border}`
                              : "border-zinc-700 bg-zinc-800/50"
                          } ${isCurrent ? "ring-2 ring-offset-2 ring-offset-zinc-950 ring-emerald-500/30" : ""}`}
                        >
                          <StepIcon
                            className={`h-4 w-4 ${
                              isCompleted ? stepStatus.text : "text-zinc-600"
                            }`}
                          />
                        </div>
                        <p
                          className={`mt-2 text-[10px] font-medium uppercase tracking-wider ${
                            isCompleted ? "text-zinc-300" : "text-zinc-600"
                          }`}
                        >
                          {stepStatus.label}
                        </p>
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <div
                          className={`mx-2 h-0.5 flex-1 rounded-full ${
                            i < currentStepIndex
                              ? "bg-emerald-500/40"
                              : "bg-zinc-800"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Investment details */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-6">
            <h3 className="text-sm font-semibold text-white mb-4">
              Investment Details
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <DetailRow icon={DollarSign} label="Amount Invested" value={formatCurrency(amount)} />
              <DetailRow icon={TrendingUp} label="Expected Return" value={`+${formatCurrency(expectedReturn)}`} valueColor="text-emerald-400" />
              <DetailRow icon={CalendarDays} label="Category" value={opp.category || '—'} />
              <DetailRow icon={Clock} label="Duration" value={formatDuration(opp.duration_months || 12)} />
              <DetailRow icon={TrendingUp} label="ROI" value={formatROI(opp.roi || 0)} valueColor="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Right — Summary + Opportunity link */}
        <div className="space-y-6 lg:col-span-1">
          {/* Financial summary */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-6">
            <h3 className="text-sm font-semibold text-white mb-4">
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Investment</span>
                <span className="text-white font-medium">
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Expected ROI</span>
                <span className="text-emerald-400 font-medium">
                  {formatROI(opp.roi || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Duration</span>
                <span className="text-white">
                  {formatDuration(opp.duration_months || 12)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Expected Return</span>
                <span className="text-emerald-400 font-medium">
                  +{formatCurrency(expectedReturn)}
                </span>
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between text-sm">
                <span className="text-zinc-300 font-medium">Total Return</span>
                <span className="text-white text-lg font-bold">
                  {formatCurrency(totalReturn)}
                </span>
              </div>
            </div>
          </div>

          {/* Linked opportunity */}
          {opp.id && (
            <Link
              href={`/opportunities/${opp.id}`}
              className="group flex flex-col rounded-xl border border-white/5 bg-zinc-900/50 p-5 transition-all hover:border-emerald-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  {opp.category}
                </span>
                <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                {opp.title}
              </h4>
              <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                {opp.description}
              </p>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Detail Row ───────────────────────────────────────────────────── */
function DetailRow({
  icon: Icon,
  label,
  value,
  valueColor = "text-white",
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className={`text-sm font-medium ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}
