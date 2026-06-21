import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { ProductDetail } from "@/components/product-detail";
import { BulkCalculator } from "@/components/bulk-calculator";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import {
  RecentlyViewed,
  RecentlyViewedTracker,
} from "@/components/recently-viewed";
import {
  getProductById,
  getRelatedProducts,
  getCategoryBySlug,
} from "@/lib/catalog";
import { getShippingRates } from "@/lib/shipping-server";
import { getSupplierById } from "@/data/suppliers";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await getProductById(params.id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  const [supplier, category, related, rates] = await Promise.all([
    Promise.resolve(getSupplierById(product.supplierId)),
    getCategoryBySlug(product.category),
    getRelatedProducts(product),
    getShippingRates(),
  ]);

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-brand">
          Products
        </Link>
        {category && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-brand"
            >
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <RecentlyViewedTracker product={product} />

      <ProductDetail product={product} supplier={supplier} />

      <section className="mt-12 lg:max-w-md">
        <BulkCalculator product={product} rates={rates} />
      </section>

      <section className="mt-12">
        <RecentlyViewed excludeId={product.id} />
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading
            title="Related Products"
            subtitle="More from this category"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
