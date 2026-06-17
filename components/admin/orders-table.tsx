"use client";

import * as React from "react";
import Image from "next/image";
import {
  ChevronDown,
  Search,
  Loader2,
  Package,
  MapPin,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatBDT, cn } from "@/lib/utils";
import { ORDER_STATUSES, STATUS_STYLES } from "@/lib/order-status";

export interface AdminOrder {
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

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-foreground"
      )}
    >
      {status}
    </span>
  );
}

export function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const [statuses, setStatuses] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(orders.map((o) => [o.id, o.status]))
  );
  const [saving, setSaving] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<string>("all");

  React.useEffect(() => {
    setStatuses(Object.fromEntries(orders.map((o) => [o.id, o.status])));
  }, [orders]);

  async function updateStatus(id: string, status: string) {
    const prev = statuses[id];
    setStatuses((s) => ({ ...s, [id]: status })); // optimistic
    setSaving(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setStatuses((s) => ({ ...s, [id]: prev })); // revert on failure
    } finally {
      setSaving(null);
    }
  }

  const filtered = orders.filter((o) => {
    if (filter !== "all" && statuses[o.id] !== filter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q)
    );
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card py-16 text-center text-muted-foreground">
        <Package className="mx-auto mb-3 h-10 w-10" />
        No orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, email or order ID…"
            className="pl-9"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 rounded-lg border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="hidden grid-cols-[1fr_1.3fr_1fr_0.8fr_1.1fr_2.2rem] gap-3 border-b bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span>Order</span>
          <span>Customer</span>
          <span>Date</span>
          <span className="text-right">Total</span>
          <span>Status</span>
          <span />
        </div>

        {filtered.map((o) => {
          const isOpen = expanded === o.id;
          const date = new Date(o.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          return (
            <div key={o.id} className="border-b last:border-0">
              {/* Row */}
              <div className="grid grid-cols-2 gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_1.3fr_1fr_0.8fr_1.1fr_2.2rem] md:items-center">
                <button
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="text-left font-mono text-xs font-semibold text-brand hover:underline"
                >
                  #{o.id.slice(-8).toUpperCase()}
                </button>
                <div className="min-w-0">
                  <p className="truncate font-medium">{o.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {o.phone}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground md:text-sm">
                  {date}
                </span>
                <span className="font-bold text-brand md:text-right">
                  {formatBDT(o.total)}
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={statuses[o.id]}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    disabled={saving === o.id}
                    className="h-8 rounded-md border bg-background px-2 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                  {saving === o.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <button
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="hidden h-8 w-8 items-center justify-center rounded-md hover:bg-muted md:flex"
                  aria-label="Toggle details"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              </div>

              {/* Details */}
              {isOpen && (
                <div className="grid gap-6 border-t bg-muted/20 px-4 py-4 md:grid-cols-[1.4fr_1fr]">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Package className="h-3.5 w-3.5" /> Products Ordered
                    </p>
                    <div className="space-y-2">
                      {o.items.map((it) => (
                        <div key={it.id} className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={it.image}
                              alt={it.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <p className="line-clamp-1 flex-1 text-sm">
                            {it.name}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {it.quantity} × {formatBDT(it.unitPrice)}
                          </span>
                          <span className="w-24 text-right text-sm font-semibold">
                            {formatBDT(it.unitPrice * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-1 border-t pt-3 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatBDT(o.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span>
                          {o.shippingFee === 0
                            ? "FREE"
                            : formatBDT(o.shippingFee)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-brand">{formatBDT(o.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Shipping &amp; Contact
                      </p>
                      <p className="font-medium">{o.name}</p>
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {o.address}, {o.city}
                      </p>
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" /> {o.phone}
                      </p>
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" /> {o.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5" /> {o.paymentMethod}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Current status:
                      </span>
                      <StatusBadge status={statuses[o.id]} />
                    </div>
                    {o.note && (
                      <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                        Note: {o.note}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No orders match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
