"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createSupabaseBrowser } from "@/lib/supabase";
import { formatCurrency, formatROI, formatDuration } from "@/lib/format";

interface InvestFormProps {
  opportunityId: string;
  minInvestment: number;
  roi: number;
  durationMonths: number;
  title: string;
}

export default function InvestForm({
  opportunityId,
  minInvestment,
  roi,
  durationMonths,
  title,
}: InvestFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const numericAmount = Number(amount) || 0;
  
  // 1. Real-time Calculation Formulas
  const expectedProfit = (numericAmount * roi) / 100;
  const totalReturn = numericAmount + expectedProfit;

  // 2. Real-time Input Validation
  const handleAmountChange = (val: string) => {
    setAmount(val);
    
    if (val.trim() === "") {
      setError("");
      return;
    }

    const num = Number(val);
    if (isNaN(num)) {
      setError("Please enter a valid numeric amount.");
      return;
    }

    if (num < 0) {
      setError("Investment amount cannot be negative.");
      return;
    }

    if (num < minInvestment) {
      setError(`Amount must be at least ${formatCurrency(minInvestment)}.`);
      return;
    }

    setError("");
  };

  const isValid = amount.trim() !== "" && !error && numericAmount >= minInvestment;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);

    try {
      const supabase = createSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login to invest");
        router.push("/login");
        return;
      }

      const { error: insertError } = await supabase
        .from("investments")
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          amount: numericAmount,
          status: "pending",
        });

      if (insertError) {
        console.error("Investment error:", insertError);
        toast.error("Failed to submit investment. Please try again.");
        return;
      }

      toast.success("Investment request submitted successfully!");
      router.push("/investments");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="invest-amount"
          className="block text-sm font-medium text-zinc-300"
        >
          Investment Amount
        </label>
        <div className="relative mt-1.5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
            ₹
          </span>
          <input
            id="invest-amount"
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={`Min. ${formatCurrency(minInvestment)}`}
            className="w-full rounded-lg border border-white/10 bg-zinc-800/50 py-2.5 pl-7 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        )}
      </div>

      {/* Investment summary card - Always visible below the input */}
      <div className="rounded-lg border border-white/5 bg-zinc-800/30 p-4 space-y-2.5">
        <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Investment Summary
        </h4>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Investment Amount</span>
          <span className="text-white font-medium">
            {formatCurrency(numericAmount)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">ROI %</span>
          <span className="text-emerald-400 font-medium">
            {formatROI(roi)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Expected Profit</span>
          <span className="text-emerald-400 font-medium">
            + {formatCurrency(expectedProfit)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Duration</span>
          <span className="text-white font-medium">
            {formatDuration(durationMonths)}
          </span>
        </div>
        <div className="border-t border-white/5 pt-2 flex justify-between text-sm">
          <span className="text-zinc-300 font-medium">Total Return</span>
          <span className="text-white font-bold">
            {formatCurrency(totalReturn)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !isValid}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          `Invest in ${title}`
        )}
      </button>

      <p className="text-center text-xs text-zinc-500">
        Your investment will be reviewed and approved by our team.
      </p>
    </form>
  );
}
