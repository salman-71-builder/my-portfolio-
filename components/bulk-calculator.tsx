"use client";

import * as React from "react";
import { Calculator, MessageCircle, Printer, TrendingUp, Plane, Ship, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils";
import {
  DEFAULT_RATES,
  calcShipping,
  resolveWeight,
  resolveShipClass,
  categoryOf,
  shipClassLabel,
  DELIVERY_TIME,
  type ShipMethod,
  type ShippingRates,
} from "@/lib/shipping";
import type { Product } from "@/data/products";

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

function fmtKg(kg: number): string {
  return `${kg % 1 === 0 ? kg : kg.toFixed(2)} kg`;
}

export function BulkCalculator({
  product,
  rates = DEFAULT_RATES,
}: {
  product: Product;
  rates?: ShippingRates;
}) {
  const maxQty = Math.max(product.moq * 20, 1000);
  const [qty, setQty] = React.useState(Math.max(product.moq, 100));
  const [markup, setMarkup] = React.useState(40);
  const [method, setMethod] = React.useState<ShipMethod>("air");

  const unit = unitPriceFor(product, qty);
  const goods = unit * qty;
  const retail = product.priceMax * qty;
  const savings = Math.max(0, retail - goods);

  const weightPerUnit = resolveWeight(product);
  const totalWeight = Math.round(weightPerUnit * qty * 100) / 100;
  const cls = resolveShipClass(product);
  const category = categoryOf(cls);

  const airQuote = calcShipping(rates, "air", cls, totalWeight);
  const shipQuote = calcShipping(rates, "ship", cls, totalWeight);
  const selected = method === "air" ? airQuote : shipQuote;
  const shipSavings = Math.max(0, airQuote.cost - shipQuote.cost);

  const total = goods + selected.cost;
  const landedPerUnit = Math.round(total / qty);
  const sellPrice = Math.round(landedPerUnit * (1 + markup / 100));
  const profit = (sellPrice - landedPerUnit) * qty;

  const quoteText = `ChinaCart Bulk Quote — ${product.name}
Quantity: ${qty} pcs
Unit price: ${formatBDT(unit)}
Product cost: ${formatBDT(goods)}
Total weight: ${fmtKg(totalWeight)}
Shipping: ${method === "air" ? "By Air ✈️" : "By Ship 🚢"} (${selected.deliveryTime})
Category ${category} · ${formatBDT(selected.ratePerKg)}/kg
Shipping cost: ${formatBDT(selected.cost)}
TOTAL: ${formatBDT(total)}
Suggested resale: ${formatBDT(sellPrice)}/pc · est. profit ${formatBDT(profit)}`;

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(quoteText)}`, "_blank");
  }

  return (
    <div className="rounded-2xl border bg-card p-5 soft-shadow">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
          <Calculator className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-bold">Bulk Order Calculator</h3>
          <p className="text-xs text-muted-foreground">
            Weight-based shipping &amp; landed cost
          </p>
        </div>
      </div>

      {/* Quantity */}
      <label className="text-sm font-medium">
        Quantity:{" "}
        <span className="font-bold text-primary">{qty.toLocaleString()} pcs</span>
      </label>
      <input
        type="range"
        min={product.moq}
        max={maxQty}
        step={Math.max(1, Math.round(product.moq / 2))}
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
      />

      {/* Weight summary */}
      <div className="mt-3 flex items-center justify-between rounded-xl border bg-secondary/50 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Weight className="h-4 w-4" /> Total weight
        </span>
        <span className="font-bold">
          {fmtKg(totalWeight)}{" "}
          <span className="font-normal text-muted-foreground">
            ({fmtKg(weightPerUnit)} × {qty.toLocaleString()})
          </span>
        </span>
      </div>

      {/* Method selection — side by side compare */}
      <p className="mt-4 text-sm font-medium">Choose shipping method</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <MethodCard
          icon={Plane}
          title="By Air"
          cost={airQuote.cost}
          time={DELIVERY_TIME.air}
          active={method === "air"}
          onClick={() => setMethod("air")}
        />
        <MethodCard
          icon={Ship}
          title="By Ship"
          cost={shipQuote.cost}
          time={DELIVERY_TIME.ship}
          active={method === "ship"}
          onClick={() => setMethod("ship")}
        />
      </div>
      {shipSavings > 0 && (
        <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-center text-xs font-semibold text-green-700">
          💰 Save {formatBDT(shipSavings)} by choosing Ship (slower delivery)
        </p>
      )}

      {/* Breakdown */}
      <div className="mt-4 space-y-1.5 rounded-xl bg-muted/50 p-4 text-sm">
        <Row label="Product cost" value={formatBDT(goods)} />
        <Row label="Total weight" value={fmtKg(totalWeight)} />
        <Row label="Shipping method" value={method === "air" ? "By Air ✈️" : "By Ship 🚢"} />
        <Row
          label="Product category"
          value={`${category} — ${shipClassLabel(cls)}`}
        />
        <Row label="Shipping rate" value={`${formatBDT(selected.ratePerKg)} / kg`} />
        <Row
          label="Shipping cost"
          value={`${formatBDT(selected.cost)}`}
          hint={`${fmtKg(totalWeight)} × ${formatBDT(selected.ratePerKg)}`}
        />
        <div className="my-1 border-t" />
        <Row label="TOTAL COST" value={formatBDT(total)} bold />
        <p className="pt-1 text-right text-xs text-muted-foreground">
          Delivery: {selected.deliveryTime}
        </p>
      </div>

      {savings > 0 && (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-center text-sm font-semibold text-green-700">
          💰 You save {formatBDT(savings)} vs retail!
        </p>
      )}

      {/* Markup / profit */}
      <label className="mt-4 block text-sm font-medium">
        Your resale markup:{" "}
        <span className="font-bold text-primary">{markup}%</span>
      </label>
      <input
        type="range"
        min={10}
        max={150}
        step={5}
        value={markup}
        onChange={(e) => setMarkup(Number(e.target.value))}
        className="mt-2 w-full accent-navy"
      />

      <div className="mt-3 rounded-xl border bg-secondary/50 p-4 text-sm">
        <p className="flex items-center gap-1.5 font-bold text-foreground">
          <TrendingUp className="h-4 w-4 text-primary" /> Profit projection
        </p>
        <p className="mt-1 text-muted-foreground">
          Landed {formatBDT(landedPerUnit)}/pc · sell at{" "}
          <span className="font-bold text-foreground">{formatBDT(sellPrice)}</span>/pc →{" "}
          <span className="font-bold text-green-700">{formatBDT(profit)}</span> profit
          on {qty.toLocaleString()} pcs.
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

function MethodCard({
  icon: Icon,
  title,
  cost,
  time,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  cost: number;
  time: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start rounded-xl border-2 p-3 text-left transition-colors ${
        active ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
      }`}
    >
      <span className="flex items-center gap-1.5 text-sm font-semibold">
        <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
        {title}
      </span>
      <span className="mt-1 text-base font-bold">{formatBDT(cost)}</span>
      <span className="text-[11px] text-muted-foreground">{time}</span>
    </button>
  );
}

function Row({
  label,
  value,
  bold,
  hint,
}: {
  label: string;
  value: string;
  bold?: boolean;
  hint?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>
        {label}
        {hint && <span className="ml-1 text-[11px] text-muted-foreground">({hint})</span>}
      </span>
      <span className={bold ? "text-primary" : ""}>{value}</span>
    </div>
  );
}
