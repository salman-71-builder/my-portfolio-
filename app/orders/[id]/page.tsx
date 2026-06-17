import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Package, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false },
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="container max-w-3xl py-12">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold">Order Confirmed!</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you, {order.name.split(" ")[0]}. Your wholesale order has been
          placed successfully.
        </p>
        <p className="mt-1 text-sm">
          Order ID:{" "}
          <span className="font-mono font-semibold text-brand">
            #{order.id.slice(-8).toUpperCase()}
          </span>
        </p>
      </div>

      {/* Status timeline */}
      <div className="mt-8 grid grid-cols-3 gap-2 rounded-2xl border bg-card p-5 text-center shadow-sm">
        {[
          { icon: CheckCircle2, label: "Order Placed", active: true },
          { icon: Package, label: "Sourcing", active: false },
          { icon: Truck, label: "Delivery", active: false },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  s.active
                    ? "bg-brand text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium">{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Items */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:col-span-2">
          <h2 className="font-bold">Order Items</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/products/${item.productId}`}
                    className="line-clamp-1 text-sm font-medium hover:text-brand"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatBDT(item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-brand">
                  {formatBDT(item.unitPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBDT(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {order.shippingFee === 0
                  ? "FREE"
                  : formatBDT(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold">
              <span>Total</span>
              <span className="text-brand">{formatBDT(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping info */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold">
            <MapPin className="h-4 w-4 text-brand" /> Shipping To
          </h2>
          <div className="mt-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{order.name}</p>
            <p>{order.address}</p>
            <p>{order.city}</p>
            <p className="mt-1">{order.phone}</p>
            <p>{order.email}</p>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="font-bold">Payment</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Method:{" "}
            <span className="font-medium text-foreground">
              {order.paymentMethod}
            </span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Status:{" "}
            <span className="font-medium capitalize text-amber-600">
              {order.status}
            </span>
          </p>
          {order.note && (
            <p className="mt-2 text-sm text-muted-foreground">
              Note: <span className="text-foreground">{order.note}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
