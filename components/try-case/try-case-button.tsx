"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";

const TryCaseModal = dynamic(() => import("@/components/try-case/try-case-modal"), {
  ssr: false,
});

export function TryCaseButton({
  product,
  variant = "card",
  className,
}: {
  product?: Product;
  variant?: "card" | "banner" | "detail";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const styles = {
    card: "inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand/30 px-2 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white",
    detail:
      "inline-flex items-center justify-center gap-2 rounded-lg border-2 border-brand/30 px-5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white",
    banner:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-black shadow transition-transform hover:scale-[1.02]",
  } as const;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(styles[variant], className)}
      >
        <Smartphone className="h-4 w-4" /> Try On Case 📱
      </button>
      {open && <TryCaseModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
