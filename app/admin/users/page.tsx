'use client';

import { useState, useEffect } from 'react';
import { Loader2, Shield, User as UserIcon, RefreshCw } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { Profile } from '@/lib/types';
import toast from 'react-hot-toast';

/**
 * Admin Users — View all platform users and toggle their roles.
 *
 * Auth guard is handled by admin/layout.tsx (server-side).
 * Sidebar is rendered by admin/layout.tsx via AdminSidebar.
 */
export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((profiles as Profile[]) || []);
    } catch (err) {
      console.error("Error loading users:", err);
      toast.error("Failed to load user profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (targetUser: Profile) => {
    const newRole = targetUser.role === 'admin' ? 'investor' : 'admin';

    if (targetUser.id === currentUserId) {
      const confirmSelf = confirm(
        "Are you sure you want to change your own role? You will lose admin privileges immediately."
      );
      if (!confirmSelf) return;
    }

    setUpdatingId(targetUser.id);
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUser.id);

      if (error) throw error;

      toast.success(`Role updated to ${newRole} for ${targetUser.name}`);

      // Update local state optimistically
      setUsers(prev =>
        prev.map(u => u.id === targetUser.id ? { ...u, role: newRole as "investor" | "admin" } : u)
      );

      // If admin demoted themselves, redirect will happen via layout on next nav
      if (targetUser.id === currentUserId && newRole === 'investor') {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error("Error updating user role:", err);
      toast.error("Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-zinc-400 text-sm">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">User Management</h2>
          <p className="mt-1 text-sm text-zinc-400">
            View all registered users and manage their roles.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center justify-center p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Refresh profiles"
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
                <th scope="col" className="px-6 py-4">User Details</th>
                <th scope="col" className="px-6 py-4">Phone Number</th>
                <th scope="col" className="px-6 py-4">Role</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {user.role === 'admin' ? <Shield className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                    </div>
                    <div>
                      <span className="block font-semibold text-white">{user.name}</span>
                      <span className="block text-[10px] text-zinc-500">ID: {user.id.slice(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-300">
                    {user.phone || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleRole(user)}
                      disabled={updatingId !== null}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                        user.role === 'admin'
                          ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {updatingId === user.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        `Make ${user.role === 'admin' ? 'Investor' : 'Admin'}`
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
