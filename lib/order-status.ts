/**
 * Order lifecycle statuses. The list is ordered by fulfilment progress.
 * Older orders may still carry the original 5 values — all remain valid.
 */
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface StatusMeta {
  label: string;
  emoji: string;
  /** Tailwind classes for the badge. */
  badge: string;
}

export const STATUS_META: Record<string, StatusMeta> = {
  pending: { label: "Pending", emoji: "🟡", badge: "bg-amber-100 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", emoji: "🔵", badge: "bg-sky-100 text-sky-700 border-sky-200" },
  processing: { label: "Processing", emoji: "🟣", badge: "bg-blue-100 text-blue-700 border-blue-200" },
  packed: { label: "Packed", emoji: "📦", badge: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  shipped: { label: "Shipped", emoji: "✈️", badge: "bg-purple-100 text-purple-700 border-purple-200" },
  out_for_delivery: { label: "Out for Delivery", emoji: "🚚", badge: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  delivered: { label: "Delivered", emoji: "✅", badge: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", emoji: "❌", badge: "bg-red-100 text-red-700 border-red-200" },
  returned: { label: "Returned", emoji: "↩️", badge: "bg-rose-100 text-rose-700 border-rose-200" },
};

/** Backwards-compatible alias used by older components. */
export const STATUS_STYLES: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_META).map(([k, v]) => [k, v.badge])
);

export function statusLabel(status: string): string {
  return STATUS_META[status]?.label ?? status;
}
export function statusEmoji(status: string): string {
  return STATUS_META[status]?.emoji ?? "•";
}

/** Statuses that do NOT count toward revenue (money returned / never collected). */
export const NON_REVENUE_STATUSES = new Set(["cancelled", "returned"]);

export function isRevenueStatus(status: string): boolean {
  return !NON_REVENUE_STATUSES.has(status);
}
