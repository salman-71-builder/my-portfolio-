"use client";

import * as React from "react";
import Link from "next/link";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  FileText,
  Package,
  Truck,
  ShieldCheck,
  MapPin,
  ChevronRight,
} from "lucide-react";

import type { Product } from "@/data/products";
import { getSupplierById } from "@/data/suppliers";
import { getCategoryBySlug } from "@/data/categories";
import { ImageGallery } from "@/components/image-gallery";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useCart } from "@/context/cart-context";
import { formatBDT } from "@/lib/utils";

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { addItem } = useCart();
  const [qty, setQty] = React.useState(product.moq);
  const supplier = getSupplierById(product.supplierId);
  const category = getCategoryBySlug(product.category);

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        {category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-primary"
            >
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ImageGallery images={product.images} alt={product.name} />

        <div>
          <div className="flex flex-wrap gap-2">
            {product.isHot && <Badge variant="gold">🔥 Hot Product</Badge>}
            {product.isNew && <Badge variant="success">New Arrival</Badge>}
            {product.discount > 0 && (
              <Badge variant="destructive">-{product.discount}% OFF</Badge>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-2 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < Math.round(product.rating)
                      ? "h-4 w-4 fill-brand-gold text-brand-gold"
                      : "h-4 w-4 text-muted-foreground/30"
                  }
                />
              ))}
            </div>
            <span className="font-semibold">{product.rating}</span>
            <span className="text-muted-foreground">
              ({product.reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mt-5 rounded-xl bg-muted/40 p-4">
            <p className="text-3xl font-extrabold text-primary">
              {formatBDT(product.priceMin)} – {formatBDT(product.priceMax)}
            </p>
            <p className="text-sm text-muted-foreground">per piece</p>
            <Badge variant="secondary" className="mt-3">
              <Package className="mr-1 h-3.5 w-3.5" />
              Minimum Order: {product.moq} pcs
            </Badge>
          </div>

          {/* Quantity + actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button
                aria-label="Decrease"
                className="px-3 py-2.5 hover:bg-muted"
                onClick={() => setQty((q) => Math.max(product.moq, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={qty}
                min={product.moq}
                onChange={(e) =>
                  setQty(Math.max(product.moq, Number(e.target.value) || product.moq))
                }
                className="w-16 border-x bg-transparent py-2 text-center text-sm outline-none"
              />
              <button
                aria-label="Increase"
                className="px-3 py-2.5 hover:bg-muted"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground">
              Subtotal:{" "}
              <span className="font-bold text-foreground">
                {formatBDT(qty * product.priceMin)}
              </span>
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => addItem(product, qty)}
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="gold" className="flex-1">
              <FileText className="h-5 w-5" />
              Request Quote
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
            <TrustBadge icon={ShieldCheck} label="Verified Supplier" />
            <TrustBadge
              icon={Truck}
              label={`${product.shippingDays}-day shipping`}
            />
            <TrustBadge icon={Package} label="Quality Checked" />
          </div>

          {/* Supplier card */}
          {supplier && (
            <div className="mt-6 flex items-center gap-4 rounded-xl border p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={supplier.logo}
                alt={supplier.name}
                className="h-12 w-24 rounded border object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 font-semibold">
                  {supplier.name}
                  {supplier.verified && (
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  )}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {supplier.location} ·{" "}
                  {supplier.yearsActive} yrs · {supplier.responseRate}% response
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Star className="h-4 w-4 fill-brand-gold text-brand-gold" />
                {supplier.rating}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
            {["description", "specifications", "shipping", "reviews"].map(
              (t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="rounded-full border capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {t === "shipping" ? "Shipping Info" : t}
                </TabsTrigger>
              )
            )}
          </TabsList>

          <TabsContent
            value="description"
            className="prose prose-sm max-w-none pt-6 text-foreground/90"
          >
            <p>{product.description}</p>
          </TabsContent>

          <TabsContent value="specifications" className="pt-6">
            <table className="w-full max-w-2xl border-collapse text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? "bg-muted/40" : ""}>
                    <td className="w-1/3 px-4 py-2.5 font-semibold">{k}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>

          <TabsContent value="shipping" className="pt-6 text-sm">
            <ul className="space-y-3">
              <li className="flex gap-2">
                <Truck className="h-5 w-5 shrink-0 text-primary" />
                Estimated delivery to Bangladesh:{" "}
                <strong>{product.shippingDays} days</strong> via air/sea freight.
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                We handle customs clearance and all import documentation.
              </li>
              <li className="flex gap-2">
                <Package className="h-5 w-5 shrink-0 text-primary" />
                Free shipping on orders over {formatBDT(50000)}.
              </li>
            </ul>
          </TabsContent>

          <TabsContent value="reviews" className="pt-6">
            <div className="flex items-center gap-4 rounded-xl border p-5">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-primary">
                  {product.rating}
                </p>
                <div className="mt-1 flex justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < Math.round(product.rating)
                          ? "h-4 w-4 fill-brand-gold text-brand-gold"
                          : "h-4 w-4 text-muted-foreground/30"
                      }
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product.reviews} reviews
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Buyers rate this product highly for quality and value. Sign in to
                read detailed verified-buyer reviews or leave your own.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-14">
          <SectionHeading title="Related Products" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TrustBadge({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border p-2">
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
