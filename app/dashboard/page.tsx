import {
  LayoutDashboard,
  TrendingUp,
  Compass,
  ArrowLeftRight,
  User,
  Settings,
  DollarSign,
  Wallet,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase-server";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  // Fetch the authenticated user + their profile (server-side)
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile data (name, role)
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

  // Initials for avatar
  const initials = profileName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden w-64 flex-col border-r border-white/5 bg-zinc-900/50 p-6 md:flex">
        {/* Brand */}
        <div className="mb-8">
          <h2 className="text-lg font-bold tracking-tight text-white">
            Banna<span className="text-emerald-400">Capital</span>
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">Investment Platform</p>
        </div>

        {/* Nav — Main */}
        <nav className="flex flex-1 flex-col gap-1">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" active />
          <SidebarLink icon={TrendingUp} label="My Investments" />
          <SidebarLink icon={Compass} label="Opportunities" />
          <SidebarLink icon={ArrowLeftRight} label="Transactions" />

          {/* Divider */}
          <div className="my-3 border-t border-white/5" />

          <SidebarLink icon={User} label="Profile" />
          <SidebarLink icon={Settings} label="Settings" />
        </nav>

        {/* Logout — client component */}
        <LogoutButton />
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-zinc-900/30 px-6 backdrop-blur-sm">
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{profileName}</p>
              <p className="text-xs text-zinc-500 capitalize">{profileRole}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/20 ring-2 ring-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400">
                {initials}
              </span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 p-6">
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
              value="₹ 0"
              accent="emerald"
            />
            <StatCard
              icon={TrendingUp}
              label="Expected Profit"
              value="₹ 0"
              accent="sky"
            />
            <StatCard
              icon={Wallet}
              label="Active Investments"
              value="0"
              accent="violet"
            />
            <StatCard
              icon={Clock}
              label="Pending Investments"
              value="0"
              accent="amber"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Helper Components ────────────────────────────────────────────── */

function SidebarLink({
  icon: Icon,
  label,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors
        ${
          active
            ? "bg-emerald-600/10 text-emerald-400"
            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
        }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
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
      {/* Icon badge */}
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
