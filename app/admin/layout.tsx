import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseServer } from "@/lib/supabase-server";
import AdminSidebar from "./AdminSidebar";

/**
 * Admin layout — Server-side auth guard.
 *
 * Security model:
 *  1. proxy.ts rejects unauthenticated users (redirects to /login)
 *  2. This layout checks the user's role in the profiles table
 *  3. Non-admin users are redirected to /dashboard BEFORE any page JS is sent
 *  4. Supabase RLS enforces admin-only data access at the database level
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();

  // 1. Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Verify admin role from the profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const initials = profile.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Admin sidebar (client component for active-link detection) */}
      <Suspense fallback={<AdminSidebarSkeleton />}>
        <AdminSidebar />
      </Suspense>

      {/* Main content area */}
      <main className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-zinc-900/30 px-6 backdrop-blur-sm">
          {/* Spacer for mobile hamburger */}
          <div className="w-10 md:hidden" />
          <h1 className="text-base font-semibold text-white hidden md:block">
            Administration
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-xs rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-400 border border-emerald-500/20">
              Admin
            </span>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{profile.name}</p>
              <p className="text-xs capitalize text-zinc-500">
                {profile.role}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/20 ring-2 ring-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400">
                {initials}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}

/* ── Sidebar skeleton (loading fallback) ──────────────────────────── */
function AdminSidebarSkeleton() {
  return (
    <aside className="hidden w-64 flex-col border-r border-white/5 bg-zinc-900/50 p-6 md:flex">
      <div className="mb-8">
        <div className="h-5 w-32 animate-pulse rounded bg-zinc-800" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-zinc-800" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 animate-pulse rounded-lg bg-zinc-800/50"
          />
        ))}
      </div>
    </aside>
  );
}
