"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Glasses } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";

// Heavy (face-api + tfjs) — only loaded when the user opens the try-on.
const TryOnModal = dynamic(() => import("@/components/try-on/try-on-modal"), {
  ssr: false,
});

export function TryOnButton({
  product,
  variant = "card",
  className,
}: {
  product?: Product;
  variant?: "card" | "banner";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          variant === "card"
            ? "inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand/30 px-2 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
            : "inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-black shadow transition-transform hover:scale-[1.02]",
          className
        )}
      >
        <Glasses className="h-4 w-4" /> Try On 👓
      </button>

      {open && <TryOnModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
