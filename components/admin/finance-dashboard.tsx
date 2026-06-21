"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Percent,
  ShoppingBag,
  Users,
  RotateCcw,
  Printer,
  Download,
  Lightbulb,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseManager } from "@/components/admin/expense-manager";
import {
  summarize,
  namedRange,
  orderFinance,
  unitCost,
  monthLabel,
  pctChange,
  formatTaka,
  EXPENSE_CATEGORIES,
  type FinanceOrder,
  type ExpenseRow,
  type CostMap,
} from "@/lib/finance";

const ChartSkeleton = () => (
  <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
    Loading chart…
  </div>
);

const RevenueLineChart = dynamic(
  () => import("./finance-charts").then((m) => ({ default: m.RevenueLineChart })),
  { ssr: false, loading: ChartSkeleton }
);
const ProfitBarChart = dynamic(
  () => import("./finance-charts").then((m) => ({ default: m.ProfitBarChart })),
  { ssr: false, loading: ChartSkeleton }
);
const ExpensePie = dynamic(
  () => import("./finance-charts").then((m) => ({ default: m.ExpensePie })),
  { ssr: false, loading: ChartSkeleton }
);
const HBarChart = dynamic(
  () => import("./finance-charts").then((m) => ({ default: m.HBarChart })),
  { ssr: false, loading: ChartSkeleton }
);
const DailySalesChart = dynamic(
  () => import("./finance-charts").then((m) => ({ default: m.DailySalesChart })),
  { ssr: false, loading: ChartSkeleton }
);

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "year", label: "This Year" },
  { key: "all", label: "All Time" },
];

function last12MonthKeys(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}
function monthWindow(key: string) {
  const [y, m] = key.split("-").map(Number);
  return {
    start: new Date(y, m - 1, 1).getTime(),
    end: new Date(y, m, 1).getTime(),
  };
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function FinanceDashboard({
  orders,
  initialExpenses,
  costMap,
}: {
  orders: FinanceOrder[];
  initialExpenses: ExpenseRow[];
  costMap: CostMap;
}) {
  const [expenses, setExpenses] = React.useState<ExpenseRow[]>(initialExpenses);
  const [period, setPeriod] = React.useState("month");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [profitFilter, setProfitFilter] = React.useState("all");

  const months = React.useMemo(last12MonthKeys, []);
  const [plMonth, setPlMonth] = React.useState(months[months.length - 1]);
  const [cmpMonth, setCmpMonth] = React.useState<string>("none");

  // ---- current window -------------------------------------------------------
  const window_ = React.useMemo(() => {
    if (period === "custom" && customFrom && customTo) {
      return {
        start: new Date(customFrom).getTime(),
        end: new Date(customTo).getTime() + 86400000,
        label: `${customFrom} → ${customTo}`,
      };
    }
    return namedRange(period);
  }, [period, customFrom, customTo]);

  const summary = React.useMemo(
    () => summarize(orders, expenses, costMap, window_.start, window_.end),
    [orders, expenses, costMap, window_]
  );

  // previous equivalent window (for ↑/↓ comparison)
  const prevSummary = React.useMemo(() => {
    if (window_.start == null || window_.end == null) return null;
    const len = window_.end - window_.start;
    return summarize(
      orders,
      expenses,
      costMap,
      window_.start - len,
      window_.start
    );
  }, [orders, expenses, costMap, window_]);

  // ---- 12-month series ------------------------------------------------------
  const monthly = React.useMemo(
    () =>
      months.map((k) => {
        const w = monthWindow(k);
        const s = summarize(orders, expenses, costMap, w.start, w.end);
        return { key: k, label: monthLabel(k).replace(/ \d+$/, ""), revenue: s.revenue, profit: s.netProfit };
      }),
    [months, orders, expenses, costMap]
  );

  // ---- expense pie (period) -------------------------------------------------
  const expensePie = React.useMemo(() => {
    const slices: { name: string; value: number; color?: string }[] = [
      { name: "Cost of Goods (auto)", value: summary.cogs, color: "#94a3b8" },
    ];
    for (const c of EXPENSE_CATEGORIES) {
      slices.push({
        name: c.label,
        value: summary.expenseByCat[c.key] ?? 0,
        color: c.color,
      });
    }
    return slices;
  }, [summary]);

  // ---- per-product / per-category aggregation (period) ----------------------
  const productAgg = React.useMemo(() => {
    const map = new Map<
      string,
      { name: string; category: string; revenue: number; cost: number; units: number }
    >();
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      if (window_.start != null && new Date(o.createdAt).getTime() < window_.start) continue;
      if (window_.end != null && new Date(o.createdAt).getTime() >= window_.end) continue;
      for (const it of o.items) {
        const cur =
          map.get(it.productId) ??
          { name: it.name, category: it.category, revenue: 0, cost: 0, units: 0 };
        cur.revenue += it.unitPrice * it.quantity;
        cur.cost += unitCost(it, costMap) * it.quantity;
        cur.units += it.quantity;
        map.set(it.productId, cur);
      }
    }
    return Array.from(map.values()).map((p) => ({
      ...p,
      profit: p.revenue - p.cost,
      margin: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue) * 100 : 0,
    }));
  }, [orders, costMap, window_]);

  const bestSellers = React.useMemo(
    () =>
      [...productAgg]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6)
        .map((p) => ({ name: p.name, value: p.revenue })),
    [productAgg]
  );
  const categorySales = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const p of productAgg)
      map.set(p.category, (map.get(p.category) ?? 0) + p.revenue);
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [productAgg]);

  const mostProfitable = React.useMemo(
    () => [...productAgg].filter((p) => p.units > 0).sort((a, b) => b.margin - a.margin).slice(0, 5),
    [productAgg]
  );
  const leastProfitable = React.useMemo(
    () => [...productAgg].filter((p) => p.units > 0).sort((a, b) => a.margin - b.margin).slice(0, 5),
    [productAgg]
  );

  // ---- daily sales (current calendar month) ---------------------------------
  const daily = React.useMemo(() => {
    const now = new Date();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const arr = Array.from({ length: days }, (_, i) => ({
      day: String(i + 1),
      revenue: 0,
    }));
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      const d = new Date(o.createdAt);
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
        arr[d.getDate() - 1].revenue += o.total;
      }
    }
    return arr;
  }, [orders]);

  // ---- orders financial view ------------------------------------------------
  const ordersFin = React.useMemo(() => {
    const rows = orders
      .filter((o) => o.status !== "cancelled")
      .filter((o) => {
        const t = new Date(o.createdAt).getTime();
        if (window_.start != null && t < window_.start) return false;
        if (window_.end != null && t >= window_.end) return false;
        return true;
      })
      .map((o) => ({ order: o, ...orderFinance(o, costMap) }));
    const filtered =
      profitFilter === "profit"
        ? rows.filter((r) => r.profit > 0)
        : profitFilter === "loss"
          ? rows.filter((r) => r.profit <= 0)
          : rows;
    return filtered.sort((a, b) => b.profit - a.profit);
  }, [orders, costMap, window_, profitFilter]);

  const totalOrderProfit = ordersFin.reduce((s, r) => s + r.profit, 0);

  // ---- key metrics ----------------------------------------------------------
  const metrics = React.useMemo(() => {
    const byEmail = new Map<string, number>();
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      byEmail.set(o.email, (byEmail.get(o.email) ?? 0) + 1);
    }
    const customers = byEmail.size;
    const repeat = Array.from(byEmail.values()).filter((n) => n > 1).length;
    const repeatPct = customers ? Math.round((repeat / customers) * 100) : 0;
    const pending = orders.filter((o) => o.status === "pending").length;
    const completed = orders.filter((o) => o.status === "delivered").length;
    const refunds = orders
      .filter((o) => o.status === "cancelled")
      .reduce((s, o) => s + o.total, 0);
    return {
      customers,
      repeatPct,
      totalOrders: orders.length,
      pending,
      completed,
      refunds,
    };
  }, [orders]);

  // ---- insights -------------------------------------------------------------
  const insights = React.useMemo(() => {
    const out: { tone: "good" | "warn" | "info"; text: string }[] = [];
    const withRev = monthly.filter((m) => m.revenue > 0);
    if (withRev.length) {
      const best = withRev.reduce((a, b) => (b.revenue > a.revenue ? b : a));
      out.push({ tone: "good", text: `Your best month was ${monthLabel(best.key)} 🎉` });
    }
    if (prevSummary) {
      const ch = pctChange(prevSummary.netProfit, summary.netProfit);
      if (ch != null && Math.abs(ch) >= 1) {
        out.push({
          tone: ch >= 0 ? "good" : "warn",
          text: `Profit ${ch >= 0 ? "increased" : "decreased"} ${Math.abs(
            Math.round(ch)
          )}% vs the previous period ${ch >= 0 ? "📈" : "📉"}`,
        });
      }
    }
    if (categorySales.length) {
      out.push({ tone: "info", text: `${categorySales[0].name} is your top earner` });
    }
    if (bestSellers.length) {
      out.push({ tone: "info", text: `Consider restocking “${bestSellers[0].name}”` });
    }
    if (summary.revenue > 0) {
      if (summary.netProfit < 0)
        out.push({ tone: "warn", text: "⚠️ You are operating at a loss this period" });
      else if (summary.margin >= 25)
        out.push({ tone: "good", text: "Your profit margin is healthy ✅" });
      else if (summary.margin >= 10)
        out.push({ tone: "info", text: "Your profit margin is okay — room to improve" });
      else
        out.push({ tone: "warn", text: "Your profit margin is thin — review costs" });
    }
    return out;
  }, [monthly, prevSummary, summary, categorySales, bestSellers]);

  // ---- P&L month summaries --------------------------------------------------
  const plSummary = React.useMemo(() => {
    const w = monthWindow(plMonth);
    return summarize(orders, expenses, costMap, w.start, w.end);
  }, [orders, expenses, costMap, plMonth]);
  const cmpSummary = React.useMemo(() => {
    if (cmpMonth === "none") return null;
    const w = monthWindow(cmpMonth);
    return summarize(orders, expenses, costMap, w.start, w.end);
  }, [orders, expenses, costMap, cmpMonth]);

  // ---- export ---------------------------------------------------------------
  function exportCSV() {
    const lines: string[] = [];
    lines.push(`ChinaCart Finance Report — ${window_.label}`);
    lines.push("");
    lines.push("Profit & Loss");
    lines.push("Line,Amount (BDT)");
    lines.push(`Total Sales Revenue,${summary.revenue}`);
    lines.push(`Cost of Products (China),-${summary.costOfProducts}`);
    lines.push(`Shipping Costs,-${summary.shippingCosts}`);
    lines.push(`Other Expenses,-${summary.otherExpenses}`);
    lines.push(`Net Profit/Loss,${summary.netProfit}`);
    lines.push(`Profit Margin,${summary.margin.toFixed(1)}%`);
    lines.push("");
    lines.push("Orders");
    lines.push("Order ID,Customer,Date,Selling Price,Cost Price,Profit,Margin %");
    for (const r of ordersFin) {
      lines.push(
        [
          r.order.id,
          `"${r.order.name.replace(/"/g, "'")}"`,
          new Date(r.order.createdAt).toISOString().slice(0, 10),
          r.revenue,
          r.cost,
          r.profit,
          r.margin.toFixed(1),
        ].join(",")
      );
    }
    downloadFile(
      `chinacart-finance-${Date.now()}.csv`,
      lines.join("\n"),
      "text/csv;charset=utf-8"
    );
  }

  function printReport() {
    window.print();
  }

  return (
    <div className="finance-print mt-6 space-y-8">
      {/* Control bar */}
      <div className="no-print flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p.key
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-card px-2 py-1 text-sm">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => {
              setCustomFrom(e.target.value);
              setPeriod("custom");
            }}
            className="bg-transparent outline-none"
            aria-label="From date"
          />
          <span className="text-muted-foreground">→</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => {
              setCustomTo(e.target.value);
              setPeriod("custom");
            }}
            className="bg-transparent outline-none"
            aria-label="To date"
          />
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" onClick={printReport}>
            <Printer className="h-4 w-4" /> Month-End Report
          </Button>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print-only">
        <h2 className="text-2xl font-bold">ChinaCart — Finance Report</h2>
        <p className="text-sm">
          Period: {window_.label} · Generated{" "}
          {new Date().toLocaleDateString("en-GB")}
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <OverviewCard
          label={`Revenue (${window_.label})`}
          value={formatTaka(summary.revenue)}
          icon={Wallet}
          accent="text-navy"
          change={prevSummary ? pctChange(prevSummary.revenue, summary.revenue) : null}
        />
        <OverviewCard
          label="Total Costs"
          value={formatTaka(summary.totalCosts)}
          icon={Receipt}
          accent="text-amber-600"
          change={prevSummary ? pctChange(prevSummary.totalCosts, summary.totalCosts) : null}
          invert
        />
        <OverviewCard
          label={summary.netProfit >= 0 ? "Net Profit" : "Net Loss"}
          value={formatTaka(summary.netProfit)}
          icon={summary.netProfit >= 0 ? TrendingUp : TrendingDown}
          accent={summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}
          valueClass={summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}
          change={prevSummary ? pctChange(prevSummary.netProfit, summary.netProfit) : null}
        />
        <OverviewCard
          label="Profit Margin"
          value={`${summary.margin.toFixed(1)}%`}
          icon={Percent}
          accent="text-purple-600"
        />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((ins, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-xl border p-3 text-sm soft-shadow ${
                ins.tone === "good"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : ins.tone === "warn"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border bg-card text-foreground"
              }`}
            >
              {ins.tone === "warn" ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : ins.tone === "good" ? (
                <Trophy className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              )}
              <span>{ins.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue & Profit — last 12 months">
          <RevenueLineChart data={monthly} />
        </ChartCard>
        <ChartCard title="Net Profit by Month">
          <ProfitBarChart data={monthly} />
        </ChartCard>
      </div>

      {/* P&L report */}
      <div className="rounded-2xl border bg-card p-5 soft-shadow">
        <div className="no-print mb-4 flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold">Monthly Profit &amp; Loss</h3>
          <select
            value={plMonth}
            onChange={(e) => setPlMonth(e.target.value)}
            className="h-9 rounded-md border bg-background px-2 text-sm"
          >
            {months.map((k) => (
              <option key={k} value={k}>
                {monthLabel(k)}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">compare to</span>
          <select
            value={cmpMonth}
            onChange={(e) => setCmpMonth(e.target.value)}
            className="h-9 rounded-md border bg-background px-2 text-sm"
          >
            <option value="none">—</option>
            {months.map((k) => (
              <option key={k} value={k}>
                {monthLabel(k)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PLBreakdown title={monthLabel(plMonth)} s={plSummary} />
          {cmpSummary && (
            <PLBreakdown title={monthLabel(cmpMonth)} s={cmpSummary} />
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Expense Breakdown">
          <ExpensePie data={expensePie} />
        </ChartCard>
        <ChartCard title="Daily Sales — this month">
          <DailySalesChart data={daily} />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Best-Selling Products (revenue)">
          <HBarChart data={bestSellers} color="#1a2f5e" />
        </ChartCard>
        <ChartCard title="Sales by Category">
          <HBarChart data={categorySales} color="#c0392b" />
        </ChartCard>
      </div>

      {/* Product profitability */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfitList
          title="Most Profitable Products"
          rows={mostProfitable}
          good
        />
        <ProfitList
          title="Least Profitable Products"
          rows={leastProfitable}
        />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <MetricCard icon={Users} label="Customers" value={metrics.customers} />
        <MetricCard icon={RotateCcw} label="Repeat %" value={`${metrics.repeatPct}%`} />
        <MetricCard icon={ShoppingBag} label="Total Orders" value={metrics.totalOrders} />
        <MetricCard icon={Wallet} label="Pending" value={metrics.pending} />
        <MetricCard icon={TrendingUp} label="Completed" value={metrics.completed} />
        <MetricCard
          icon={RotateCcw}
          label="Refunds"
          value={formatTaka(metrics.refunds)}
        />
      </div>

      {/* Orders financial view */}
      <div className="rounded-2xl border bg-card p-5 soft-shadow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Orders — Financial View</h3>
            <p className="text-sm text-muted-foreground">
              Total profit ({window_.label}):{" "}
              <span
                className={`font-semibold ${
                  totalOrderProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatTaka(totalOrderProfit)}
              </span>
            </p>
          </div>
          <div className="no-print flex gap-1 rounded-lg border bg-card p-1 text-sm">
            {[
              { k: "all", l: "All" },
              { k: "profit", l: "Profitable" },
              { k: "loss", l: "Loss" },
            ].map((f) => (
              <button
                key={f.k}
                onClick={() => setProfitFilter(f.k)}
                className={`rounded-md px-3 py-1 font-medium transition-colors ${
                  profitFilter === f.k
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {ordersFin.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders in this period.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Order</th>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 text-right font-medium">Selling</th>
                  <th className="py-2 pr-3 text-right font-medium">Cost</th>
                  <th className="py-2 pr-3 text-right font-medium">Profit</th>
                  <th className="py-2 pr-0 text-right font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {ordersFin.slice(0, 50).map((r) => (
                  <tr key={r.order.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="font-medium">{r.order.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        #{r.order.id.slice(-6)}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">
                      {new Date(r.order.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-2.5 pr-3 text-right">{formatTaka(r.revenue)}</td>
                    <td className="py-2.5 pr-3 text-right text-muted-foreground">
                      {formatTaka(r.cost)}
                    </td>
                    <td
                      className={`py-2.5 pr-3 text-right font-semibold ${
                        r.profit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatTaka(r.profit)}
                    </td>
                    <td className="py-2.5 pr-0 text-right">{r.margin.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Expense manager */}
      <div className="no-print">
        <ExpenseManager expenses={expenses} onChange={setExpenses} />
      </div>
    </div>
  );
}

// ---- small presentational pieces --------------------------------------------

function OverviewCard({
  label,
  value,
  icon: Icon,
  accent,
  valueClass,
  change,
  invert,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  valueClass?: string;
  change?: number | null;
  invert?: boolean;
}) {
  const up = (change ?? 0) >= 0;
  const goodDirection = invert ? !up : up;
  return (
    <div className="rounded-2xl border bg-card p-4 soft-shadow">
      <Icon className={`h-5 w-5 ${accent}`} />
      <p className={`mt-3 text-2xl font-bold tracking-tight ${valueClass ?? ""}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {change != null && (
        <p
          className={`mt-1 flex items-center gap-1 text-xs font-medium ${
            goodDirection ? "text-green-600" : "text-red-600"
          }`}
        >
          {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {Math.abs(Math.round(change))}% vs previous
        </p>
      )}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 soft-shadow">
      <h3 className="mb-4 text-base font-bold">{title}</h3>
      {children}
    </div>
  );
}

function PLBreakdown({
  title,
  s,
}: {
  title: string;
  s: ReturnType<typeof summarize>;
}) {
  const Row = ({
    label,
    amount,
    negative,
  }: {
    label: string;
    amount: number;
    negative?: boolean;
  }) => (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={negative ? "text-red-600" : "text-foreground"}>
        {negative ? "−" : "+"}
        {formatTaka(amount)}
      </span>
    </div>
  );
  return (
    <div>
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {title} — Month-End Summary
      </p>
      <div className="rounded-xl border p-4">
        <Row label="Total Sales Revenue" amount={s.revenue} />
        <Row label="Cost of Products (China)" amount={s.costOfProducts} negative />
        <Row label="Shipping Costs" amount={s.shippingCosts} negative />
        <Row label="Other Expenses" amount={s.otherExpenses} negative />
        <div className="my-2 border-t border-dashed" />
        <div className="flex items-center justify-between">
          <span className="font-bold">
            NET {s.netProfit >= 0 ? "PROFIT" : "LOSS"}
          </span>
          <span
            className={`text-lg font-extrabold ${
              s.netProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatTaka(s.netProfit)}
          </span>
        </div>
        <p className="mt-1 text-right text-xs text-muted-foreground">
          Margin {s.margin.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

function ProfitList({
  title,
  rows,
  good,
}: {
  title: string;
  rows: { name: string; revenue: number; profit: number; margin: number }[];
  good?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 soft-shadow">
      <h3 className="mb-3 text-base font-bold">{title}</h3>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No product sales yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((p, i) => {
            const flagged = !good && p.margin < 15;
            return (
              <li
                key={i}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="line-clamp-1 flex-1">{p.name}</span>
                <span
                  className={`shrink-0 font-semibold ${
                    p.margin >= 25
                      ? "text-green-600"
                      : flagged
                        ? "text-red-600"
                        : "text-foreground"
                  }`}
                >
                  {p.margin.toFixed(0)}%
                  {good && p.margin >= 25 ? " 🔥" : ""}
                  {flagged ? " ⚠️" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 soft-shadow">
      <Icon className="h-5 w-5 text-navy" />
      <p className="mt-2 text-xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
