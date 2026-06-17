"use client";

import * as React from "react";
import { Zap } from "lucide-react";

import { dealProducts } from "@/data/products";
import { ProductCard } from "@/components/product-card";

function useCountdown(targetHours = 8) {
  const [target] = React.useState(
    () => Date.now() + targetHours * 60 * 60 * 1000
  );
  const [remaining, setRemaining] = React.useState(targetHours * 3600 * 1000);

  React.useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

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
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-dark text-xl font-bold tabular-nums text-brand-gold shadow-inner sm:h-12 sm:w-12">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function FlashDeals() {
  const { hours, minutes, seconds } = useCountdown(8);
  const deals = dealProducts.slice(0, 6);

  return (
    <section className="bg-gradient-to-r from-primary/5 to-brand-gold/10 py-12">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <Zap className="h-5 w-5 fill-current" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                ⚡ Flash Deals
              </h2>
              <p className="text-sm text-muted-foreground">
                Hurry — limited time wholesale offers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Ends in:</span>
            <TimeBox value={hours} label="Hrs" />
            <span className="text-xl font-bold text-primary">:</span>
            <TimeBox value={minutes} label="Min" />
            <span className="text-xl font-bold text-primary">:</span>
            <TimeBox value={seconds} label="Sec" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {deals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
