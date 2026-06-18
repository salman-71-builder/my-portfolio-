"use client";

import * as React from "react";
import { Calculator, MessageCircle, Printer, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils";
import type { Product } from "@/data/products";

const SHIPPING_PER_UNIT = 60; // BDT per piece (estimate)
const DUTY_RATE = 0.15; // 15% import duty estimate
const FREE_SHIPPING_THRESHOLD = 50000;

/** Volume discount: bigger quantity → lower unit price. */
function unitPriceFor(product: Product, qty: number): number {
  const base = product.priceMin;
  let discount = 0;
  if (qty >= 1000) discount = 0.25;
  else if (qty >= 500) discount = 0.18;
  else if (qty >= 200) discount = 0.12;
  else if (qty >= 100) discount = 0.07;
  else if (qty >= 50) discount = 0.03;
  return Math.round(base * (1 - discount));
}

export function BulkCalculator({ product }: { product: Product }) {
  const maxQty = Math.max(product.moq * 20, 1000);
  const [qty, setQty] = React.useState(Math.max(product.moq, 100));
  const [markup, setMarkup] = React.useState(40); // % markup for resale

  const unit = unitPriceFor(product, qty);
  const goods = unit * qty;
  const retail = product.priceMax * qty; // "retail" comparison
  const savings = Math.max(0, retail - goods);
  const shipping = goods >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PER_UNIT * qty;
  const duty = Math.round(goods * DUTY_RATE);
  const landed = goods + shipping + duty;
  const landedPerUnit = Math.round(landed / qty);
  const sellPrice = Math.round(landedPerUnit * (1 + markup / 100));
  const profit = (sellPrice - landedPerUnit) * qty;

  const quoteText = `ChinaCart Bulk Quote — ${product.name}
Quantity: ${qty} pcs
Unit price: ${formatBDT(unit)}
Goods total: ${formatBDT(goods)}
Shipping: ${shipping === 0 ? "FREE" : formatBDT(shipping)}
Import duty (est): ${formatBDT(duty)}
Landed cost: ${formatBDT(landed)} (${formatBDT(landedPerUnit)}/pc)
Suggested selling price: ${formatBDT(sellPrice)}/pc
Est. profit: ${formatBDT(profit)}`;

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(quoteText)}`, "_blank");
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-brand">
          <Calculator className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-bold">Bulk Order Calculator</h3>
          <p className="text-xs text-muted-foreground">
            Estimate landed cost &amp; profit for wholesale
          </p>
        </div>
      </div>

      {/* Quantity */}
      <label className="text-sm font-medium">
        Quantity: <span className="font-bold text-brand">{qty.toLocaleString()} pcs</span>
      </label>
      <input
        type="range"
        min={product.moq}
        max={maxQty}
        step={Math.max(1, Math.round(product.moq / 2))}
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        className="mt-2 w-full accent-brand"
      />

      {/* Markup */}
      <label className="mt-3 block text-sm font-medium">
        Your resale markup: <span className="font-bold text-brand">{markup}%</span>
      </label>
      <input
        type="range"
        min={10}
        max={150}
        step={5}
        value={markup}
        onChange={(e) => setMarkup(Number(e.target.value))}
        className="mt-2 w-full accent-gold"
      />

      {/* Breakdown */}
      <div className="mt-4 space-y-1.5 rounded-xl bg-muted/50 p-4 text-sm">
        <Row label={`Unit price (${qty >= 50 ? "bulk" : "base"})`} value={formatBDT(unit)} />
        <Row label="Goods total" value={formatBDT(goods)} />
        <Row label="Shipping (est.)" value={shipping === 0 ? "FREE 🚚" : formatBDT(shipping)} />
        <Row label="Import duty (~15%)" value={formatBDT(duty)} />
        <div className="my-1 border-t" />
        <Row label="Landed cost" value={formatBDT(landed)} bold />
        <Row label="Cost per piece" value={formatBDT(landedPerUnit)} />
      </div>

      {savings > 0 && (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-center text-sm font-semibold text-green-700">
          💰 You save {formatBDT(savings)} vs retail!
        </p>
      )}

      <div className="mt-3 rounded-xl border border-gold/40 bg-gold-50 p-4 text-sm">
        <p className="flex items-center gap-1.5 font-bold text-brand">
          <TrendingUp className="h-4 w-4" /> Profit projection
        </p>
        <p className="mt-1 text-muted-foreground">
          Sell at <span className="font-bold text-foreground">{formatBDT(sellPrice)}</span>/pc →
          make <span className="font-bold text-green-700">{formatBDT(profit)}</span> profit on {qty.toLocaleString()} pcs.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={shareWhatsApp} className="flex-1">
          <MessageCircle className="h-4 w-4" /> Share Quote
        </Button>
        <Button variant="outline" onClick={() => window.print()} className="flex-1">
          <Printer className="h-4 w-4" /> Save as PDF
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "text-brand" : ""}>{value}</span>
    </div>
  );
}
