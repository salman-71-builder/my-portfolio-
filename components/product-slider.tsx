"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Product } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

export function ProductSlider({ products }: { products: Product[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="no-scrollbar scroll-snap-x flex gap-4 overflow-x-auto pb-2"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="snap-start w-[200px] shrink-0 sm:w-[230px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        aria-label="Scroll left"
        onClick={() => scroll("left")}
        className="absolute -left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white shadow-md lg:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label="Scroll right"
        onClick={() => scroll("right")}
        className="absolute -right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white shadow-md lg:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
