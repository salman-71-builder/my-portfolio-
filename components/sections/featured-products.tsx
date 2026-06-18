"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/data/products";

export function FeaturedProducts({ products }: { products: Product[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div className="absolute -top-14 right-0 hidden gap-2 sm:flex">
        <button
          onClick={() => scroll("left")}
          className="glass flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm transition-colors hover:bg-brand hover:text-white"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="glass flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm transition-colors hover:bg-brand hover:text-white"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[180px] shrink-0 snap-start sm:w-[220px]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
