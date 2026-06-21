import Link from "next/link";
import { Plane, Ship, Clock, Wallet, Calculator } from "lucide-react";
import { RouteVisualization } from "@/components/sections/route-visualization";
import { DELIVERY_TIME } from "@/lib/shipping";

export function ShippingShowcase() {
  return (
    <section className="overflow-hidden rounded-md border bg-card">
      <div className="border-b p-5 text-center">
        <h2 className="text-xl font-bold sm:text-2xl">
          China → Bangladesh, handled end-to-end
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose Air for speed or Sea for savings — we manage sourcing,
          consolidation, customs and delivery.
        </p>
      </div>

      {/* 3D animated route */}
      <RouteVisualization />

      {/* method cards */}
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div className="rounded-xl border bg-secondary/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/10 text-navy">
              <Plane className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold">By Air ✈️</h3>
              <p className="text-sm text-muted-foreground">Fast &amp; reliable</p>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-navy" /> Delivery in {DELIVERY_TIME.air}
            </li>
            <li className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-navy" /> Best for small, urgent or
              high-value goods
            </li>
          </ul>
        </div>

        <div className="rounded-xl border bg-secondary/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Ship className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold">By Sea 🚢</h3>
              <p className="text-sm text-muted-foreground">Affordable freight</p>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Delivery in {DELIVERY_TIME.ship}
            </li>
            <li className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" /> Best for bulk &amp;
              heavy orders — lowest cost per kg
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 border-t p-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-muted-foreground">
          See exact shipping cost by weight &amp; category on any product page.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
        >
          <Calculator className="h-4 w-4" /> Try the shipping calculator
        </Link>
      </div>
    </section>
  );
}
