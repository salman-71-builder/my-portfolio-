"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils";
import { barcode } from "@/lib/barcode";

export interface LabelOrder {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  total: number;
  itemCount: number;
}

function Barcode({ value }: { value: string }) {
  const bc = barcode(value, 2, 52);
  return (
    <svg
      viewBox={`0 0 ${bc.width} ${bc.height}`}
      width="100%"
      height={bc.height}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
    >
      {bc.bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={bc.height} fill="#000" />
      ))}
    </svg>
  );
}

function Label({ o }: { o: LabelOrder }) {
  const shortId = o.id.slice(-8).toUpperCase();
  const cod =
    o.paymentMethod.toLowerCase().includes("cash") ||
    o.paymentMethod.toLowerCase().includes("delivery");
  return (
    <div className="label break-inside-avoid rounded-lg border-2 border-black bg-white p-4 text-black">
      <div className="flex items-start justify-between border-b border-black pb-2">
        <p className="text-lg font-extrabold tracking-tight">
          China<span className="text-primary">Cart</span>
        </p>
        <div className="text-right text-[10px] leading-tight">
          <p className="font-bold">ORDER</p>
          <p className="font-mono">#{shortId}</p>
        </div>
      </div>

      <div className="mt-2">
        <p className="text-[10px] font-bold uppercase tracking-wide">Ship To</p>
        <p className="text-base font-bold leading-tight">{o.name}</p>
        <p className="text-sm leading-snug">{o.address}, {o.city}</p>
        <p className="text-sm font-semibold">📞 {o.phone}</p>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span>{o.itemCount} item(s)</span>
        <span className="font-bold">
          {cod ? `COD: ${formatBDT(o.total)}` : "PREPAID"}
        </span>
      </div>

      <div className="mt-2 border-t border-black pt-2">
        <Barcode value={shortId} />
        <p className="text-center font-mono text-xs tracking-widest">{shortId}</p>
      </div>
    </div>
  );
}

export function LabelSheet({ orders }: { orders: LabelOrder[] }) {
  if (!orders.length) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        No orders selected for labels.
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="no-print mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">
          {orders.length} Shipping Label{orders.length > 1 ? "s" : ""}
        </h1>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print all
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {orders.map((o) => (
          <Label key={o.id} o={o} />
        ))}
      </div>
    </div>
  );
}
