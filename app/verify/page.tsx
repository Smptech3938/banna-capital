"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { createSupabaseBrowser } from "@/lib/supabase";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  /* ── Handle OTP input ─────────────────────────────────────────── */
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // take last char
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace → go to previous
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    // Focus last filled or next empty
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  /* ── Verify OTP ───────────────────────────────────────────────── */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("");

    if (token.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    if (!email) {
      toast.error("Email missing. Please register again.");
      router.push("/register");
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowser();
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      if (error) {
        toast.error(error.message);
        // Clear OTP fields
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      if (data.session && data.user) {
        // Create or update user profile using metadata
        const metadata = data.user.user_metadata || {};
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            name: metadata.name || "Investor",
            phone: metadata.phone || "",
          });

        if (profileError) {
          console.error("Profile creation error on verification:", profileError);
        }

        toast.success("Email verified! Welcome to Banna Capital 🎉");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP ───────────────────────────────────────────────── */
  const handleResend = async () => {
    if (!email || cooldown > 0) return;

    setResending(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("New code sent! Check your email.");
        setCooldown(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast.error("Failed to resend. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/8 blur-3xl" />
      </div>

      <form
        onSubmit={handleVerify}
        className="relative z-10 w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl
                   animate-[fadeInUp_0.5s_ease-out_both]"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/15 ring-2 ring-emerald-500/20">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        {/* Header */}
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Verify Your Email
          </h1>
          <p className="text-sm text-zinc-400">
            We sent a 6-digit code to
          </p>
          {email && (
            <p className="text-sm font-medium text-emerald-400">{email}</p>
          )}
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`h-13 w-11 rounded-lg border bg-white/5 text-center text-lg font-bold text-white outline-none transition-all duration-200
                ${digit
                  ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                  : "border-white/10"
                }
                focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20`}
              id={`otp-${i}`}
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
          className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25
                     transition-all duration-200
                     hover:bg-emerald-500 hover:shadow-emerald-500/30
                     active:scale-[0.98]
                     disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying…
            </span>
          ) : (
            "Verify Email"
          )}
        </button>

        {/* Resend */}
        <div className="text-center">
          <p className="text-xs text-zinc-500">
            Didn&apos;t receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300 disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : resending
                ? "Sending…"
                : "Resend Code"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { Suspense } from "react";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-4">
          <div className="text-zinc-400 text-sm flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            Loading verification form…
          </div>
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
