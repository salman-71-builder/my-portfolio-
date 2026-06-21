"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Wallet,
  AlertTriangle,
  Clock,
  TrendingUp,
  Search,
  CalendarDays,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatTaka } from "@/lib/finance";
import {
  PAY_STATUS_META,
  methodLabel,
  methodColor,
  type PayStatus,
} from "@/lib/payments";

const ExpensePie = dynamic(
  () => import("./finance-charts").then((m) => ({ default: m.ExpensePie })),
  { ssr: false, loading: () => <div className="h-[260px]" /> }
);

export interface PaymentOrderRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  total: number;
  paid: number;
  remaining: number;
  status: PayStatus;
  nextDue: string | null;
  createdAt: string;
}
export interface PaymentFlat {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  date: string;
}

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unpaid", label: "🔴 Unpaid" },
  { key: "partial", label: "🟡 Partially Paid" },
  { key: "paid", label: "🟢 Fully Paid" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PaymentsManager({
  orders,
  payments,
}: {
  orders: PaymentOrderRow[];
  payments: PaymentFlat[];
}) {
  const [filter, setFilter] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<"due" | "remaining">("remaining");

  const now = Date.now();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).getTime();

  // ---- stats ----
  const collectedToday = payments
    .filter((p) => new Date(p.date).getTime() >= todayStart)
    .reduce((s, p) => s + p.amount, 0);
  const collectedMonth = payments
    .filter((p) => new Date(p.date).getTime() >= monthStart)
    .reduce((s, p) => s + p.amount, 0);
  const pendingTotal = orders.reduce((s, o) => s + o.remaining, 0);
  const withBalance = orders.filter((o) => o.remaining > 0);
  const overdue = withBalance.filter(
    (o) => o.nextDue && new Date(o.nextDue).getTime() < now
  );

  // ---- method breakdown ----
  const methodPie = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const p of payments) map.set(p.method, (map.get(p.method) ?? 0) + p.amount);
    return Array.from(map.entries()).map(([method, value]) => ({
      name: methodLabel(method),
      value,
      color: methodColor(method),
    }));
  }, [payments]);

  // ---- filtered list ----
  const list = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    });
    return rows.sort((a, b) => {
      if (sort === "due") {
        const da = a.nextDue ? new Date(a.nextDue).getTime() : Infinity;
        const db = b.nextDue ? new Date(b.nextDue).getTime() : Infinity;
        return da - db;
      }
      return b.remaining - a.remaining;
    });
  }, [orders, filter, query, sort]);

  const STAT_CARDS = [
    { label: "Collected Today", value: formatTaka(collectedToday), icon: Wallet, accent: "text-green-600" },
    { label: "Collected This Month", value: formatTaka(collectedMonth), icon: TrendingUp, accent: "text-navy" },
    { label: "Total Due", value: formatTaka(pendingTotal), icon: Clock, accent: "text-amber-600" },
    { label: "Overdue Orders", value: overdue.length, icon: AlertTriangle, accent: "text-red-600" },
  ];

  return (
    <div className="mt-6 space-y-6">
      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border bg-card p-4 soft-shadow">
              <Icon className={`h-5 w-5 ${s.accent}`} />
              <p className="mt-2 text-xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* method breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 soft-shadow">
          <h3 className="mb-3 text-base font-bold">Collection by Method</h3>
          <ExpensePie data={methodPie} />
        </div>
        <div className="rounded-2xl border bg-card p-5 soft-shadow">
          <h3 className="mb-3 text-base font-bold">Outstanding Summary</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Orders with balance</span>
              <span className="font-semibold">{withBalance.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Overdue</span>
              <span className="font-semibold text-red-600">{overdue.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Total outstanding</span>
              <span className="font-semibold">{formatTaka(pendingTotal)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Collected this month</span>
              <span className="font-semibold text-green-600">{formatTaka(collectedMonth)}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.key
                  ? "border-primary bg-primary text-white"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer, phone or order ID…"
            className="pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "due" | "remaining")}
          className="h-10 rounded-lg border bg-background px-3 text-sm font-medium"
        >
          <option value="remaining">Sort: Highest due</option>
          <option value="due">Sort: Earliest due date</option>
        </select>
      </div>

      {/* list */}
      <div className="overflow-hidden rounded-2xl border bg-card soft-shadow">
        <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_1fr_5rem] gap-3 border-b bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span>Customer</span>
          <span className="text-right">Total</span>
          <span className="text-right">Paid</span>
          <span className="text-right">Remaining</span>
          <span>Status / Due</span>
          <span className="text-right">View</span>
        </div>
        {list.map((o) => {
          const meta = PAY_STATUS_META[o.status];
          const isOverdue = o.remaining > 0 && o.nextDue && new Date(o.nextDue).getTime() < now;
          return (
            <div
              key={o.id}
              className={`grid grid-cols-2 items-center gap-3 border-b px-4 py-3 text-sm last:border-0 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_5rem] ${
                isOverdue ? "bg-red-50/50" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{o.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  #{o.id.slice(-8).toUpperCase()} · {o.phone}
                </p>
              </div>
              <span className="md:text-right">{formatTaka(o.total)}</span>
              <span className="text-green-600 md:text-right">{formatTaka(o.paid)}</span>
              <span className={`font-bold md:text-right ${o.remaining > 0 ? "text-red-600" : "text-green-600"}`}>
                {formatTaka(o.remaining)}
              </span>
              <div className="flex flex-col gap-1">
                <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.badge}`}>
                  {meta.emoji} {meta.label}
                </span>
                {o.nextDue && o.remaining > 0 && (
                  <span className={`flex items-center gap-1 text-[11px] ${isOverdue ? "font-semibold text-red-600" : "text-muted-foreground"}`}>
                    <CalendarDays className="h-3 w-3" /> due {fmtDate(o.nextDue)}
                    {isOverdue ? " · overdue" : ""}
                  </span>
                )}
              </div>
              <div className="text-right">
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
                >
                  Open
                </Link>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No orders match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
