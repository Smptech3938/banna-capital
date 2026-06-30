"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Compass,
  Wallet,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── Admin nav items ─────────────────────────────────────────────── */
const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Compass, label: "Opportunities", href: "/admin/opportunities" },
  { icon: Wallet, label: "Investments", href: "/admin/investments" },
];

/* ── AdminSidebar ────────────────────────────────────────────────── */
export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Match logic:
   *  - "/admin" only matches exactly "/admin"
   *  - "/admin/users" matches "/admin/users" and "/admin/users/..."
   */
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        id="admin-mobile-menu-toggle"
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

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-zinc-900/95 p-6 backdrop-blur-md transition-transform duration-300 md:relative md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand + close button */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/20 ring-1 ring-emerald-500/30">
              <span className="text-sm font-bold text-emerald-400">BC</span>
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">
                Banna<span className="text-emerald-400">Capital</span>
              </span>
              <span className="text-[10px] text-zinc-500 block">
                Administration
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-1 flex-col gap-1">
          {adminNav.map((item) => (
            <AdminNavLink
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isActive(item.href)}
              onClick={() => setMobileOpen(false)}
            />
          ))}

          {/* Divider */}
          <div className="my-3 border-t border-white/5" />

          {/* Back to investor view */}
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Investor View
          </Link>
        </nav>
      </aside>
    </>
  );
}

/* ── AdminNavLink ────────────────────────────────────────────────── */
function AdminNavLink({
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
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
