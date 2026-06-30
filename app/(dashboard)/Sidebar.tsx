"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Compass,
  ArrowLeftRight,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useState } from "react";

/* ── Nav items configuration ──────────────────────────────────────── */
const mainNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: TrendingUp, label: "My Investments", href: "/investments" },
  { icon: Compass, label: "Opportunities", href: "/opportunities" },
  { icon: ArrowLeftRight, label: "Transactions", href: "/transactions" },
];

const bottomNav = [
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

/* ── Sidebar Component ────────────────────────────────────────────── */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        id="mobile-menu-toggle"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 ring-1 ring-white/10 md:hidden"
      >
        <Menu className="h-5 w-5 text-zinc-300" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-zinc-900/95 p-6 backdrop-blur-md transition-transform duration-300 md:relative md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand + close button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              Banna<span className="text-emerald-400">Capital</span>
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">Investment Platform</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex flex-1 flex-col gap-1">
          {mainNav.map((item) => (
            <SidebarLink
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname.startsWith(item.href)}
              onClick={() => setMobileOpen(false)}
            />
          ))}

          {/* Divider */}
          <div className="my-3 border-t border-white/5" />

          {bottomNav.map((item) => (
            <SidebarLink
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname.startsWith(item.href)}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Logout */}
        <button
          id="logout-button"
          onClick={handleLogout}
          className="mt-auto flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>
    </>
  );
}

/* ── SidebarLink ──────────────────────────────────────────────────── */
function SidebarLink({
  icon: Icon,
  label,
  href,
  active = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-emerald-600/10 text-emerald-400"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
