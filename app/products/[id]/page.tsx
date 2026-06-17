import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import {
  products,
  getProductById,
  getRelatedProducts,
} from "@/data/products";
import { getSupplierById } from "@/data/suppliers";
import { getCategoryBySlug } from "@/data/categories";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const product = getProductById(params.id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = getProductById(params.id);
  if (!product) notFound();

  const supplier = getSupplierById(product.supplierId);
  const category = getCategoryBySlug(product.category);
  const related = getRelatedProducts(product);

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

      <ProductDetail product={product} supplier={supplier} />

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
