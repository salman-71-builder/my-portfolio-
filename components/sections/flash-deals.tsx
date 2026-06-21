"use client";

import * as React from "react";
import { Zap } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/data/products";

function useCountdown(targetHoursFromNow = 11) {
  const [remaining, setRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    const target = Date.now() + targetHoursFromNow * 60 * 60 * 1000;
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetHoursFromNow]);

  if (remaining === null) return null;
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-lg font-bold text-white tabular-nums sm:h-12 sm:w-12 sm:text-xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function FlashDeals({ products }: { products: Product[] }) {
  const time = useCountdown();

  return (
    <section className="overflow-hidden rounded-2xl border bg-card p-6 soft-shadow sm:p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
            <Zap className="h-6 w-6 fill-current" />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Flash Deals
            </h2>
            <p className="text-sm text-muted-foreground">
              Limited-time wholesale discounts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="mr-1 text-sm font-medium text-muted-foreground">
            Ends in
          </span>
          {time ? (
            <div className="flex items-center gap-1.5">
              <TimeBox value={time.hours} label="Hrs" />
              <span className="text-xl font-bold text-navy">:</span>
              <TimeBox value={time.minutes} label="Min" />
              <span className="text-xl font-bold text-navy">:</span>
              <TimeBox value={time.seconds} label="Sec" />
            </div>
          ) : (
            <div className="h-12 w-40 animate-pulse rounded-lg bg-muted" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {products.slice(0, 6).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
