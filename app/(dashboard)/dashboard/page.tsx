import {
  DollarSign,
  TrendingUp,
  Wallet,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase-server";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileName = "Investor";

  // Fetch profile
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    if (profile) profileName = profile.name;
  }

  // Fetch investment stats
  let totalInvested = 0;
  let expectedProfit = 0;
  let activeCount = 0;
  let pendingCount = 0;

  if (user) {
    const { data: investments } = await supabase
      .from("investments")
      .select("amount, status, opportunities(roi)")
      .eq("user_id", user.id);

    if (investments) {
      for (const inv of investments) {
        const amount = Number(inv.amount);
        totalInvested += amount;

        if (inv.status === "active" || inv.status === "approved") {
          activeCount++;
          // Calculate expected profit from ROI
          const opp = inv.opportunities as unknown as { roi: number } | null;
          if (opp) {
            expectedProfit += (amount * Number(opp.roi)) / 100;
          }
        }

        if (inv.status === "pending") {
          pendingCount++;
        }
      }
    }
  }

  return (
    <>
      {/* Welcome banner */}
      <div className="mb-6 rounded-xl border border-white/5 bg-gradient-to-r from-emerald-600/10 to-transparent p-6">
        <h2 className="text-xl font-semibold text-white">
          Welcome back, {profileName.split(" ")[0]} 👋
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Here&apos;s an overview of your investments.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Invested"
          value={formatCurrency(totalInvested)}
          accent="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Expected Profit"
          value={formatCurrency(expectedProfit)}
          accent="sky"
        />
        <StatCard
          icon={Wallet}
          label="Active Investments"
          value={String(activeCount)}
          accent="violet"
        />
        <StatCard
          icon={Clock}
          label="Pending Investments"
          value={String(pendingCount)}
          accent="amber"
        />
      </div>

      {/* Recent investments teaser */}
      <div className="mt-8 rounded-xl border border-white/5 bg-zinc-900/50 p-6">
        <h3 className="text-base font-semibold text-white">Quick Actions</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href="/opportunities"
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-800/50 p-4 transition-all hover:border-emerald-500/20 hover:bg-zinc-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/15">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Browse Opportunities
              </p>
              <p className="text-xs text-zinc-500">
                Explore new investment options
              </p>
            </div>
          </a>
          <a
            href="/investments"
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-800/50 p-4 transition-all hover:border-emerald-500/20 hover:bg-zinc-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/15">
              <Wallet className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">My Portfolio</p>
              <p className="text-xs text-zinc-500">
                Track your active investments
              </p>
            </div>
          </a>
        </div>
      </div>
    </>
  );
}

/* ── Accent colour map ────────────────────────────────────────────── */
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
  amber: {
    bg: "bg-amber-600/15",
    text: "text-amber-400",
    ring: "ring-amber-500/20",
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "emerald",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: string;
}) {
  const a = accentMap[accent] ?? accentMap.emerald;

  return (
    <div className="group rounded-xl border border-white/5 bg-zinc-900/50 p-5 transition-all duration-200 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-900/10">
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
