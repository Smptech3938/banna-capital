"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { createSupabaseBrowser } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ── Inline validation state ─────────────────────────────────── */
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowser();

    try {
      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // 2. Check if email confirmation is required
      //    If session exists → auto-logged-in (email confirm OFF)
      //    If no session → user must confirm email first
      if (data.user) {
        // 3. Insert profile row
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            name: name.trim(),
            phone: phone.trim(),
          });

        if (profileError) {
          console.error("Profile insert error:", profileError);
          // Don't block the user — auth account was created successfully
        }

        if (data.session) {
          // Email confirmation is OFF → user is logged in
          toast.success("Account created! Redirecting…");
          router.push("/dashboard");
        } else {
          // Email confirmation is ON → tell user to check email
          toast.success("Check your email to confirm your account!");
          router.push("/login");
        }
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared input class ──────────────────────────────────────── */
  const inputBase =
    "w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200";
  const inputNormal = `${inputBase} border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20`;
  const inputError = `${inputBase} border-red-500/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/8 blur-3xl" />
      </div>

      <form
        onSubmit={handleRegister}
        noValidate
        className="relative z-10 w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl
                   animate-[fadeInUp_0.5s_ease-out_both]"
      >
        {/* Header */}
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create Account
          </h1>
          <p className="text-sm text-zinc-400">
            Join{" "}
            <span className="font-semibold text-emerald-400">
              Banna Capital
            </span>{" "}
            today
          </p>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-name"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
          >
            Full Name
          </label>
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: "" }));
            }}
            placeholder="Muhammad Ali"
            className={errors.name ? inputError : inputNormal}
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-email"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
          >
            Email Address
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: "" }));
            }}
            placeholder="you@example.com"
            className={errors.email ? inputError : inputNormal}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-phone"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
          >
            Phone Number
          </label>
          <input
            id="register-phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
            }}
            placeholder="+92 300 1234567"
            className={errors.phone ? inputError : inputNormal}
          />
          {errors.phone && (
            <p className="text-xs text-red-400">{errors.phone}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-password"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((p) => ({ ...p, password: "" }));
              }}
              placeholder="••••••••"
              className={`${errors.password ? inputError : inputNormal} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25
                     transition-all duration-200
                     hover:bg-emerald-500 hover:shadow-emerald-500/30
                     active:scale-[0.98]
                     disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creating account…
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        {/* Footer link */}
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
