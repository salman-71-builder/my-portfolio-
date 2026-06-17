import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  products,
  getProductById,
  getRelatedProducts,
} from "@/data/products";
import { ProductDetail } from "@/components/product-detail";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const product = getProductById(params.id);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);
  if (!product) notFound();

  const related = getRelatedProducts(product, 4);
  return <ProductDetail product={product} related={related} />;
}
