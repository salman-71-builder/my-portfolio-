import { Suspense } from "react";
import type { Metadata } from "next";

import { ProductsClient } from "@/components/products-client";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse 10,000+ wholesale products from verified China suppliers. Filter by category, price, MOQ, rating and shipping time.",
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-20 text-center text-muted-foreground">
          Loading products…
        </div>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
