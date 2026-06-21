"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/finance";
import { methodLabel } from "@/lib/payments";

export interface ReceiptData {
  orderId: string;
  name: string;
  phone: string;
  amount: number;
  method: string;
  txnId: string | null;
  date: string;
  total: number;
  remaining: number;
}

export function ReceiptView({ data }: { data: ReceiptData }) {
  const shortId = data.orderId.slice(-8).toUpperCase();
  const when = new Date(data.date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="no-print mb-4 flex justify-end">
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      <div className="finance-print rounded-2xl border bg-card p-8 soft-shadow">
        <div className="text-center">
          <p className="text-2xl font-extrabold tracking-tight">
            China<span className="text-primary">Cart</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Payment Receipt</p>
        </div>

        <div className="my-6 border-y border-dashed py-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Amount Paid
          </p>
          <p className="text-3xl font-extrabold text-green-600">
            {formatTaka(data.amount)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            via {methodLabel(data.method)}
          </p>
        </div>

        <dl className="space-y-2 text-sm">
          <Line label="Order ID" value={`#${shortId}`} mono />
          <Line label="Customer" value={data.name} />
          <Line label="Phone" value={data.phone} />
          {data.txnId && <Line label="Transaction ID" value={data.txnId} mono />}
          <Line label="Date & Time" value={when} />
          <div className="my-2 border-t border-dashed" />
          <Line label="Order Total" value={formatTaka(data.total)} />
          <Line
            label="Remaining Balance"
            value={formatTaka(data.remaining)}
            valueClass={data.remaining > 0 ? "text-red-600" : "text-green-600"}
          />
        </dl>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Thank you for your payment — ChinaCart, Bangladesh&apos;s #1 Chinese
          wholesale platform.
        </p>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  mono,
  valueClass,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-medium ${mono ? "font-mono" : ""} ${valueClass ?? ""}`}>
        {value}
      </dd>
    </div>
  );
}
