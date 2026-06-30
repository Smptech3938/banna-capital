/**
 * Formatting utilities for Banna Capital.
 * Centralises currency, date, and percentage formatting.
 */

/** Format a number as Indian Rupee currency (₹ 1,00,000) */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a date string to a human-readable format (e.g. "23 Jun 2026") */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format ROI as a percentage string (e.g. "18%") */
export function formatROI(roi: number): string {
  return `${Number(roi).toFixed(roi % 1 === 0 ? 0 : 1)}%`;
}

/** Format duration in months to a human-readable string */
export function formatDuration(months: number): string {
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (remaining === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years}y ${remaining}m`;
}
