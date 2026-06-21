"use client";

import * as React from "react";
import { ProductCard } from "@/components/product-card";
import { useLang } from "@/components/language-provider";
import { getRecentlyViewed, addRecentlyViewed } from "@/lib/recently-viewed";
import type { Product } from "@/data/products";

/** Records the given product into the recently-viewed list (mount on detail pages). */
export function RecentlyViewedTracker({ product }: { product: Product }) {
  React.useEffect(() => {
    addRecentlyViewed(product);
  }, [product]);
  return null;
}

/** Renders the recently-viewed row, optionally excluding the current product. */
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { t } = useLang();
  const [items, setItems] = React.useState<Product[]>([]);

  React.useEffect(() => {
    setItems(getRecentlyViewed().filter((p) => p.id !== excludeId));
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <section className="rounded-md border bg-card p-4">
      <h2 className="mb-3 text-lg font-bold">{t("recently_viewed")}</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {items.map((p) => (
          <div key={p.id} className="w-[160px] shrink-0 sm:w-[200px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
