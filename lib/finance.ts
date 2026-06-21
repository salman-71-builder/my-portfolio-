/**
 * Shared finance helpers for the admin finance dashboard.
 * Pure (no server/db imports) so it can run on both the server and client.
 *
 * Money model
 * - Revenue        = sum of order totals for non-cancelled orders
 * - COGS           = per-item cost × qty (real ProductCost override, else a
 *                    fixed ratio of the selling price)
 * - Net Profit     = Revenue − COGS − operating expenses (Expense table)
 */

/** Default cost as a fraction of selling price when no real cost is set. */
export const DEFAULT_COST_RATIO = 0.6; // ⇒ ~40% gross margin

export const EXPENSE_CATEGORIES = [
  { key: "product_cost", label: "Product Cost (China)", color: "#c0392b" },
  { key: "shipping", label: "Shipping / Freight", color: "#1a2f5e" },
  { key: "customs", label: "Customs / Import Duty", color: "#0ea5e9" },
  { key: "marketing", label: "Marketing / Ads", color: "#f59e0b" },
  { key: "packaging", label: "Packaging", color: "#10b981" },
  { key: "salaries", label: "Salaries", color: "#8b5cf6" },
  { key: "other", label: "Other", color: "#64748b" },
] as const;

export type ExpenseCategoryKey = (typeof EXPENSE_CATEGORIES)[number]["key"];

export const EXPENSE_CATEGORY_KEYS = EXPENSE_CATEGORIES.map(
  (c) => c.key
) as ExpenseCategoryKey[];

export function expenseLabel(key: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
export function expenseColor(key: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.key === key)?.color ?? "#64748b";
}

/** Format taka with Bangladeshi/Indian lakh grouping, e.g. ৳1,50,000. */
export function formatTaka(amount: number): string {
  const n = Math.round(amount);
  const sign = n < 0 ? "-" : "";
  const grouped = new Intl.NumberFormat("en-IN").format(Math.abs(n));
  return `${sign}৳${grouped}`;
}

/** Compact taka for chart axes, e.g. ৳1.5L, ৳2.3Cr. */
export function formatTakaCompact(amount: number): string {
  const n = Math.abs(Math.round(amount));
  const sign = amount < 0 ? "-" : "";
  if (n >= 1e7) return `${sign}৳${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `${sign}৳${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `${sign}৳${(n / 1e3).toFixed(0)}K`;
  return `${sign}৳${n}`;
}

// ---- Types -----------------------------------------------------------------

export interface FinanceOrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  category: string;
}

export interface FinanceOrder {
  id: string;
  name: string;
  email: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  createdAt: string; // ISO
  items: FinanceOrderItem[];
}

export interface ExpenseRow {
  id: string;
  category: string;
  amount: number;
  note: string | null;
  date: string; // ISO
}

/** productId → cost price per unit (override). */
export type CostMap = Record<string, number>;

// ---- Cost / profit math ----------------------------------------------------

export function unitCost(
  item: Pick<FinanceOrderItem, "productId" | "unitPrice">,
  costMap: CostMap,
  ratio = DEFAULT_COST_RATIO
): number {
  const override = costMap[item.productId];
  if (override != null) return override;
  return Math.round(item.unitPrice * ratio);
}

export function orderCOGS(
  order: FinanceOrder,
  costMap: CostMap,
  ratio = DEFAULT_COST_RATIO
): number {
  return order.items.reduce(
    (sum, it) => sum + unitCost(it, costMap, ratio) * it.quantity,
    0
  );
}

export function isActive(order: FinanceOrder): boolean {
  // cancelled & returned orders don't count toward revenue
  return order.status !== "cancelled" && order.status !== "returned";
}

/** Per-order financial summary (selling price, cost, profit, margin). */
export function orderFinance(order: FinanceOrder, costMap: CostMap) {
  const revenue = order.total;
  const cost = orderCOGS(order, costMap);
  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  return { revenue, cost, profit, margin };
}

// ---- Date helpers ----------------------------------------------------------

export function monthKey(iso: string): string {
  return iso.slice(0, 7); // YYYY-MM
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
}

/** Percentage change a→b, guarding divide-by-zero. */
export function pctChange(prev: number, curr: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null; // null ⇒ "new" (no baseline)
  return ((curr - prev) / Math.abs(prev)) * 100;
}

// ---- Period aggregation ----------------------------------------------------

export interface PeriodSummary {
  revenue: number;
  cogs: number; // auto cost-of-goods from orders
  expenseByCat: Record<string, number>; // logged operating expenses by category
  operatingExpenses: number; // sum of all Expense rows
  // grouped P&L lines
  costOfProducts: number; // cogs + logged product_cost
  shippingCosts: number; // shipping + customs
  otherExpenses: number; // marketing + packaging + salaries + other
  totalCosts: number;
  netProfit: number;
  margin: number; // %
  orderCount: number;
  units: number;
  aov: number;
}

function inWindow(iso: string, start?: number, end?: number): boolean {
  const t = new Date(iso).getTime();
  if (start != null && t < start) return false;
  if (end != null && t >= end) return false;
  return true;
}

/**
 * Aggregate revenue, COGS and expenses over an optional [start, end) window
 * (epoch ms). Only non-cancelled orders count toward revenue/COGS.
 */
export function summarize(
  orders: FinanceOrder[],
  expenses: ExpenseRow[],
  costMap: CostMap,
  start?: number,
  end?: number,
  ratio = DEFAULT_COST_RATIO
): PeriodSummary {
  let revenue = 0;
  let cogs = 0;
  let orderCount = 0;
  let units = 0;

  for (const o of orders) {
    if (!isActive(o)) continue;
    if (!inWindow(o.createdAt, start, end)) continue;
    revenue += o.total;
    cogs += orderCOGS(o, costMap, ratio);
    orderCount += 1;
    units += o.items.reduce((n, i) => n + i.quantity, 0);
  }

  const expenseByCat: Record<string, number> = {};
  for (const key of EXPENSE_CATEGORY_KEYS) expenseByCat[key] = 0;
  let operatingExpenses = 0;
  for (const e of expenses) {
    if (!inWindow(e.date, start, end)) continue;
    expenseByCat[e.category] = (expenseByCat[e.category] ?? 0) + e.amount;
    operatingExpenses += e.amount;
  }

  const costOfProducts = cogs + (expenseByCat.product_cost ?? 0);
  const shippingCosts =
    (expenseByCat.shipping ?? 0) + (expenseByCat.customs ?? 0);
  const otherExpenses =
    (expenseByCat.marketing ?? 0) +
    (expenseByCat.packaging ?? 0) +
    (expenseByCat.salaries ?? 0) +
    (expenseByCat.other ?? 0);
  const totalCosts = costOfProducts + shippingCosts + otherExpenses;
  const netProfit = revenue - totalCosts;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  return {
    revenue,
    cogs,
    expenseByCat,
    operatingExpenses,
    costOfProducts,
    shippingCosts,
    otherExpenses,
    totalCosts,
    netProfit,
    margin,
    orderCount,
    units,
    aov,
  };
}

/** Inclusive-start / exclusive-end epoch ms for common named ranges. */
export function namedRange(
  name: string,
  now = new Date()
): { start?: number; end?: number; label: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const startOfDay = new Date(y, m, d).getTime();
  switch (name) {
    case "today":
      return { start: startOfDay, end: startOfDay + 86400000, label: "Today" };
    case "week": {
      const dow = now.getDay(); // 0 Sun
      const monday = new Date(y, m, d - ((dow + 6) % 7)).getTime();
      return { start: monday, end: monday + 7 * 86400000, label: "This Week" };
    }
    case "month":
      return {
        start: new Date(y, m, 1).getTime(),
        end: new Date(y, m + 1, 1).getTime(),
        label: "This Month",
      };
    case "lastMonth":
      return {
        start: new Date(y, m - 1, 1).getTime(),
        end: new Date(y, m, 1).getTime(),
        label: "Last Month",
      };
    case "year":
      return {
        start: new Date(y, 0, 1).getTime(),
        end: new Date(y + 1, 0, 1).getTime(),
        label: "This Year",
      };
    default:
      return { label: "All Time" };
  }
}
