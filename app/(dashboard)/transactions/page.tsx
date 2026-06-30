'use client';

import {
  ArrowLeftRight,
  Clock,
  Search,
} from 'lucide-react';

export default function TransactionsPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-emerald-400" />
          Transactions
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          View your complete transaction history
        </p>
      </div>

      {/* Coming Soon State */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-zinc-900/30 py-20 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600/20 to-emerald-400/10 ring-1 ring-emerald-500/20">
          <Clock className="h-7 w-7 text-emerald-400" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-white">
          Coming Soon
        </h3>
        <p className="mt-2 max-w-sm text-sm text-zinc-400 leading-relaxed">
          Transaction history, payment proof uploads, and downloadable statements
          are being built and will be available in the next update.
        </p>
        <div className="mt-6 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">In Development</span>
        </div>
      </div>
    </>
  );
}
