"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { TiltCard } from "@/components/tilt-card";
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
    <TiltCard className="h-full">
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-2xl">
      <Link href={`/products/${product.id}`} className="relative block">
        <div className="holo relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
            {product.discount > 0 && (
              <Badge variant="hot" className="animate-pulse glow-red">-{product.discount}%</Badge>
            )}
            {product.isNew && <Badge variant="gold" className="glow-gold">NEW</Badge>}
            {product.isHot && !product.isNew && <Badge className="glow-red">HOT</Badge>}
          </div>
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product);
            }}
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow backdrop-blur transition-transform hover:scale-110"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                wished ? "fill-brand text-brand" : "text-neutral-500"
              )}
            />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight transition-colors group-hover:text-brand">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <StarRating rating={product.rating} reviews={product.reviews} />
        </div>

        <div className="mt-2">
          <p className="text-base font-extrabold text-gold">
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
          className="mt-3 w-full"
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
    </TiltCard>
  );
}
