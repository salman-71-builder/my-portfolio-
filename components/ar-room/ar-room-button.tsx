"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Sofa } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";

const ArRoomModal = dynamic(() => import("@/components/ar-room/ar-room-modal"), {
  ssr: false,
});

export function ArRoomButton({
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
        <Sofa className="h-4 w-4" /> View In My Room 🛋️
      </button>
      {open && <ArRoomModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
