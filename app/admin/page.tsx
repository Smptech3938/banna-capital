'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Wallet, Clock, Users, Loader2 } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import toast from 'react-hot-toast';

/**
 * Admin Dashboard — Overview stats and quick management shortcuts.
 *
 * Auth guard is handled by admin/layout.tsx (server-side).
 * Sidebar is rendered by admin/layout.tsx via AdminSidebar.
 */
export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingInvestments: 0,
    activeInvestments: 0,
    totalInvested: 0,
    completedInvestments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createSupabaseBrowser();

        const { data: investments, error: invError } = await supabase
          .from('investments')
          .select('amount, status');

        if (invError) throw invError;

        let pendingCount = 0;
        let activeCount = 0;
        let completedCount = 0;
        let totalInvested = 0;

        investments?.forEach((inv) => {
          const amt = Number(inv.amount);
          if (inv.status === 'pending') {
            pendingCount++;
          } else if (inv.status === 'active') {
            activeCount++;
            totalInvested += amt;
          } else if (inv.status === 'completed') {
            completedCount++;
            totalInvested += amt;
          } else if (inv.status === 'approved') {
            totalInvested += amt;
          }
        });

        setStats({
          pendingInvestments: pendingCount,
          activeInvestments: activeCount,
          totalInvested,
          completedInvestments: completedCount,
        });
      } catch (err) {
        console.error("Error loading admin stats:", err);
        toast.error("Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-zinc-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl w-full mx-auto">
      {/* Page heading */}
      <div>
        <h2 className="text-xl font-semibold text-white">System Overview</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Live platform statistics and quick management shortcuts.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Pending Investments"
          value={String(stats.pendingInvestments)}
          accent="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Investments"
          value={String(stats.activeInvestments)}
          accent="sky"
        />
        <StatCard
          icon={DollarSign}
          label="Total Investment Amount"
          value={formatCurrency(stats.totalInvested)}
          accent="emerald"
        />
        <StatCard
          icon={Wallet}
          label="Completed Investments"
          value={String(stats.completedInvestments)}
          accent="violet"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
          Quick Management Shortcuts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="group block border border-white/5 bg-zinc-900/30 rounded-xl p-5 hover:border-emerald-500/20 hover:bg-zinc-900/50 transition-all duration-200"
          >
            <span className="text-sm font-semibold text-white block group-hover:text-emerald-400 transition-colors">
              User Management
            </span>
            <span className="text-xs text-zinc-500 mt-1 block">
              Toggle roles, assign administrative rights, and view accounts.
            </span>
          </a>
          <a
            href="/admin/opportunities"
            className="group block border border-white/5 bg-zinc-900/30 rounded-xl p-5 hover:border-emerald-500/20 hover:bg-zinc-900/50 transition-all duration-200"
          >
            <span className="text-sm font-semibold text-white block group-hover:text-emerald-400 transition-colors">
              Manage Opportunities
            </span>
            <span className="text-xs text-zinc-500 mt-1 block">
              Create Supermarket deals, list upcoming/active projects, and edit returns.
            </span>
          </a>
          <a
            href="/admin/investments"
            className="group block border border-white/5 bg-zinc-900/30 rounded-xl p-5 hover:border-emerald-500/20 hover:bg-zinc-900/50 transition-all duration-200"
          >
            <span className="text-sm font-semibold text-white block group-hover:text-emerald-400 transition-colors">
              Review Pending Requests
            </span>
            <span className="text-xs text-zinc-500 mt-1 block">
              Approve or reject user investments and track interest.
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── StatCard ─────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  accent = 'emerald'
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: 'emerald' | 'sky' | 'violet' | 'amber';
}) {
  const accentMap = {
    emerald: { bg: 'bg-emerald-600/15', text: 'text-emerald-400', ring: 'ring-emerald-500/20' },
    sky: { bg: 'bg-sky-600/15', text: 'text-sky-400', ring: 'ring-sky-500/20' },
    violet: { bg: 'bg-violet-600/15', text: 'text-violet-400', ring: 'ring-violet-500/20' },
    amber: { bg: 'bg-amber-600/15', text: 'text-amber-400', ring: 'ring-amber-500/20' },
  };

  const a = accentMap[accent] ?? accentMap.emerald;

  return (
    <div className="group rounded-xl border border-white/5 bg-zinc-900/50 p-5 transition-all duration-200 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-900/10">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${a.bg} ring-1 ${a.ring}`}>
        <Icon className={`h-4 w-4 ${a.text}`} />
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}