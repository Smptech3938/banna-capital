'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Shield, User as UserIcon, RefreshCw } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { Profile } from '@/lib/types';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user.id);

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

      // Fetch all user profiles
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
  }, [router]);

  const toggleRole = async (targetUser: Profile) => {
    const newRole = targetUser.role === 'admin' ? 'investor' : 'admin';
    
    if (targetUser.id === currentUser) {
      const confirmSelf = confirm("Are you sure you want to change your own role? You will lose admin privileges immediately.");
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
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      
      if (targetUser.id === currentUser && newRole === 'investor') {
        router.push('/dashboard');
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-zinc-400 text-sm">Loading profiles...</p>
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
            <a href="/admin/users" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium bg-emerald-600/10 text-emerald-400">
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
            <div className="flex items-center gap-3">
              <a href="/admin" className="text-zinc-400 hover:text-white md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </a>
              <h1 className="text-base font-semibold text-white">User Management</h1>
            </div>
            <button
              onClick={fetchUsers}
              className="flex items-center justify-center p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Refresh profiles"
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
                      <th scope="col" className="px-6 py-4">User Details</th>
                      <th scope="col" className="px-6 py-4">Phone Number</th>
                      <th scope="col" className="px-6 py-4">Role</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            {user.role === 'admin' ? <Shield className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                          </div>
                          <div>
                            <span className="block font-semibold text-white">{user.name}</span>
                            <span className="block text-[10px] text-zinc-500">ID: {user.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-zinc-300">
                          {user.phone || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
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
        </main>
      </div>
    </div>
  );
}
