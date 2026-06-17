"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart-provider";
import { formatBDT } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 50000;
const FLAT_SHIPPING_FEE = 500;
const paymentMethods = ["Cash on Delivery", "bKash", "Nagad", "Bank Transfer"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, loading, refresh } = useCart();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
      ? 0
      : FLAT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

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
        <p className="text-muted-foreground">
          Add some products before heading to checkout.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Complete your wholesale order — we&apos;ll source it from China and
        deliver to your door.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Shipping form */}
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold">Shipping Details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                required
                placeholder="01XXXXXXXXX"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                required
                placeholder="House, road, area"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                required
                defaultValue="Dhaka"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              className="mt-1.5 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {paymentMethods.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="note">Order Note (optional)</Label>
            <textarea
              id="note"
              name="note"
              rows={3}
              placeholder="Any special instructions?"
              className="mt-1.5 flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </form>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border bg-card p-6 shadow-sm lg:sticky lg:top-44">
          <h2 className="text-lg font-bold">Order Summary</h2>

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <p className="line-clamp-2 flex-1 text-xs font-medium">
                  {item.name}
                </p>
                <p className="text-sm font-semibold text-brand">
                  {formatBDT(item.price * item.quantity)}
                </p>
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
              <span className="font-semibold">
                {shippingFee === 0 ? "FREE" : formatBDT(shippingFee)}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-extrabold text-brand">
              {formatBDT(total)}
            </span>
          </div>

          <Button
            type="submit"
            form="checkout-form"
            size="lg"
            className="mt-5 w-full"
            disabled={submitting || loading}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Placing Order…
              </>
            ) : (
              "Place Order"
            )}
          </Button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-600" /> Secure checkout
          </p>
        </aside>
      </div>
    </div>
  );
}
