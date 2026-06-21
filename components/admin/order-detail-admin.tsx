"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  CreditCard,
  Printer,
  FileText,
  Copy,
  RotateCcw,
  XCircle,
  Check,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils";
import {
  ORDER_STATUSES,
  STATUS_META,
  statusLabel,
  statusEmoji,
} from "@/lib/order-status";
import {
  waLink,
  telLink,
  mailtoLink,
  encodeCustomerId,
  MESSAGE_TEMPLATES,
  fillTemplate,
} from "@/lib/customers";

export interface DetailOrder {
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
  events: { id: string; status: string | null; note: string | null; createdAt: string }[];
}

export function OrderDetailAdmin({ order }: { order: DetailOrder }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(order.status);
  const [paid, setPaid] = React.useState(order.paid);
  const [events, setEvents] = React.useState(order.events);
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const shortId = order.id.slice(-8).toUpperCase();

  async function changeStatus(next: string) {
    const prev = status;
    setStatus(next);
    setBusy("status");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: next }),
      });
      if (!res.ok) throw new Error();
      setEvents((e) => [
        ...e,
        { id: `tmp-${Date.now()}`, status: next, note: null, createdAt: new Date().toISOString() },
      ]);
    } catch {
      setStatus(prev);
      alert("Could not update status (is the database connected?).");
    } finally {
      setBusy(null);
    }
  }

  async function togglePaid() {
    const next = !paid;
    setPaid(next);
    setBusy("paid");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, paid: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setPaid(!next);
    } finally {
      setBusy(null);
    }
  }

  async function addNote() {
    const text = note.trim();
    if (!text) return;
    setBusy("note");
    try {
      const res = await fetch("/api/admin/order-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, note: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setEvents((e) => [
        ...e,
        { id: data.id, status: null, note: text, createdAt: data.createdAt },
      ]);
      setNote("");
    } catch {
      alert("Could not save the note.");
    } finally {
      setBusy(null);
    }
  }

  async function duplicate() {
    if (!confirm("Create a duplicate of this order?")) return;
    setBusy("dup");
    try {
      const res = await fetch("/api/admin/orders/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error();
      router.push(`/admin/orders/${data.id}`);
    } catch {
      alert("Could not duplicate the order.");
    } finally {
      setBusy(null);
    }
  }

  function copyContact() {
    const text = `${order.name}\n${order.phone}\n${order.email}\n${order.address}, ${order.city}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const waMsg = fillTemplate(MESSAGE_TEMPLATES[2].body, order.name);
  const date = new Date(order.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold">Order #{shortId}</h1>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${
              STATUS_META[status]?.badge ?? "bg-muted"
            }`}
          >
            {statusEmoji(status)} {statusLabel(status)}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {paid ? "PAID" : "UNPAID"}
          </span>
        </div>
      </div>

      {/* action bar */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/orders/${order.id}/invoice`} target="_blank">
            <FileText className="h-4 w-4" /> Invoice
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/orders/labels?ids=${order.id}`} target="_blank">
            <Printer className="h-4 w-4" /> Shipping Label
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={togglePaid} disabled={busy === "paid"}>
          {busy === "paid" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Mark {paid ? "Unpaid" : "Paid"}
        </Button>
        <Button variant="outline" size="sm" onClick={duplicate} disabled={busy === "dup"}>
          {busy === "dup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
          Duplicate
        </Button>
        {status !== "cancelled" && (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            onClick={() => changeStatus("cancelled")}
          >
            <XCircle className="h-4 w-4" /> Cancel
          </Button>
        )}
        {status !== "returned" && (
          <Button
            variant="outline"
            size="sm"
            className="text-rose-600 hover:bg-rose-50"
            onClick={() => changeStatus("returned")}
          >
            <RotateCcw className="h-4 w-4" /> Refund / Return
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* left: products + status control */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 soft-shadow">
            <h2 className="mb-3 text-base font-bold">Products</h2>
            <div className="space-y-3">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image src={it.image} alt={it.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <p className="line-clamp-2 flex-1 text-sm">{it.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {it.quantity} × {formatBDT(it.unitPrice)}
                  </span>
                  <span className="w-24 text-right text-sm font-semibold">
                    {formatBDT(it.unitPrice * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t pt-3 text-sm">
              <Row label="Subtotal" value={formatBDT(order.subtotal)} muted />
              <Row
                label="Shipping"
                value={order.shippingFee === 0 ? "FREE" : formatBDT(order.shippingFee)}
                muted
              />
              <div className="flex justify-between pt-1 text-base font-bold">
                <span>Total</span>
                <span>{formatBDT(order.total)}</span>
              </div>
            </div>
          </div>

          {/* status updater */}
          <div className="rounded-2xl border bg-card p-5 soft-shadow">
            <h2 className="mb-3 text-base font-bold">Update Status</h2>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  disabled={busy === "status"}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    status === s
                      ? STATUS_META[s].badge
                      : "bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {statusEmoji(s)} {statusLabel(s)}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Changing status records a timeline entry. (Customer email/SMS on
              change requires a configured email/SMS provider.)
            </p>
          </div>

          {/* timeline */}
          <div className="rounded-2xl border bg-card p-5 soft-shadow">
            <h2 className="mb-3 text-base font-bold">Timeline &amp; Notes</h2>
            <ol className="space-y-3">
              <li className="flex gap-3 text-sm">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">Order placed</p>
                  <p className="text-xs text-muted-foreground">{date}</p>
                </div>
              </li>
              {events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="mt-0.5 shrink-0">
                    {e.status ? statusEmoji(e.status) : "📝"}
                  </span>
                  <div>
                    <p className="font-medium">
                      {e.status ? `Status → ${statusLabel(e.status)}` : e.note}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Add an internal note…"
                className="h-9 flex-1 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button size="sm" onClick={addNote} disabled={busy === "note" || !note.trim()}>
                {busy === "note" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* right: customer + contact */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 soft-shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Customer</h2>
              <button
                onClick={copyContact}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 font-medium">{order.name}</p>
            <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {order.address}, {order.city}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" /> {order.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" /> {order.email}
              </p>
              <p className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 shrink-0" /> {order.paymentMethod}
              </p>
            </div>
            {order.note && (
              <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                Customer note: {order.note}
              </p>
            )}
          </div>

          {/* contact actions */}
          <div className="rounded-2xl border bg-card p-5 soft-shadow">
            <h2 className="mb-3 text-base font-bold">Contact Customer</h2>
            <div className="grid grid-cols-3 gap-2">
              <a href={telLink(order.phone)} className="flex flex-col items-center gap-1 rounded-lg border py-3 text-xs font-medium hover:bg-muted">
                <Phone className="h-4 w-4 text-navy" /> Call
              </a>
              <a href={waLink(order.phone, waMsg)} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 rounded-lg border py-3 text-xs font-medium hover:bg-muted">
                <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp
              </a>
              <a href={mailtoLink(order.email, `Your ChinaCart order #${shortId}`, waMsg)} className="flex flex-col items-center gap-1 rounded-lg border py-3 text-xs font-medium hover:bg-muted">
                <Mail className="h-4 w-4 text-primary" /> Email
              </a>
            </div>
            <Link
              href={`/admin/customers/${encodeCustomerId(order.email)}`}
              className="mt-3 block text-center text-sm font-medium text-primary hover:underline"
            >
              View customer profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-muted-foreground" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
