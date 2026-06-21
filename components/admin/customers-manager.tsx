"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Mail,
  Users,
  UserPlus,
  Repeat,
  UserX,
  Crown,
  Copy,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils";
import {
  vipTier,
  VIP_MEDAL,
  customerInsights,
  growthSeries,
  MESSAGE_TEMPLATES,
  type Customer,
} from "@/lib/customers";

const PAGE_SIZE = 12;
type SortKey = "spent" | "orders" | "name" | "recent" | "joined";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}
function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CustomersManager({ customers }: { customers: Customer[] }) {
  const [tab, setTab] = React.useState<"all" | "vip">("all");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("spent");
  const [page, setPage] = React.useState(1);
  const [vipLimit, setVipLimit] = React.useState(10);
  const [msgOpen, setMsgOpen] = React.useState(false);
  const [template, setTemplate] = React.useState<string>(MESSAGE_TEMPLATES[0].key);
  const [copied, setCopied] = React.useState(false);

  // rank-by-spend index for VIP medals (customers already sorted by spend)
  const rankById = React.useMemo(() => {
    const m = new Map<string, number>();
    [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .forEach((c, i) => m.set(c.id, i));
    return m;
  }, [customers]);

  const insights = React.useMemo(() => customerInsights(customers), [customers]);
  const growth = React.useMemo(() => growthSeries(customers), [customers]);
  const maxGrowth = Math.max(1, ...growth.map((g) => g.value));
  const topSpender = customers[0];

  const base = tab === "vip"
    ? [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, vipLimit)
    : customers;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = base.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "orders":
          return b.totalOrders - a.totalOrders;
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
          return new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime();
        case "joined":
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        default:
          return b.totalSpent - a.totalSpent;
      }
    });
    return sorted;
  }, [base, query, sort]);

  React.useEffect(() => setPage(1), [tab, query, sort, vipLimit]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tpl = MESSAGE_TEMPLATES.find((t) => t.key === template)!;
  const recipientEmails = filtered.map((c) => c.email);

  function openBulkEmail() {
    const body = tpl.body.replace(/\{name\}/g, "there");
    // most clients accept bcc via mailto; keep recipient empty for privacy
    window.location.href = `mailto:?bcc=${encodeURIComponent(
      recipientEmails.join(",")
    )}&subject=${encodeURIComponent(tpl.subject)}&body=${encodeURIComponent(body)}`;
  }
  function copyEmails() {
    navigator.clipboard?.writeText(recipientEmails.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function exportCSV() {
    const lines = [
      "Name,Phone,Email,Orders,Total Spent,Avg Order,Join Date,Last Order,Status",
      ...filtered.map((c) =>
        [
          `"${c.name.replace(/"/g, "'")}"`,
          c.phone,
          c.email,
          c.totalOrders,
          c.totalSpent,
          c.avgOrderValue,
          c.joinDate.slice(0, 10),
          c.lastOrder.slice(0, 10),
          c.active ? "Active" : "Inactive",
        ].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chinacart-customers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const INSIGHT_CARDS = [
    { label: "Total Customers", value: insights.total, icon: Users, accent: "text-navy" },
    { label: "New This Month", value: insights.newThisMonth, icon: UserPlus, accent: "text-green-600" },
    { label: "Returning", value: insights.returning, icon: Repeat, accent: "text-blue-600" },
    { label: "Dormant (60d+)", value: insights.dormant, icon: UserX, accent: "text-amber-600" },
  ];

  return (
    <div className="mt-6 space-y-6">
      {/* insights */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {INSIGHT_CARDS.map((s) => {
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

      {/* growth + top districts + biggest spender */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card p-5 soft-shadow">
          <h3 className="mb-4 text-base font-bold">New customers — last 12 months</h3>
          <div className="flex h-40 items-end gap-1.5">
            {growth.map((g, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-navy/80"
                  style={{ height: `${(g.value / maxGrowth) * 100}%` }}
                  title={`${g.value}`}
                />
                <span className="text-[10px] text-muted-foreground">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {topSpender && topSpender.totalSpent > 0 && (
            <div className="rounded-2xl border bg-card p-5 soft-shadow">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Crown className="h-4 w-4 text-amber-500" /> Biggest spender
              </div>
              <p className="mt-2 text-lg font-bold">{topSpender.name}</p>
              <p className="text-primary font-extrabold">
                {formatBDT(topSpender.totalSpent)}
              </p>
            </div>
          )}
          <div className="rounded-2xl border bg-card p-5 soft-shadow">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              Top districts
            </p>
            <ul className="space-y-1 text-sm">
              {insights.districts.slice(0, 5).map((d) => (
                <li key={d.name} className="flex justify-between">
                  <span>{d.name}</span>
                  <span className="font-semibold">{d.value}</span>
                </li>
              ))}
              {insights.districts.length === 0 && (
                <li className="text-muted-foreground">No data yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* tabs + tools */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg border bg-card p-1">
          <TabBtn active={tab === "all"} onClick={() => setTab("all")}>
            All Customers
          </TabBtn>
          <TabBtn active={tab === "vip"} onClick={() => setTab("vip")}>
            🏆 VIP
          </TabBtn>
        </div>
        {tab === "vip" && (
          <select
            value={vipLimit}
            onChange={(e) => setVipLimit(Number(e.target.value))}
            className="h-9 rounded-md border bg-background px-2 text-sm"
          >
            <option value={10}>Top 10</option>
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
          </select>
        )}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or phone…"
            className="pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-10 rounded-lg border bg-background px-3 text-sm font-medium"
        >
          <option value="spent">Sort: Top spending</option>
          <option value="orders">Sort: Most orders</option>
          <option value="recent">Sort: Recently ordered</option>
          <option value="joined">Sort: Newest</option>
          <option value="name">Sort: Name (A–Z)</option>
        </select>
        <Button variant="outline" size="sm" onClick={() => setMsgOpen((v) => !v)}>
          <Mail className="h-4 w-4" /> Bulk message
        </Button>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      {msgOpen && (
        <div className="rounded-xl border bg-card p-4 soft-shadow">
          <p className="text-sm font-semibold">
            Message {filtered.length} {tab === "vip" ? "VIP " : ""}customer(s)
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="h-9 rounded-md border bg-background px-2 text-sm"
            >
              {MESSAGE_TEMPLATES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={openBulkEmail}>
              <Mail className="h-4 w-4" /> Open email (BCC)
            </Button>
            <Button size="sm" variant="outline" onClick={copyEmails}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy emails"}
            </Button>
          </div>
          <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            “{tpl.body.replace(/\{name\}/g, "there")}”
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Opens your email client with recipients in BCC. Automated SMS/WhatsApp
            blasts require a messaging gateway — per-customer WhatsApp/SMS links
            are available on each profile.
          </p>
        </div>
      )}

      {/* table */}
      <div className="overflow-hidden rounded-2xl border bg-card soft-shadow">
        <div className="hidden grid-cols-[1.6fr_1fr_0.7fr_1fr_1fr_5rem] gap-3 border-b bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span>Customer</span>
          <span>Phone</span>
          <span className="text-center">Orders</span>
          <span className="text-right">Total Spent</span>
          <span>Joined</span>
          <span className="text-right">View</span>
        </div>
        {pageItems.map((c) => {
          const tier = vipTier(rankById.get(c.id) ?? 99, c.totalSpent);
          return (
            <div
              key={c.id}
              className="grid grid-cols-2 items-center gap-3 border-b px-4 py-3 text-sm last:border-0 md:grid-cols-[1.6fr_1fr_0.7fr_1fr_1fr_5rem]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-bold text-navy">
                  {initials(c.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {tier && <span className="mr-1">{VIP_MEDAL[tier]}</span>}
                    {c.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                </div>
              </div>
              <span className="text-muted-foreground">{c.phone}</span>
              <span className="md:text-center">
                {c.totalOrders}
                {c.totalOrders > 1 && (
                  <span className="ml-1 hidden rounded bg-blue-50 px-1 text-[10px] font-semibold text-blue-600 md:inline">
                    repeat
                  </span>
                )}
              </span>
              <span className="font-bold md:text-right">{formatBDT(c.totalSpent)}</span>
              <span className="text-xs text-muted-foreground md:text-sm">
                {shortDate(c.joinDate)}
              </span>
              <div className="text-right">
                <Link
                  href={`/admin/customers/${c.id}`}
                  className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
                >
                  View
                </Link>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <Users className="mx-auto mb-3 h-10 w-10" />
            No customers found.
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function TabBtn({
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
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
