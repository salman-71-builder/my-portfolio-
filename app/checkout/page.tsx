"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart-provider";
import { formatBDT } from "@/lib/utils";
import { advanceOptions, minAdvanceAmount } from "@/lib/payments";
import {
  DEFAULT_PAYMENT_SETTINGS,
  enabledMethods,
  type PaymentSettings,
} from "@/lib/payment-settings";

const FREE_SHIPPING_THRESHOLD = 50000;
const FLAT_SHIPPING_FEE = 500;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, loading, refresh } = useCart();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);

  // payment selection
  const [choice, setChoice] = React.useState<string>(""); // "30" | "50" | ... | "custom"
  const [customAmount, setCustomAmount] = React.useState("");
  const [method, setMethod] = React.useState<string>("bkash");
  const [txnId, setTxnId] = React.useState("");

  React.useEffect(() => {
    fetch("/api/payment-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setSettings(d.settings);
          const ms = enabledMethods(d.settings);
          if (ms[0]) setMethod(ms[0].key);
        }
      })
      .catch(() => {});
  }, []);

  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const minPct = settings.minAdvancePct;
  const minAdv = minAdvanceAmount(total, minPct);
  const options = advanceOptions(total, minPct);

  // default the advance choice to the minimum option once total is known
  React.useEffect(() => {
    if (!choice && options.length) setChoice(String(options[0].pct));
  }, [choice, options]);

  const advanceAmount =
    choice === "custom"
      ? Math.round(Number(customAmount) || 0)
      : options.find((o) => String(o.pct) === choice)?.advance ?? minAdv;
  const remaining = Math.max(0, total - advanceAmount);
  const methods = enabledMethods(settings);
  const activeMethod = methods.find((m) => m.key === method);
  const methodNumber =
    activeMethod && activeMethod.settingKey
      ? (settings[activeMethod.settingKey] as string | null)
      : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (advanceAmount < minAdv) {
      setError(`Minimum ${minPct}% advance required (${formatBDT(minAdv)}).`);
      return;
    }
    if (advanceAmount > total) {
      setError("Advance cannot exceed the order total.");
      return;
    }
    if (txnId.trim().length < 4) {
      setError("Enter the Transaction ID / reference from your payment.");
      return;
    }

    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(form.entries()),
      paymentMethod: method,
      advanceAmount,
      txnId: txnId.trim(),
    };
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      await refresh();
      router.push(`/orders/${data.id}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (!loading && items.length === 0) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-muted p-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="heading-accent text-2xl font-extrabold sm:text-3xl">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A minimum {minPct}% advance confirms your order — the rest is Cash on
        Delivery.
      </p>

      <form
        id="checkout-form"
        onSubmit={handleSubmit}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-6">
          {/* Delivery details */}
          <div className="space-y-5 rounded-2xl border bg-card p-6 soft-shadow">
            <h2 className="text-lg font-bold">Delivery Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" required placeholder="01XXXXXXXXX" pattern="01[3-9][0-9]{8}" title="Valid BD number: 01XXXXXXXXX" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="mt-1.5" />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
              <div>
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" name="address" required placeholder="House, road, area" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="city">District</Label>
                <Input id="city" name="city" required defaultValue="Dhaka" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="note">Delivery Notes (optional)</Label>
              <textarea id="note" name="note" rows={2} placeholder="Any special instructions?" className="mt-1.5 flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          {/* Advance amount */}
          <div className="space-y-3 rounded-2xl border bg-card p-6 soft-shadow">
            <h2 className="text-lg font-bold">How much do you want to pay now?</h2>
            <div className="space-y-2">
              {options.map((o) => (
                <label
                  key={o.pct}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                    choice === String(o.pct) ? "border-primary bg-accent" : "hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input type="radio" name="adv" checked={choice === String(o.pct)} onChange={() => setChoice(String(o.pct))} className="accent-primary" />
                    <span>
                      <span className="font-semibold">
                        {o.pct === 100 ? "100% full payment" : `${o.pct}% advance`} ({formatBDT(o.advance)})
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {o.cod > 0 ? `Pay on delivery: ${formatBDT(o.cod)}` : "No payment on delivery"}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
              {/* custom */}
              <label className={`flex cursor-pointer flex-col gap-2 rounded-xl border p-3 transition-colors ${choice === "custom" ? "border-primary bg-accent" : "hover:bg-muted"}`}>
                <span className="flex items-center gap-3">
                  <input type="radio" name="adv" checked={choice === "custom"} onChange={() => setChoice("custom")} className="accent-primary" />
                  <span className="font-semibold">Custom amount</span>
                </span>
                {choice === "custom" && (
                  <span className="flex items-center gap-2 pl-7">
                    <span className="text-muted-foreground">৳</span>
                    <input type="number" min={minAdv} max={total} value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder={`min ${minAdv}`} className="h-9 w-32 rounded-md border bg-background px-2 text-sm" />
                    <span className="text-xs text-muted-foreground">Pay on delivery: {formatBDT(remaining)}</span>
                  </span>
                )}
              </label>
            </div>
            <p className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5" /> Minimum {minPct}% advance required ({formatBDT(minAdv)}). Full Cash-on-Delivery is not available.
            </p>
          </div>

          {/* Payment method */}
          <div className="space-y-3 rounded-2xl border bg-card p-6 soft-shadow">
            <h2 className="text-lg font-bold">Select Payment Method</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {methods.map((m) => (
                <button
                  type="button"
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    method === m.key ? "border-primary ring-2 ring-primary/20" : "hover:bg-muted"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white" style={{ background: m.color }}>
                    {m.label[0]}
                  </span>
                  <span className="font-semibold">{m.label}</span>
                </button>
              ))}
            </div>

            {/* instructions */}
            <div className="rounded-xl border bg-secondary/50 p-3 text-sm">
              {method === "bank" ? (
                <div className="space-y-0.5">
                  <p className="font-semibold">Transfer {formatBDT(advanceAmount)} to:</p>
                  <p>Bank: {settings.bankName}</p>
                  <p>Account: {settings.bankAccountName} — {settings.bankAccountNumber}</p>
                  <p>Branch: {settings.bankBranch} · Routing: {settings.bankRouting}</p>
                  <p className="mt-1 text-xs text-muted-foreground">After transfer, enter the reference below. Admin verifies before dispatch.</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="font-semibold">
                    Send {formatBDT(advanceAmount)} to {methodNumber} ({activeMethod?.label})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use &ldquo;Send Money&rdquo;, then enter the Transaction ID below.
                    {" "}(Automated {activeMethod?.label} checkout activates once merchant credentials are configured.)
                  </p>
                </div>
              )}
              <div className="mt-3">
                <Label htmlFor="txn">{method === "bank" ? "Transfer reference / TrxID" : "Transaction ID (TrxID)"}</Label>
                <Input id="txn" value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="e.g. ABC123XYZ" className="mt-1.5" />
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border bg-card p-6 soft-shadow lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <p className="line-clamp-2 flex-1 text-xs font-medium">{item.name}</p>
                <p className="text-sm font-semibold text-primary">{formatBDT(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatBDT(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-semibold">{shippingFee === 0 ? "FREE" : formatBDT(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatBDT(total)}</span>
            </div>
          </div>

          <Separator className="my-4" />
          <div className="space-y-1.5 rounded-xl bg-accent p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pay now (advance)</span>
              <span className="font-bold text-primary">{formatBDT(advanceAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pay on delivery (COD)</span>
              <span className="font-semibold">{formatBDT(remaining)}</span>
            </div>
          </div>

          <Button type="submit" form="checkout-form" size="lg" className="mt-5 w-full" disabled={submitting || loading}>
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order…</>
            ) : (
              `Pay ${formatBDT(advanceAmount)} & Confirm`
            )}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-600" /> Secure checkout 🔒
          </p>
        </aside>
      </form>
    </div>
  );
}
