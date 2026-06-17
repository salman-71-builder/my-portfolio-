import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsBrowser } from "@/components/products-browser";
import { getCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse thousands of wholesale products from verified suppliers. Filter by category, price, MOQ, rating and shipping time.",
};

export default async function ProductsPage() {
  const categories = await getCategories();
  return (
    <Suspense
      fallback={
        <div className="container py-20 text-center text-muted-foreground">
          Loading products…
        </div>
      }
    >
      <ProductsBrowser categories={categories} />
    </Suspense>
  );
}
