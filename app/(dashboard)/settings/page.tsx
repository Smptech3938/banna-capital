"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Loader2,
} from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase";

/**
 * Platform Settings — General profile overview and notification preferences.
 *
 * The "Developer & Testing Controls" card (role toggle + DB seeder) has been
 * permanently removed. Admin roles are now managed exclusively via:
 *   1. The Admin → Users page (by an existing admin)
 *   2. Direct SQL in the Supabase dashboard
 */
export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null);

  // Notification preferences (persisted locally for now)
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

      setUserEmail(user.email ?? "");

      // Use maybeSingle to prevent throwing an error if row doesn't exist
      const { data: prof } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (prof) {
        setProfile({ name: prof.name, role: prof.role });
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
          setProfile({ name: newProf.name, role: "investor" });
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
          Manage your account preferences and notification settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                Account Role
              </label>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                profile?.role === "admin"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                  : "bg-zinc-800 text-zinc-400"
              }`}>
                {profile?.role || "investor"}
              </span>
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
    </>
  );
}
