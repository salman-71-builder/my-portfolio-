"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/utils";

export interface InvoiceData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  paid: boolean;
  createdAt: string;
  items: { name: string; unitPrice: number; quantity: number }[];
}

export function InvoiceView({ data }: { data: InvoiceData }) {
  const shortId = data.id.slice(-8).toUpperCase();
  const date = new Date(data.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="no-print mb-4 flex justify-end">
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      <div className="finance-print rounded-2xl border bg-card p-8 soft-shadow">
        {/* header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-extrabold tracking-tight">
              China<span className="text-primary">Cart</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              House 12, Road 7, Gulshan-1, Dhaka 1212
              <br />
              01700-000000 · info@importchina.com.bd
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold">INVOICE</h1>
            <p className="font-mono text-sm text-muted-foreground">#{shortId}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
            <span
              className={`mt-2 inline-block rotate-[-6deg] rounded border-2 px-3 py-0.5 text-sm font-extrabold uppercase ${
                data.paid
                  ? "border-green-600 text-green-600"
                  : "border-red-600 text-red-600"
              }`}
            >
              {data.paid ? "Paid" : "Unpaid"}
            </span>
          </div>
        </div>

        {/* bill to */}
        <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bill To
            </p>
            <p className="font-semibold">{data.name}</p>
            <p className="text-muted-foreground">{data.address}, {data.city}</p>
            <p className="text-muted-foreground">{data.phone}</p>
            <p className="text-muted-foreground">{data.email}</p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Payment
            </p>
            <p className="text-muted-foreground">{data.paymentMethod}</p>
          </div>
        </div>

        {/* items */}
        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-center font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Unit</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2.5">{it.name}</td>
                <td className="py-2.5 text-center">{it.quantity}</td>
                <td className="py-2.5 text-right">{formatBDT(it.unitPrice)}</td>
                <td className="py-2.5 text-right font-medium">
                  {formatBDT(it.unitPrice * it.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* totals */}
        <div className="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatBDT(data.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{data.shippingFee === 0 ? "FREE" : formatBDT(data.shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatBDT(data.total)}</span>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Thank you for your business with ChinaCart — Bangladesh&apos;s #1
          Chinese wholesale platform.
        </p>
      </div>
    </div>
  );
}
