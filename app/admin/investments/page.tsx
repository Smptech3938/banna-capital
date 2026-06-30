'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Check, X, CheckCircle, RefreshCw } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import toast from 'react-hot-toast';

interface InvestmentRow {
  id: string;
  amount: number;
  status: string;
  invested_at: string;
  maturity_date: string | null;
  profit: number | null;
  profiles: {
    name: string;
    phone: string | null;
  };
  opportunities: {
    title: string;
    roi: number;
  };
}

export default function AdminInvestmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [investments, setInvestments] = useState<InvestmentRow[]>([]);
  const [profitModalOpen, setProfitModalOpen] = useState(false);
  const [profitAmount, setProfitAmount] = useState('');
  const [selectedInvId, setSelectedInvId] = useState<string | null>(null);

  const fetchInvestments = async () => {
    try {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Verify admin role
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

      // Fetch all investments with profiles and opportunities info
      const { data, error } = await supabase
        .from('investments')
        .select(`
          id,
          amount,
          status,
          profiles (name, phone),
          opportunities (title, roi)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments((data as unknown as InvestmentRow[]) || []);
    } catch (err) {
      console.error("Error loading investments:", err);
      toast.error("Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [router]);

  const updateStatus = async (id: string, newStatus: string) => {
    setActionId(id);
    try {
      const supabase = createSupabaseBrowser();
      const updates = { status: newStatus };

      const { error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success(`Investment status updated to ${newStatus}`);
      fetchInvestments();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-zinc-400 text-sm">Loading investments...</p>
        </div>
      </div>
    );
  }

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
            <a href="/admin" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="/admin/users" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
              Users
            </a>
            <a href="/admin/opportunities" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
              Opportunities
            </a>
            <a href="/admin/investments" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium bg-emerald-600/10 text-emerald-400">
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
            <div className="flex items-center gap-3">
              <a href="/admin" className="text-zinc-400 hover:text-white md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </a>
              <h1 className="text-base font-semibold text-white">Review Investments</h1>
            </div>
            <button
              onClick={fetchInvestments}
              className="flex items-center justify-center p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
            <div className="rounded-xl border border-white/5 bg-zinc-900/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-white/5">
                    <tr>
                      <th scope="col" className="px-6 py-4">Investor</th>
                      <th scope="col" className="px-6 py-4">Opportunity</th>
                      <th scope="col" className="px-6 py-4">Amount</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4">Profit Distributed</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {investments.map((inv) => {
                      const expectedProfit = (Number(inv.amount) * Number(inv.opportunities?.roi || 0)) / 100;
                      return (
                        <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <span className="block font-semibold text-white">{inv.profiles?.name || 'Unknown'}</span>
                            <span className="block text-[10px] text-zinc-500 font-mono">{inv.profiles?.phone || 'No phone'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="block text-white font-medium">{inv.opportunities?.title || 'Unknown Opportunity'}</span>
                            <span className="block text-[10px] text-zinc-500">ROI: {inv.opportunities?.roi || 0}%</span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-white">
                            {formatCurrency(inv.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              inv.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                              inv.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                              inv.status === 'completed' ? 'bg-sky-500/10 text-sky-400' :
                              inv.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-emerald-400">
                            {inv.profit !== null ? formatCurrency(inv.profit) : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {inv.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => updateStatus(inv.id, 'active')}
                                    disabled={actionId !== null}
                                    className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                    title="Approve & Set Active"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => updateStatus(inv.id, 'rejected')}
                                    disabled={actionId !== null}
                                    className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                    title="Reject Request"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {inv.status === 'active' && (
                                <button
                                  onClick={() => updateStatus(inv.id, 'completed')}
                                  disabled={actionId !== null}
                                  className="flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
                                  title="Mark as Completed"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
