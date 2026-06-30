/**
 * Investment business logic — status transitions and calculations.
 *
 * This module centralises all investment workflow rules so they can be
 * reused across admin pages, API routes, and future server actions.
 *
 * Status workflow:
 *   pending → approved → active → completed
 *   pending → rejected  (terminal state)
 */

import type { InvestmentStatus } from "./types";

/* ── Valid status transitions ────────────────────────────────────── */

const VALID_TRANSITIONS: Record<InvestmentStatus, InvestmentStatus[]> = {
  pending: ["approved", "rejected"],
  approved: ["active"],
  active: ["completed"],
  completed: [],   // terminal
  rejected: [],    // terminal
};

/**
 * Check whether a status transition is allowed.
 *
 * @example
 *   canTransition("pending", "approved")   // true
 *   canTransition("pending", "completed")  // false
 *   canTransition("rejected", "active")    // false
 */
export function canTransition(
  from: InvestmentStatus,
  to: InvestmentStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Return the list of statuses that can be reached from the current status.
 * Returns an empty array for terminal states.
 */
export function getNextStatuses(
  current: InvestmentStatus
): InvestmentStatus[] {
  return VALID_TRANSITIONS[current] ?? [];
}

/**
 * Check if a status is terminal (no further transitions possible).
 */
export function isTerminalStatus(status: InvestmentStatus): boolean {
  return getNextStatuses(status).length === 0;
}

/* ── Profit calculation ──────────────────────────────────────────── */

/**
 * Calculate expected profit from an investment amount and ROI percentage.
 *
 * @param amount  - The invested principal (e.g. 50000)
 * @param roi     - The return percentage (e.g. 16.5 means 16.5%)
 * @returns       - The expected profit (e.g. 8250)
 */
export function calculateProfit(amount: number, roi: number): number {
  return (amount * roi) / 100;
}

/* ── Status badge styling ────────────────────────────────────────── */

interface StatusBadgeStyle {
  bg: string;
  text: string;
  label: string;
}

const STATUS_STYLES: Record<InvestmentStatus, StatusBadgeStyle> = {
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    label: "Pending",
  },
  approved: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    label: "Approved",
  },
  active: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Active",
  },
  completed: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    label: "Completed",
  },
  rejected: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Rejected",
  },
};

/**
 * Get the Tailwind CSS classes and display label for a status badge.
 */
export function getStatusStyle(status: InvestmentStatus): StatusBadgeStyle {
  return (
    STATUS_STYLES[status] ?? {
      bg: "bg-zinc-800",
      text: "text-zinc-500",
      label: status,
    }
  );
}

/* ── Action button config ────────────────────────────────────────── */

interface ActionConfig {
  targetStatus: InvestmentStatus;
  label: string;
  title: string;
  style: string;
}

/**
 * Return the action buttons that should be rendered for a given status.
 * Returns an empty array for terminal states.
 */
export function getActionButtons(current: InvestmentStatus): ActionConfig[] {
  switch (current) {
    case "pending":
      return [
        {
          targetStatus: "approved",
          label: "Approve",
          title: "Approve Investment",
          style:
            "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
        },
        {
          targetStatus: "rejected",
          label: "Reject",
          title: "Reject Investment",
          style:
            "bg-red-500/10 text-red-400 hover:bg-red-500/20",
        },
      ];
    case "approved":
      return [
        {
          targetStatus: "active",
          label: "Activate",
          title: "Set Investment as Active",
          style:
            "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
        },
      ];
    case "active":
      return [
        {
          targetStatus: "completed",
          label: "Complete",
          title: "Mark as Completed",
          style:
            "bg-sky-500/10 text-sky-400 hover:bg-sky-500/20",
        },
      ];
    default:
      return [];
  }
}
