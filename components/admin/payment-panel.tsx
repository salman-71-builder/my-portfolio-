"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Check,
  Loader2,
  Trash2,
  MessageCircle,
  Mail,
  Phone,
  Receipt,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/finance";
import { waLink, telLink, smsLink, mailtoLink } from "@/lib/customers";
import {
  PAYMENT_METHODS,
  PAYMENT_PLANS,
  PAY_STATUS_META,
  methodLabel,
  methodColor,
  planLabel,
  summarize,
  installmentStatuses,
  reminderMessage,
  type PaymentRow,
  type InstallmentRow,
} from "@/lib/payments";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PaymentPanel({
  orderId,
  total,
  customer,
  initialPayments,
  initialInstallments,
  initialPlan,
}: {
  orderId: string;
  total: number;
  customer: { name: string; phone: string; email: string };
  initialPayments: PaymentRow[];
  initialInstallments: InstallmentRow[];
  initialPlan: string | null;
}) {
  const [payments, setPayments] = React.useState<PaymentRow[]>(initialPayments);
  const [installments, setInstallments] =
    React.useState<InstallmentRow[]>(initialInstallments);
  const [plan, setPlan] = React.useState<string>(initialPlan ?? "full");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);

  // add-payment form
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState("bkash");
  const [date, setDate] = React.useState(todayISO());
  const [txnId, setTxnId] = React.useState("");
  const [note, setNote] = React.useState("");

  const sum = summarize(total, payments);
  const meta = PAY_STATUS_META[sum.status];
  const instStatuses = installmentStatuses(installments, sum.paid);

  async function applyPlan() {
    setBusy("plan");
    try {
      const res = await fetch("/api/admin/orders/payment-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      // reflect new installments locally (ids unknown — use index keys)
      setInstallments(
        (data.installments ?? []).map(
          (r: { label: string; amount: number; dueDate: string | null; sortOrder: number }, i: number) => ({
            id: `tmp-${i}`,
            ...r,
          })
        )
      );
    } catch {
      alert("Could not set the payment plan (is the database connected?).");
    } finally {
      setBusy(null);
    }
  }

  async function addPayment() {
    const amt = Math.round(Number(amount));
    if (!Number.isFinite(amt) || amt <= 0) return;
    setBusy("add");
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount: amt, method, date, txnId, note }),
      });
      const data = await res.json();
      if (!res.ok || !data.payment) throw new Error();
      setPayments((p) => [data.payment, ...p]);
      setAmount("");
      setTxnId("");
      setNote("");
      setAdding(false);
    } catch {
      alert("Could not save the payment.");
    } finally {
      setBusy(null);
    }
  }

  async function removePayment(id: string) {
    if (!confirm("Delete this payment record?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/payments?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPayments((p) => p.filter((x) => x.id !== id));
    } catch {
      alert("Could not delete the payment.");
    } finally {
      setBusy(null);
    }
  }

  const reminder = reminderMessage(customer.name, orderId, sum.remaining);

  return (
    <div className="rounded-2xl border bg-card p-5 soft-shadow">
      <h2 className="flex items-center gap-2 text-base font-bold">
        <Receipt className="h-5 w-5 text-primary" /> Payment Summary
      </h2>

      {/* totals + bar */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 text-sm">
          <Row label="Total Amount" value={formatTaka(total)} bold />
          <Row label="Payment Plan" value={planLabel(initialPlan ?? plan)} muted />
          <Row label="Total Paid" value={formatTaka(sum.paid)} className="text-green-600" />
          <Row label="Remaining" value={formatTaka(sum.remaining)} className={sum.remaining > 0 ? "text-red-600" : "text-green-600"} />
        </div>
        <div>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}
          >
            {meta.emoji} {meta.label}
          </span>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${meta.bar}`}
              style={{ width: `${sum.percent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{sum.percent}% paid</p>
        </div>
      </div>

      {/* installments */}
      {instStatuses.length > 0 && (
        <div className="mt-4 rounded-xl border p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Installments
          </p>
          <div className="space-y-1.5">
            {instStatuses.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  {inst.paid ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : inst.overdue ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CalendarClock className="h-4 w-4 text-amber-500" />
                  )}
                  <span>{inst.label}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{formatTaka(inst.amount)}</span>
                  {inst.dueDate && (
                    <span className={`text-xs ${inst.overdue ? "font-semibold text-red-600" : "text-muted-foreground"}`}>
                      {inst.paid ? "✅ paid" : `due ${fmtDate(inst.dueDate)}${inst.overdue ? " · overdue" : ""}`}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* plan selector */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Set plan:</span>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          {PAYMENT_PLANS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
        <Button size="sm" variant="outline" onClick={applyPlan} disabled={busy === "plan"}>
          {busy === "plan" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Apply plan
        </Button>
      </div>

      {/* actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add Payment
          </Button>
        )}
        {sum.remaining > 0 && (
          <>
            <a href={waLink(customer.phone, reminder)} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp reminder
              </Button>
            </a>
            <a href={smsLink(customer.phone, reminder)}>
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4" /> SMS
              </Button>
            </a>
            <a href={mailtoLink(customer.email, `Payment reminder — Order #${orderId.slice(-8).toUpperCase()}`, reminder)}>
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4" /> Email
              </Button>
            </a>
          </>
        )}
      </div>

      {/* add-payment form */}
      {adding && (
        <div className="mt-4 grid gap-2 rounded-xl border bg-secondary/40 p-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Amount received ৳</span>
            <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Method</span>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">
              {PAYMENT_METHODS.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Transaction ID / Ref</span>
            <input value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="e.g. ABC123" className="h-9 w-full rounded-md border bg-background px-2 text-sm" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Note (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Advance payment" className="h-9 w-full rounded-md border bg-background px-2 text-sm" />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button size="sm" onClick={addPayment} disabled={busy === "add"}>
              {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Payment
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* history */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Payment History
        </p>
        {payments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => {
              const pct = total > 0 ? Math.round((p.amount / total) * 100) : 0;
              return (
                <div key={p.id} className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {formatTaka(p.amount)}{" "}
                      <span className="font-normal text-muted-foreground">({pct}%)</span>
                      <span
                        className="ml-2 rounded px-1.5 py-0.5 text-[11px] font-medium text-white"
                        style={{ background: methodColor(p.method) }}
                      >
                        {methodLabel(p.method)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(p.date)}
                      {p.txnId ? ` · Trx: ${p.txnId}` : ""}
                      {p.note ? ` · ${p.note}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/orders/${orderId}/receipt?p=${p.id}`}
                      target="_blank"
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Receipt"
                      title="Receipt"
                    >
                      <Receipt className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => removePayment(p.id)}
                      disabled={busy === p.id}
                      className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete payment"
                    >
                      {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
  className,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-bold" : "font-medium"} ${muted ? "text-muted-foreground" : ""} ${className ?? ""}`}>
        {value}
      </span>
    </div>
  );
}
