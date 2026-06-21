"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { TryOnButton } from "@/components/try-on/try-on-button";
import { ArRoomButton } from "@/components/ar-room/ar-room-button";
import { isFurnitureProduct } from "@/components/ar-room/furniture-types";
import { TryCaseButton } from "@/components/try-case/try-case-button";
import { isPhoneCaseProduct } from "@/components/try-case/phone-case-types";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { formatPriceRange, cn } from "@/lib/utils";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const isSunglasses =
    product.category === "sunglasses" ||
    product.tags?.includes("sunglasses");
  const isFurniture = isFurnitureProduct(product);
  const isPhoneCase = isPhoneCaseProduct(product);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card soft-shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${product.id}`} className="relative block">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
            {product.discount > 0 && (
              <Badge variant="default">-{product.discount}%</Badge>
            )}
            {product.isNew && (
              <Badge className="bg-navy text-white">NEW</Badge>
            )}
            {product.isHot && !product.isNew && <Badge variant="hot">HOT</Badge>}
          </div>
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product);
            }}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-transform hover:scale-110"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                wished ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-tight text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <StarRating rating={product.rating} reviews={product.reviews} />
        </div>

        <div className="mt-3">
          <p className="text-base font-bold text-foreground">
            {formatPriceRange(product.priceMin, product.priceMax)}
          </p>
          <p className="text-[11px] text-muted-foreground">per piece</p>
        </div>

        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          <span>MOQ: {product.moq} pcs</span>
        </div>

        <Button
          size="sm"
          className="mt-4 w-full"
          onClick={() => addItem(product)}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>

        {isSunglasses && (
          <div className="mt-2">
            <TryOnButton product={product} />
          </div>
        )}
        {isFurniture && (
          <div className="mt-2">
            <ArRoomButton product={product} />
          </div>
        )}
        {isPhoneCase && (
          <div className="mt-2">
            <TryCaseButton product={product} />
          </div>
        )}
      </div>
    </div>
  );
}
