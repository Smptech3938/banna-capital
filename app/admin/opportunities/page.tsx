'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { Opportunity, RiskLevel, OpportunityStatus } from '@/lib/types';
import { formatCurrency, formatROI } from '@/lib/format';
import toast from 'react-hot-toast';

/**
 * Admin Opportunities — Full CRUD for investment opportunities.
 *
 * Auth guard is handled by admin/layout.tsx (server-side).
 * Sidebar is rendered by admin/layout.tsx via AdminSidebar.
 */
export default function AdminOpportunitiesPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Supermarket');
  const [description, setDescription] = useState('');
  const [roi, setRoi] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [minInvestment, setMinInvestment] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [status, setStatus] = useState<OpportunityStatus>('active');

  const fetchOpportunities = async () => {
    try {
      const supabase = createSupabaseBrowser();

      const { data: opps, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities((opps as Opportunity[]) || []);
    } catch (err) {
      console.error("Error loading opportunities:", err);
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const openCreateModal = () => {
    setEditingOpp(null);
    setTitle('');
    setCategory('Supermarket');
    setDescription('');
    setRoi('15.00');
    setDurationMonths('12');
    setMinInvestment('25000');
    setRiskLevel('medium');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (opp: Opportunity) => {
    setEditingOpp(opp);
    setTitle(opp.title);
    setCategory(opp.category);
    setDescription(opp.description);
    setRoi(String(opp.roi));
    setDurationMonths(String(opp.duration_months));
    setMinInvestment(String(opp.min_investment));
    setRiskLevel(opp.risk_level || 'medium');
    setStatus(opp.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !roi || !durationMonths || !minInvestment) {
      toast.error("Please fill in all fields");
      return;
    }

    setActionLoading(true);
    try {
      const supabase = createSupabaseBrowser();
      const payload = {
        title,
        category,
        description,
        roi: Number(roi),
        duration_months: Number(durationMonths),
        min_investment: Number(minInvestment),
        status,
      };

      if (editingOpp) {
        const { error } = await supabase
          .from('opportunities')
          .update(payload)
          .eq('id', editingOpp.id);

        if (error) throw error;
        toast.success("Opportunity updated successfully");
      } else {
        const { error } = await supabase
          .from('opportunities')
          .insert(payload);

        if (error) throw error;
        toast.success("Opportunity created successfully");
      }

      setIsModalOpen(false);
      fetchOpportunities();
    } catch (err) {
      console.error("Error saving opportunity:", err);
      toast.error("Failed to save opportunity");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this opportunity? This will fail if there are active investments in it.")) return;

    setActionLoading(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Opportunity deleted successfully");
      fetchOpportunities();
    } catch (err) {
      console.error("Error deleting opportunity:", err);
      toast.error("Failed to delete (check if investments exist first)");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-zinc-400 text-sm">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-7xl w-full mx-auto">
        {/* Page heading */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Manage Opportunities</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Create, edit, and manage investment opportunities.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Opportunity
            </button>
            <button
              onClick={fetchOpportunities}
              className="flex items-center justify-center p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-500">
              No opportunities found. Click &quot;Add Opportunity&quot; to create one.
            </div>
          )}
          {opportunities.map((opp) => (
            <div key={opp.id} className="relative rounded-xl border border-white/5 bg-zinc-900/50 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
                    {opp.category}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                    opp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                    opp.status === 'upcoming' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {opp.status}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-sm">{opp.title}</h3>
                <p className="text-xs text-zinc-400 mt-1.5 line-clamp-3 leading-relaxed">{opp.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded bg-zinc-800/40 p-1.5">
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-500">ROI</span>
                    <span className="font-bold text-xs text-emerald-400">{formatROI(opp.roi)}</span>
                  </div>
                  <div className="rounded bg-zinc-800/40 p-1.5">
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-500">Months</span>
                    <span className="font-bold text-xs text-white">{opp.duration_months}</span>
                  </div>
                  <div className="rounded bg-zinc-800/40 p-1.5">
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-500">Min.</span>
                    <span className="font-semibold text-[10px] text-white">{formatCurrency(opp.min_investment)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(opp)}
                    className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Edit Opportunity"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(opp.id)}
                    disabled={actionLoading}
                    className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Delete Opportunity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-base font-bold text-white">
                {editingOpp ? 'Edit Opportunity' : 'Create Opportunity'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Retail Supermarket Chain"
                  className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Supermarket">Supermarket</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Technology">Technology</option>
                    <option value="Commodities">Commodities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
                    className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming (Coming Soon)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the opportunity professionally..."
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">ROI (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={roi}
                    onChange={(e) => setRoi(e.target.value)}
                    placeholder="15.50"
                    className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    placeholder="12"
                    className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Min. Invest (₹)</label>
                  <input
                    type="number"
                    value={minInvestment}
                    onChange={(e) => setMinInvestment(e.target.value)}
                    placeholder="25000"
                    className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Risk Level</label>
                <div className="flex gap-4">
                  {(['low', 'medium', 'high'] as RiskLevel[]).map((level) => (
                    <label key={level} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="riskLevel"
                        value={level}
                        checked={riskLevel === level}
                        onChange={() => setRiskLevel(level)}
                        className="text-emerald-500 focus:ring-0"
                      />
                      <span className="capitalize text-xs text-zinc-300">{level} Risk</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-zinc-800 px-4 py-2 font-semibold text-zinc-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 transition-all"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingOpp ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
