/**
 * Partial-payment / installment helpers. Pure module (no db imports) — runs on
 * server and client. Money is whole BDT taka.
 */

export const PAYMENT_METHODS = [
  { key: "bkash", label: "bKash", color: "#e2136e" },
  { key: "nagad", label: "Nagad", color: "#f6921e" },
  { key: "rocket", label: "Rocket", color: "#8c3494" },
  { key: "bank", label: "Bank Transfer", color: "#1a2f5e" },
  { key: "cod", label: "Cash on Delivery", color: "#16a34a" },
  { key: "cash", label: "Cash", color: "#15803d" },
  { key: "upay", label: "Upay", color: "#f59e0b" },
  { key: "surecash", label: "SureCash", color: "#0ea5e9" },
  { key: "other", label: "Other", color: "#64748b" },
] as const;

export type PaymentMethodKey = (typeof PAYMENT_METHODS)[number]["key"];
export const PAYMENT_METHOD_KEYS = PAYMENT_METHODS.map((m) => m.key) as string[];

export function methodLabel(key: string): string {
  return PAYMENT_METHODS.find((m) => m.key === key)?.label ?? key;
}
export function methodColor(key: string): string {
  return PAYMENT_METHODS.find((m) => m.key === key)?.color ?? "#64748b";
}

// ---- types -----------------------------------------------------------------

export interface PaymentRow {
  id: string;
  amount: number;
  method: string;
  txnId: string | null;
  note: string | null;
  date: string; // ISO
}

export interface InstallmentRow {
  id: string;
  label: string;
  amount: number;
  dueDate: string | null; // ISO
  sortOrder: number;
}

export type PayStatus = "unpaid" | "partial" | "paid";

export const PAY_STATUS_META: Record<
  PayStatus,
  { label: string; emoji: string; badge: string; bar: string }
> = {
  unpaid: {
    label: "Unpaid",
    emoji: "🔴",
    badge: "bg-red-100 text-red-700 border-red-200",
    bar: "bg-red-500",
  },
  partial: {
    label: "Partially Paid",
    emoji: "🟡",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    bar: "bg-amber-500",
  },
  paid: {
    label: "Fully Paid",
    emoji: "🟢",
    badge: "bg-green-100 text-green-700 border-green-200",
    bar: "bg-green-500",
  },
};

// ---- calculations ----------------------------------------------------------

export interface PaymentSummary {
  total: number;
  paid: number;
  remaining: number;
  percent: number; // 0–100, rounded
  status: PayStatus;
}

export function summarize(total: number, payments: PaymentRow[]): PaymentSummary {
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, total - paid);
  const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const status: PayStatus = paid <= 0 ? "unpaid" : paid >= total ? "paid" : "partial";
  return { total, paid, remaining, percent, status };
}

/** Render a text progress bar like ██████░░░░ 50% Paid. */
export function textBar(percent: number, slots = 10): string {
  const filled = Math.round((percent / 100) * slots);
  return "█".repeat(filled) + "░".repeat(Math.max(0, slots - filled)) + ` ${percent}% Paid`;
}

// ---- payment plans ---------------------------------------------------------

export interface PlanDef {
  key: string;
  label: string;
  /** percentage splits; labels parallel to splits */
  splits: number[];
  splitLabels: string[];
  /** days from order date for each installment due date (null = none) */
  dueOffsets: (number | null)[];
}

export const PAYMENT_PLANS: PlanDef[] = [
  {
    key: "full",
    label: "Full payment upfront (100%)",
    splits: [100],
    splitLabels: ["Full payment"],
    dueOffsets: [0],
  },
  {
    key: "30_70",
    label: "30% advance + 70% on delivery",
    splits: [30, 70],
    splitLabels: ["Advance (30%)", "On Delivery (70%)"],
    dueOffsets: [0, 15],
  },
  {
    key: "50_50",
    label: "50% advance + 50% on delivery",
    splits: [50, 50],
    splitLabels: ["Advance (50%)", "On Delivery (50%)"],
    dueOffsets: [0, 15],
  },
  {
    key: "70_30",
    label: "70% advance + 30% on delivery",
    splits: [70, 30],
    splitLabels: ["Advance (70%)", "On Delivery (30%)"],
    dueOffsets: [0, 15],
  },
  {
    key: "installment_3",
    label: "Pay in 3 installments",
    splits: [34, 33, 33],
    splitLabels: ["Installment 1", "Installment 2", "Installment 3"],
    dueOffsets: [0, 15, 30],
  },
];

// ---- advance-payment rules (checkout) --------------------------------------
// RULE: no full Cash-on-Delivery. A minimum advance (default 30%) is required;
// the remainder is collected as COD.

export const DEFAULT_MIN_ADVANCE_PCT = 30;

/** Map an advance percentage to the stored Order.paymentPlan key. */
export function planForAdvancePct(pct: number): string {
  if (pct >= 100) return "full";
  if (pct === 30) return "30_70";
  if (pct === 50) return "50_50";
  if (pct === 70) return "70_30";
  return "custom";
}

/** Minimum advance amount in taka for a given total + min percentage. */
export function minAdvanceAmount(total: number, minPct: number): number {
  return Math.ceil((total * minPct) / 100);
}

/** Standard advance options shown at checkout (>= minPct only). */
export function advanceOptions(total: number, minPct: number) {
  return [30, 50, 70, 100]
    .filter((p) => p >= minPct)
    .map((p) => {
      const advance =
        p >= 100 ? total : Math.round((total * p) / 100);
      return { pct: p, advance, cod: total - advance };
    });
}

export function planLabel(key: string | null | undefined): string {
  if (!key) return "Not set";
  if (key === "custom") return "Custom split";
  return PAYMENT_PLANS.find((p) => p.key === key)?.label ?? key;
}

/** Build installment rows for a plan. `customSplits` overrides for "custom". */
export function buildInstallments(
  planKey: string,
  total: number,
  startISO: string,
  customSplits?: number[]
): { label: string; amount: number; dueDate: string | null; sortOrder: number }[] {
  const start = new Date(startISO);
  const addDays = (d: number) =>
    new Date(start.getTime() + d * 86400000).toISOString();

  let splits: number[];
  let labels: string[];
  let offsets: (number | null)[];

  if (planKey === "custom" && customSplits && customSplits.length) {
    splits = customSplits;
    labels = customSplits.map((s, i) => `Installment ${i + 1} (${s}%)`);
    offsets = customSplits.map((_, i) => i * 15);
  } else {
    const plan = PAYMENT_PLANS.find((p) => p.key === planKey);
    if (!plan) return [];
    splits = plan.splits;
    labels = plan.splitLabels;
    offsets = plan.dueOffsets;
  }

  // amounts: round each, last takes remainder so they sum to total
  let allocated = 0;
  return splits.map((pct, i) => {
    const last = i === splits.length - 1;
    const amount = last
      ? total - allocated
      : Math.round((total * pct) / 100);
    allocated += amount;
    const off = offsets[i];
    return {
      label: labels[i] ?? `Installment ${i + 1}`,
      amount,
      dueDate: off == null ? null : addDays(off),
      sortOrder: i,
    };
  });
}

/** Mark each installment paid/overdue from cumulative payments. */
export function installmentStatuses(
  installments: InstallmentRow[],
  totalPaid: number,
  now = Date.now()
) {
  const sorted = [...installments].sort((a, b) => a.sortOrder - b.sortOrder);
  let cumulative = 0;
  return sorted.map((inst) => {
    cumulative += inst.amount;
    const paid = totalPaid >= cumulative;
    const partial = !paid && totalPaid > cumulative - inst.amount;
    const overdue =
      !paid && inst.dueDate != null && new Date(inst.dueDate).getTime() < now;
    return { ...inst, paid, partial, overdue };
  });
}

// ---- reminders -------------------------------------------------------------

export function reminderMessage(
  name: string,
  orderId: string,
  remaining: number
): string {
  const shortId = orderId.slice(-8).toUpperCase();
  const taka = `৳${new Intl.NumberFormat("en-IN").format(Math.round(remaining))}`;
  return `Dear ${name.split(" ")[0] || name}, your remaining balance for Order #${shortId} is ${taka}. Please pay before delivery. Thank you! — ChinaCart`;
}
