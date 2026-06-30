import { Suspense } from "react";
import { createSupabaseServer } from "@/lib/supabase-server";
import Sidebar from "./Sidebar";

/**
 * Shared dashboard layout.
 * Provides the sidebar + top bar for all authenticated pages:
 *   /dashboard, /opportunities, /investments, etc.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileName = "Investor";
  let profileRole = "investor";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      profileName = profile.name;
      profileRole = profile.role ?? "investor";
    }
  }

  const initials = profileName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar (client component for active-link detection) */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      {/* Main content area */}
      <main className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-zinc-900/30 px-6 backdrop-blur-sm">
          {/* Spacer for mobile hamburger */}
          <div className="w-10 md:hidden" />
          <h1 className="text-lg font-semibold text-white hidden md:block">
            Banna Capital
          </h1>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{profileName}</p>
              <p className="text-xs capitalize text-zinc-500">{profileRole}</p>
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
function SidebarSkeleton() {
  return (
    <aside className="hidden w-64 flex-col border-r border-white/5 bg-zinc-900/50 p-6 md:flex">
      <div className="mb-8">
        <div className="h-5 w-32 animate-pulse rounded bg-zinc-800" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-zinc-800" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-9 animate-pulse rounded-lg bg-zinc-800/50"
          />
        ))}
      </div>
    </aside>
  );
}
