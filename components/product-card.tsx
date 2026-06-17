"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Package } from "lucide-react";
import { motion } from "framer-motion";

import type { Product } from "@/data/products";
import { getSupplierById } from "@/data/suppliers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { cn, formatBDT } from "@/lib/utils";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { addItem } = useCart();
  const supplier = getSupplierById(product.supplierId);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-xl",
        className
      )}
    >
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <Badge variant="destructive">-{product.discount}%</Badge>
          )}
          {product.isNew && <Badge variant="success">NEW</Badge>}
          {product.isHot && <Badge variant="gold">🔥 HOT</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
          <span className="font-medium text-foreground">{product.rating}</span>
          <span>({product.reviews})</span>
          {supplier?.verified && (
            <span className="ml-auto text-[10px] font-semibold text-green-600">
              ✓ Verified
            </span>
          )}
        </div>

        <div className="mt-2">
          <p className="text-base font-bold text-primary">
            {formatBDT(product.priceMin)} – {formatBDT(product.priceMax)}
          </p>
          <p className="text-[11px] text-muted-foreground">per piece</p>
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          <span>MOQ: {product.moq} pcs</span>
        </div>

        <Button
          size="sm"
          className="mt-3 w-full"
          onClick={() => addItem(product)}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}
