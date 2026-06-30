'use client';

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { formatCurrency, formatDate, formatROI } from '@/lib/format';
import {
  getStatusStyle,
  getActionButtons,
  canTransition,
  calculateProfit,
} from '@/lib/investments';
import type { InvestmentStatus } from '@/lib/types';
import toast from 'react-hot-toast';

interface InvestmentRow {
  id: string;
  amount: number;
  status: InvestmentStatus;
  created_at: string;
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

/**
 * Admin Investments — View all investments with full workflow controls.
 *
 * Columns: Investor, Opportunity, Amount, ROI, Expected Profit, Status, Created, Actions
 * Workflow: pending → approved → active → completed | pending → rejected
 *
 * Auth guard handled by admin/layout.tsx (server-side).
 */
export default function AdminInvestmentsPage() {
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [investments, setInvestments] = useState<InvestmentRow[]>([]);

  const fetchInvestments = async () => {
    try {
      const supabase = createSupabaseBrowser();

      const { data, error } = await supabase
        .from('investments')
        .select(`
          id,
          amount,
          status,
          created_at,
          invested_at,
          maturity_date,
          profit,
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
  }, []);

  const updateStatus = async (
    id: string,
    currentStatus: InvestmentStatus,
    newStatus: InvestmentStatus
  ) => {
    // Client-side transition guard
    if (!canTransition(currentStatus, newStatus)) {
      toast.error(`Cannot transition from "${currentStatus}" to "${newStatus}".`);
      return;
    }

    setActionId(id);
    try {
      const supabase = createSupabaseBrowser();

      const { error } = await supabase
        .from('investments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Investment ${newStatus} successfully`);
      fetchInvestments();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update investment status");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-zinc-400 text-sm">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Review Investments</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Manage investor requests through the approval workflow.
          </p>
        </div>
        <button
          onClick={fetchInvestments}
          className="flex items-center justify-center p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-zinc-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-zinc-400">
            <thead className="bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-white/5">
              <tr>
                <th scope="col" className="px-5 py-4">Investor</th>
                <th scope="col" className="px-5 py-4">Opportunity</th>
                <th scope="col" className="px-5 py-4">Amount</th>
                <th scope="col" className="px-5 py-4">ROI</th>
                <th scope="col" className="px-5 py-4">Expected Profit</th>
                <th scope="col" className="px-5 py-4">Status</th>
                <th scope="col" className="px-5 py-4">Created</th>
                <th scope="col" className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {investments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                    No investments found.
                  </td>
                </tr>
              )}
              {investments.map((inv) => {
                const roi = inv.opportunities?.roi ?? 0;
                const profit = calculateProfit(inv.amount, roi);
                const badge = getStatusStyle(inv.status);
                const actions = getActionButtons(inv.status);

                return (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Investor */}
                    <td className="px-5 py-4">
                      <span className="block font-semibold text-white">
                        {inv.profiles?.name || 'Unknown'}
                      </span>
                      <span className="block text-[10px] text-zinc-500 font-mono">
                        {inv.profiles?.phone || 'No phone'}
                      </span>
                    </td>

                    {/* Opportunity */}
                    <td className="px-5 py-4">
                      <span className="block text-white font-medium">
                        {inv.opportunities?.title || 'Unknown'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 font-semibold text-white">
                      {formatCurrency(inv.amount)}
                    </td>

                    {/* ROI */}
                    <td className="px-5 py-4 text-emerald-400 font-medium">
                      {formatROI(roi)}
                    </td>

                    {/* Expected Profit */}
                    <td className="px-5 py-4 font-semibold text-emerald-400">
                      {formatCurrency(profit)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-4 text-zinc-400 text-xs">
                      {inv.created_at ? formatDate(inv.created_at) : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {actions.map((action) => (
                          <button
                            key={action.targetStatus}
                            onClick={() =>
                              updateStatus(inv.id, inv.status, action.targetStatus)
                            }
                            disabled={actionId !== null}
                            className={`flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors ${action.style}`}
                            title={action.title}
                          >
                            {actionId === inv.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              action.label
                            )}
                          </button>
                        ))}
                        {actions.length === 0 && (
                          <span className="text-[10px] text-zinc-600 italic">
                            No actions
                          </span>
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
  );
}
