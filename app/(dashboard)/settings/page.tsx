"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Database,
  Bell,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase";
import toast from "react-hot-toast";

// Seed opportunities array
const SEED_OPPORTUNITIES = [
  {
    title: "MegaMart Supermarket Expansion",
    category: "Supermarket",
    description: "Invest in the expansion of MegaMart retail supermarkets across tier-2 cities. This project will fund the setup of 5 new stores, inventory acquisition, and local marketing campaigns. A stable asset-backed investment offering steady returns.",
    roi: 16.50,
    duration_months: 18,
    min_investment: 30000,
    risk_level: "medium",
    status: "active"
  },
  {
    title: "Banna Residency Phase II",
    category: "Real Estate",
    description: "Premium residential apartments in the rapidly developing south-east corridor. The project covers 120 units across three towers with modern amenities. Phase I is fully sold out and Phase II offers early-bird pricing for investors.",
    roi: 22.00,
    duration_months: 24,
    min_investment: 100000,
    risk_level: "medium",
    status: "active"
  },
  {
    title: "Organic Spice Plantation",
    category: "Agriculture",
    description: "High-yield organic spice cultivation across 50 acres in Kerala. This project taps into the booming international demand for certified organic spices. Includes drip irrigation, post-harvest processing, and direct export contracts.",
    roi: 18.00,
    duration_months: 12,
    min_investment: 25000,
    risk_level: "low",
    status: "active"
  },
  {
    title: "FinTech SaaS Platform",
    category: "Technology",
    description: "Early-stage investment in a B2B fintech SaaS platform providing lending infrastructure to NBFCs and cooperative banks. The platform already has 12 paying customers and is growing 20% month-over-month.",
    roi: 28.00,
    duration_months: 36,
    min_investment: 50000,
    risk_level: "high",
    status: "active"
  },
  {
    title: "Gold-Backed Fixed Income Fund",
    category: "Commodities",
    description: "A physically-backed gold fund that provides stable fixed-income returns. Assets are stored in bonded vaults with third-party audits. Ideal for risk-averse investors seeking capital preservation with modest upside.",
    roi: 12.50,
    duration_months: 12,
    min_investment: 10000,
    risk_level: "low",
    status: "active"
  },
  {
    title: "Green Energy Solar Farm",
    category: "Technology",
    description: "An upcoming solar energy project aiming to build a 5MW grid-connected solar power plant. Currently in final licensing and approval phase. Ideal for ESG-focused investors seeking long-term yield.",
    roi: 21.00,
    duration_months: 24,
    min_investment: 50000,
    risk_level: "medium",
    status: "upcoming"
  },
  {
    title: "Banna Agro-Processing Unit",
    category: "Agriculture",
    description: "Upcoming modern processing unit for high-value agricultural crops. Designed to reduce post-harvest losses and export directly to Middle Eastern markets.",
    roi: 14.80,
    duration_months: 12,
    min_investment: 20000,
    risk_level: "low",
    status: "upcoming"
  },
  {
    title: "QuickBuy Retail Chain Launch",
    category: "Supermarket",
    description: "An upcoming franchise model for launching a chain of neighbourhood supermarkets in tier-3 cities. Combines bulk procurement with hyperlocal delivery to maximise margins.",
    roi: 15.00,
    duration_months: 18,
    min_investment: 40000,
    risk_level: "medium",
    status: "active"
  }
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Simulated notification preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [marketingAlerts, setMarketingAlerts] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email ?? "");

      // Use maybeSingle to prevent throwing an error if row doesn't exist
      const { data: prof } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (prof) {
        setProfile({
          name: prof.name,
          role: prof.role,
        });
      } else {
        // Automatically create missing profile row on the fly
        const newProf = {
          id: user.id,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "Investor",
          role: "investor",
        };
        const { error: insertError } = await supabase
          .from("profiles")
          .insert(newProf);

        if (!insertError) {
          setProfile({
            name: newProf.name,
            role: "investor",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [router]);

  const toggleAdminRole = async () => {
    if (!userId) return;
    setUpdatingRole(true);
    const currentRole = profile?.role || "investor";
    const newRole = currentRole === "admin" ? "investor" : "admin";
    try {
      const supabase = createSupabaseBrowser();
      // Use upsert to create or update the row robustly
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          name: profile?.name || userEmail.split("@")[0] || "Investor",
          role: newRole,
        });

      if (error) throw error;

      setProfile({
        name: profile?.name || userEmail.split("@")[0] || "Investor",
        role: newRole,
      });
      toast.success(`Role updated successfully to ${newRole}!`);
      router.refresh();
    } catch (err: any) {
      console.error("Error updating role:", err);
      const errMsg = err?.message || err?.details || err?.hint || (typeof err === "object" ? JSON.stringify(err) : String(err));
      toast.error(`Error: ${errMsg}`);
    } finally {
      setUpdatingRole(false);
    }
  };

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      const supabase = createSupabaseBrowser();

      // Check current user role - they need to be an admin to insert
      if (profile?.role !== "admin") {
        toast.error("You must enable Admin Privileges first to seed opportunities!");
        setSeeding(false);
        return;
      }

      let insertedCount = 0;
      let updatedCount = 0;

      for (const opp of SEED_OPPORTUNITIES) {
        const { data: existing } = await supabase
          .from("opportunities")
          .select("id")
          .eq("title", opp.title)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("opportunities")
            .update({
              category: opp.category,
              description: opp.description,
              roi: opp.roi,
              duration_months: opp.duration_months,
              min_investment: opp.min_investment,
              risk_level: opp.risk_level,
              status: opp.status,
            })
            .eq("id", existing.id);
          
          if (!error) updatedCount++;
        } else {
          const { error } = await supabase.from("opportunities").insert(opp);
          if (!error) insertedCount++;
        }
      }

      toast.success(`Database updated: ${insertedCount} inserted, ${updatedCount} updated successfully!`);
      router.refresh();
    } catch (err: any) {
      console.error("Error seeding database:", err);
      toast.error(err.message || "Failed to seed opportunities");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-zinc-400 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-emerald-400" />
          Platform Settings
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your account preferences, credentials, and developer settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: General preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile overview card */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-400" />
              General Profile
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.name || ""}
                    className="w-full rounded-lg border border-white/5 bg-zinc-800/30 px-3 py-2 text-zinc-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userEmail}
                    className="w-full rounded-lg border border-white/5 bg-zinc-800/30 px-3 py-2 text-zinc-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-400" />
              Notifications
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="font-medium text-white">Email Statements</p>
                  <p className="text-xs text-zinc-500">Receive monthly investment statements via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="border-t border-white/5 pt-3 flex items-center justify-between py-1">
                <div>
                  <p className="font-medium text-white">Deal Alerts</p>
                  <p className="text-xs text-zinc-500">Get notified when new investment opportunities go live</p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingAlerts}
                  onChange={(e) => setMarketingAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="border-t border-white/5 pt-3 flex items-center justify-between py-1">
                <div>
                  <p className="font-medium text-white">Push Notifications</p>
                  <p className="text-xs text-zinc-500">Receive real-time investment status updates in-app</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushAlerts}
                  onChange={(e) => setPushAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Developer Settings */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-emerald-500/10 bg-gradient-to-b from-emerald-950/20 to-zinc-900/50 p-6 space-y-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Developer & Testing Controls
            </h3>

            {/* Quick explanation */}
            <p className="text-xs text-zinc-400 leading-relaxed">
              Use these tools to toggle your account role and seed mock investment data.
            </p>

            {/* Role Manager */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-zinc-950/40 rounded-lg p-3 border border-white/5">
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Current Role</span>
                  <span className="text-sm font-bold text-white capitalize">{profile?.role || "investor"}</span>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  profile?.role === "admin" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-zinc-800 text-zinc-400"
                }`}>
                  {profile?.role === "admin" ? "Superuser" : "Standard"}
                </span>
              </div>

              <button
                onClick={toggleAdminRole}
                disabled={updatingRole}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs py-2.5 transition-all border border-white/5"
              >
                {updatingRole ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : profile?.role === "admin" ? (
                  <>
                    <Lock className="h-3.5 w-3.5 text-zinc-400" />
                    Demote to Investor Role
                  </>
                ) : (
                  <>
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    Promote to Admin Role
                  </>
                )}
              </button>
            </div>

            {/* Database seeder */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Database Seeding</h4>
              <p className="text-[11px] text-zinc-500">
                Populates opportunities with 8 premium active & upcoming deals, including the missing Supermarket deals.
              </p>

              {profile?.role !== "admin" && (
                <div className="flex gap-1.5 items-start rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-500/90 leading-normal">
                    You must promote yourself to Admin before you can seed opportunities.
                  </p>
                </div>
              )}

              <button
                onClick={seedDatabase}
                disabled={seeding || profile?.role !== "admin"}
                className={`w-full flex items-center justify-center gap-2 rounded-lg font-semibold text-xs py-2.5 transition-all border ${
                  profile?.role === "admin"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20"
                    : "bg-zinc-900 text-zinc-600 border-white/5 cursor-not-allowed"
                }`}
              >
                {seeding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Database className="h-3.5 w-3.5" />
                    Seed Opportunities Data
                  </>
                )}
              </button>

              {profile?.role === "admin" && (
                <div className="text-center pt-2">
                  <a
                    href="/admin"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                  >
                    Go to Admin Dashboard
                    <CheckCircle2 className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
