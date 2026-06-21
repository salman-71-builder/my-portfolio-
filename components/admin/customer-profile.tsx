"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Copy,
  Check,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils";
import { statusLabel, statusEmoji } from "@/lib/order-status";
import {
  waLink,
  telLink,
  smsLink,
  mailtoLink,
  VIP_MEDAL,
  MESSAGE_TEMPLATES,
  fillTemplate,
  type Customer,
  type VipTier,
} from "@/lib/customers";

export interface ProfileOrder {
  id: string;
  total: number;
  status: string;
  paid: boolean;
  createdAt: string;
  itemCount: number;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function CustomerProfile({
  customer,
  tier,
  orders,
}: {
  customer: Customer;
  tier: VipTier;
  orders: ProfileOrder[];
}) {
  const [copied, setCopied] = React.useState(false);
  const [template, setTemplate] = React.useState<string>(MESSAGE_TEMPLATES[0].key);

  const tpl = MESSAGE_TEMPLATES.find((t) => t.key === template)!;
  const msg = fillTemplate(tpl.body, customer.name);

  function copyContact() {
    navigator.clipboard?.writeText(
      `${customer.name}\n${customer.phone}\n${customer.email}\n${customer.address}, ${customer.city}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const stats = [
    { label: "Total Orders", value: customer.totalOrders, icon: ShoppingBag },
    { label: "Total Spent", value: formatBDT(customer.totalSpent), icon: Wallet },
    { label: "Avg Order", value: formatBDT(customer.avgOrderValue), icon: TrendingUp },
    {
      label: "Member Since",
      value: new Date(customer.joinDate).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      }),
      icon: Calendar,
    },
  ];

  return (
    <div>
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      {/* header */}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy/10 text-xl font-bold text-navy">
          {initials(customer.name)}
        </span>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            {tier && <span>{VIP_MEDAL[tier]}</span>}
            {customer.name}
            {tier && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold uppercase text-amber-700">
                VIP {tier}
              </span>
            )}
          </h1>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                customer.active ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            {customer.active ? "Active" : "Inactive"} · last order{" "}
            {new Date(customer.lastOrder).toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border bg-card p-4 soft-shadow">
              <Icon className="h-5 w-5 text-navy" />
              <p className="mt-2 text-xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* contact + message */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 soft-shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Contact</h2>
              <button
                onClick={copyContact}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" /> {customer.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" /> {customer.email}
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {customer.address},{" "}
                {customer.city}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              <a href={telLink(customer.phone)} className="flex flex-col items-center gap-1 rounded-lg border py-2 text-[11px] font-medium hover:bg-muted">
                <Phone className="h-4 w-4 text-navy" /> Call
              </a>
              <a href={smsLink(customer.phone, msg)} className="flex flex-col items-center gap-1 rounded-lg border py-2 text-[11px] font-medium hover:bg-muted">
                <MessageCircle className="h-4 w-4 text-blue-600" /> SMS
              </a>
              <a href={waLink(customer.phone, msg)} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 rounded-lg border py-2 text-[11px] font-medium hover:bg-muted">
                <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp
              </a>
              <a href={mailtoLink(customer.email, tpl.subject, msg)} className="flex flex-col items-center gap-1 rounded-lg border py-2 text-[11px] font-medium hover:bg-muted">
                <Mail className="h-4 w-4 text-primary" /> Email
              </a>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 soft-shadow">
            <h2 className="mb-2 text-base font-bold">Send a message</h2>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-2 text-sm"
            >
              {MESSAGE_TEMPLATES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              “{msg}”
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Pick a template, then use Call / SMS / WhatsApp / Email above — the
              message is pre-filled.
            </p>
          </div>
        </div>

        {/* order history */}
        <div className="rounded-2xl border bg-card p-5 soft-shadow">
          <h2 className="mb-3 text-base font-bold">Order History ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders found.
            </p>
          ) : (
            <div className="divide-y">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:opacity-80"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold text-primary">
                      #{o.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("en-GB")} ·{" "}
                      {o.itemCount} item(s)
                    </p>
                  </div>
                  <span className="text-xs">
                    {statusEmoji(o.status)} {statusLabel(o.status)}
                  </span>
                  <span className="w-24 text-right font-bold">
                    {formatBDT(o.total)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
