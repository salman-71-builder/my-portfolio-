"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  RefreshCw,
  Download,
  Printer,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Wallet,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils";
import {
  ORDER_STATUSES,
  STATUS_META,
  statusLabel,
  statusEmoji,
} from "@/lib/order-status";

export interface ManagedOrder {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note: string | null;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  paid: boolean;
  createdAt: string;
  items: {
    id: string;
    name: string;
    image: string;
    productId: string;
    unitPrice: number;
    quantity: number;
  }[];
}

const PAGE_SIZE = 12;

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${
        meta?.badge ?? "bg-muted text-foreground"
      }`}
    >
      <span>{statusEmoji(status)}</span>
      {statusLabel(status)}
    </span>
  );
}

export function OrdersManager({
  orders,
  dbError,
}: {
  orders: ManagedOrder[];
  dbError: boolean;
}) {
  const router = useRouter();
  const [statuses, setStatuses] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(orders.map((o) => [o.id, o.status]))
  );
  const [saving, setSaving] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [showFilters, setShowFilters] = React.useState(false);
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [minAmt, setMinAmt] = React.useState("");
  const [maxAmt, setMaxAmt] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    setStatuses(Object.fromEntries(orders.map((o) => [o.id, o.status])));
  }, [orders]);

  async function updateStatus(id: string, status: string) {
    const prev = statuses[id];
    setStatuses((s) => ({ ...s, [id]: status }));
    setSaving(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setStatuses((s) => ({ ...s, [id]: prev }));
    } finally {
      setSaving(null);
    }
  }

  function refresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  // counts per status (for filter chips)
  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of ORDER_STATUSES) c[s] = 0;
    for (const o of orders) c[statuses[o.id]] = (c[statuses[o.id]] ?? 0) + 1;
    return c;
  }, [orders, statuses]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minAmt ? Number(minAmt) : null;
    const max = maxAmt ? Number(maxAmt) : null;
    const from = fromDate ? new Date(fromDate).getTime() : null;
    const to = toDate ? new Date(toDate).getTime() + 86400000 : null;
    return orders.filter((o) => {
      if (filter !== "all" && statuses[o.id] !== filter) return false;
      if (min != null && o.total < min) return false;
      if (max != null && o.total > max) return false;
      const t = new Date(o.createdAt).getTime();
      if (from != null && t < from) return false;
      if (to != null && t >= to) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    });
  }, [orders, statuses, filter, query, minAmt, maxAmt, fromDate, toDate]);

  React.useEffect(() => setPage(1), [filter, query, minAmt, maxAmt, fromDate, toDate]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filteredRevenue = filtered
    .filter((o) => statuses[o.id] !== "cancelled" && statuses[o.id] !== "returned")
    .reduce((s, o) => s + o.total, 0);

  // stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const stat = {
    today: orders.filter((o) => new Date(o.createdAt).getTime() >= todayStart).length,
    pending: counts.pending ?? 0,
    toShip:
      (counts.confirmed ?? 0) + (counts.processing ?? 0) + (counts.packed ?? 0),
    delivered: counts.delivered ?? 0,
    cancelled: (counts.cancelled ?? 0) + (counts.returned ?? 0),
    revenue: orders
      .filter((o) => statuses[o.id] !== "cancelled" && statuses[o.id] !== "returned")
      .reduce((s, o) => s + o.total, 0),
  };

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      const allOn = pageItems.every((o) => next.has(o.id));
      for (const o of pageItems) {
        if (allOn) next.delete(o.id);
        else next.add(o.id);
      }
      return next;
    });
  }

  function printLabels() {
    const ids = Array.from(selected);
    if (!ids.length) return;
    window.open(`/admin/orders/labels?ids=${ids.join(",")}`, "_blank");
  }

  function exportCSV() {
    const lines = [
      "Order ID,Customer,Phone,Date,Items,Total,Status,Paid",
      ...filtered.map((o) =>
        [
          o.id,
          `"${o.name.replace(/"/g, "'")}"`,
          o.phone,
          new Date(o.createdAt).toISOString().slice(0, 10),
          o.items.reduce((n, i) => n + i.quantity, 0),
          o.total,
          statuses[o.id],
          o.paid ? "Paid" : "Unpaid",
        ].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chinacart-orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const STAT_CARDS = [
    { label: "Today", value: stat.today, icon: Package, accent: "text-navy" },
    { label: "Pending", value: stat.pending, icon: Clock, accent: "text-amber-600" },
    { label: "To Ship", value: stat.toShip, icon: Truck, accent: "text-blue-600" },
    { label: "Delivered", value: stat.delivered, icon: CheckCircle2, accent: "text-green-600" },
    { label: "Cancelled", value: stat.cancelled, icon: XCircle, accent: "text-red-600" },
    { label: "Revenue", value: formatBDT(stat.revenue), icon: Wallet, accent: "text-navy" },
  ];

  return (
    <div className="mt-6 space-y-6">
      {dbError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Database not reachable — connect <code>DATABASE_URL</code> and run{" "}
          <code>npm run db:push</code> / <code>npm run seed</code>.
        </div>
      )}

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
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

      {/* toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order ID, customer, phone or product…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button
            size="sm"
            onClick={printLabels}
            disabled={selected.size === 0}
          >
            <Printer className="h-4 w-4" /> Labels ({selected.size})
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">From date</span>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">To date</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Min amount ৳</span>
            <input type="number" value={minAmt} onChange={(e) => setMinAmt(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Max amount ৳</span>
            <input type="number" value={maxAmt} onChange={(e) => setMaxAmt(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm" />
          </label>
        </div>
      )}

      {/* status chips */}
      <div className="flex flex-wrap gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          All ({counts.all})
        </Chip>
        {ORDER_STATUSES.map((s) => (
          <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>
            {statusEmoji(s)} {statusLabel(s)} ({counts[s] ?? 0})
          </Chip>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
        orders · revenue{" "}
        <span className="font-semibold text-foreground">{formatBDT(filteredRevenue)}</span>
      </p>

      {/* table */}
      <div className="overflow-hidden rounded-2xl border bg-card soft-shadow">
        <div className="hidden grid-cols-[2.2rem_1fr_1.4fr_1fr_0.9fr_1.2fr_5rem] gap-3 border-b bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <input
            type="checkbox"
            aria-label="Select page"
            checked={pageItems.length > 0 && pageItems.every((o) => selected.has(o.id))}
            onChange={toggleSelectPage}
          />
          <span>Order</span>
          <span>Customer</span>
          <span>Date</span>
          <span className="text-right">Total</span>
          <span>Status</span>
          <span className="text-right">View</span>
        </div>

        {pageItems.map((o) => {
          const date = new Date(o.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          return (
            <div
              key={o.id}
              className="grid grid-cols-2 items-center gap-3 border-b px-4 py-3 text-sm last:border-0 md:grid-cols-[2.2rem_1fr_1.4fr_1fr_0.9fr_1.2fr_5rem]"
            >
              <input
                type="checkbox"
                aria-label={`Select ${o.id}`}
                checked={selected.has(o.id)}
                onChange={() => toggleSelect(o.id)}
              />
              <Link
                href={`/admin/orders/${o.id}`}
                className="font-mono text-xs font-semibold text-primary hover:underline"
              >
                #{o.id.slice(-8).toUpperCase()}
              </Link>
              <div className="min-w-0">
                <p className="truncate font-medium">{o.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {o.items.reduce((n, i) => n + i.quantity, 0)} items · {o.phone}
                </p>
              </div>
              <span className="text-xs text-muted-foreground md:text-sm">{date}</span>
              <span className="font-bold md:text-right">
                {formatBDT(o.total)}
                {!o.paid && (
                  <span className="ml-1 hidden text-[10px] font-semibold text-red-600 md:inline">
                    UNPAID
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={statuses[o.id]}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  disabled={saving === o.id}
                  className="h-8 rounded-md border bg-background px-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
                {saving === o.id && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="md:hidden">
                  <StatusBadge status={statuses[o.id]} />
                </span>
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

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <Package className="mx-auto mb-3 h-10 w-10" />
            No orders match your filters.
          </div>
        )}
      </div>

      {/* pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-white"
          : "bg-card text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
