import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsBrowser } from "@/components/products-browser";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse 10,000+ wholesale products from verified Chinese suppliers. Filter by category, price, MOQ, rating and shipping time.",
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
      <ProductsBrowser />
    </Suspense>
  );
}
