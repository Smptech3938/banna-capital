'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, Wallet, Clock, Users, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvested: 0,
    activeOpportunities: 0,
    pendingInvestments: 0,
  });

  useEffect(() => {
    const checkAdminAndFetchStats = async () => {
      try {
        const supabase = createSupabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'admin') {
          toast.error("Access denied: Admin only");
          router.push('/dashboard');
          return;
        }

        setIsAdmin(true);

        // Fetch live stats
        const [
          { count: usersCount },
          { data: investments },
          { count: oppsCount },
          { count: pendingCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('investments').select('amount').in('status', ['approved', 'active', 'completed']),
          supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('investments').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ]);

        const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

        setStats({
          totalUsers: usersCount || 0,
          totalInvested,
          activeOpportunities: oppsCount || 0,
          pendingInvestments: pendingCount || 0,
        });

      } catch (err) {
        console.error("Error loading admin stats:", err);
        toast.error("Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-zinc-400 text-sm">Verifying administrator access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-6 text-center">
        <div className="max-w-md space-y-4 rounded-xl border border-red-500/10 bg-zinc-900/50 p-8">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold">Unauthorized Access</h2>
          <p className="text-sm text-zinc-400">
            You do not have administrative privileges to access this area.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const StatCard = ({
    icon: Icon,
    label,
    value,
    accent = 'emerald'
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    accent?: 'emerald' | 'sky' | 'violet' | 'amber';
  }) => {
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
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="hidden md:block w-64 border-r border-white/5 bg-zinc-900/90 p-6 min-h-screen">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/20 ring-1 ring-emerald-500/30">
              <span className="text-sm font-bold text-emerald-400">BC</span>
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">
                Banna<span className="text-emerald-400">Capital</span>
              </span>
              <span className="text-[10px] text-zinc-500 block">Administration</span>
            </div>
          </div>

          <nav className="space-y-1">
            <a href="/admin" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium bg-emerald-600/10 text-emerald-400">
              Dashboard
            </a>
            <a href="/admin/users" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
              Users
            </a>
            <a href="/admin/opportunities" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
              Opportunities
            </a>
            <a href="/admin/investments" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
              Investments
            </a>
            <hr className="my-4 border-white/5" />
            <a href="/dashboard" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Investor View
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 border-b border-white/5 bg-zinc-900/50 px-6 flex items-center justify-between">
            <h1 className="text-base font-semibold text-white">System Admin Overview</h1>
            <div className="flex items-center gap-3">
              <span className="text-xs rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-400 border border-emerald-500/20">
                Live Server Connected
              </span>
            </div>
          </header>

          <div className="flex-1 p-6 space-y-8 max-w-7xl w-full mx-auto">
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Users"
                value={String(stats.totalUsers)}
                accent="violet"
              />
              <StatCard
                icon={DollarSign}
                label="Total Invested"
                value={formatCurrency(stats.totalInvested)}
                accent="emerald"
              />
              <StatCard
                icon={TrendingUp}
                label="Active Opportunities"
                value={String(stats.activeOpportunities)}
                accent="sky"
              />
              <StatCard
                icon={Clock}
                label="Pending Approvals"
                value={String(stats.pendingInvestments)}
                accent="amber"
              />
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">Quick Management Shortcuts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/admin/users" className="group block border border-white/5 bg-zinc-900/30 rounded-xl p-5 hover:border-emerald-500/20 hover:bg-zinc-900/50 transition-all duration-200">
                  <span className="text-sm font-semibold text-white block group-hover:text-emerald-400 transition-colors">User Management</span>
                  <span className="text-xs text-zinc-500 mt-1 block">Toggle roles, assign administrative rights, and view accounts.</span>
                </a>
                <a href="/admin/opportunities" className="group block border border-white/5 bg-zinc-900/30 rounded-xl p-5 hover:border-emerald-500/20 hover:bg-zinc-900/50 transition-all duration-200">
                  <span className="text-sm font-semibold text-white block group-hover:text-emerald-400 transition-colors">Manage Opportunities</span>
                  <span className="text-xs text-zinc-500 mt-1 block">Create Supermarket deals, list upcoming/active projects, and edit returns.</span>
                </a>
                <a href="/admin/investments" className="group block border border-white/5 bg-zinc-900/30 rounded-xl p-5 hover:border-emerald-500/20 hover:bg-zinc-900/50 transition-all duration-200">
                  <span className="text-sm font-semibold text-white block group-hover:text-emerald-400 transition-colors">Review Pending Requests</span>
                  <span className="text-xs text-zinc-500 mt-1 block">Approve or reject user investments and track interest.</span>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}