"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Truck } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { TryOnButton } from "@/components/try-on/try-on-button";
import { ArRoomButton } from "@/components/ar-room/ar-room-button";
import { isFurnitureProduct } from "@/components/ar-room/furniture-types";
import { TryCaseButton } from "@/components/try-case/try-case-button";
import { isPhoneCaseProduct } from "@/components/try-case/phone-case-types";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { useLang } from "@/components/language-provider";
import { formatBDT, formatPriceRange, cn } from "@/lib/utils";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { t } = useLang();
  const wished = has(product.id);
  const isSunglasses =
    product.category === "sunglasses" || product.tags?.includes("sunglasses");
  const isFurniture = isFurnitureProduct(product);
  const isPhoneCase = isPhoneCaseProduct(product);

  // original (pre-discount) price for the strike-through
  const original =
    product.discount > 0
      ? Math.round(product.priceMin / (1 - product.discount / 100))
      : null;

  return (
    <div className="group flex h-full flex-col rounded-md border bg-card p-3 transition-shadow hover:shadow-md">
      <Link href={`/products/${product.id}`} className="relative block">
        <div className="relative aspect-square overflow-hidden rounded bg-white">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {product.discount > 0 && (
            <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-xs font-bold text-white">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="absolute right-10 top-2 rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold text-white">
              NEW
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product);
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform hover:scale-110"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              wished ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </button>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-foreground hover:text-[#1a6fc4]">
            {product.name}
          </h3>
        </Link>

        {/* rating + review count */}
        <div className="mt-1 flex items-center gap-1">
          <StarRating rating={product.rating} reviews={product.reviews} />
        </div>

        {/* price */}
        <div className="mt-1.5 flex items-end gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatBDT(product.priceMin)}
          </span>
          {original && (
            <span className="text-xs text-muted-foreground line-through">
              {formatBDT(original)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {formatPriceRange(product.priceMin, product.priceMax)} / pc · MOQ{" "}
          {product.moq}
        </p>

        {/* delivery trust line */}
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-green-700">
          <Truck className="h-3.5 w-3.5" /> FREE delivery on bulk orders
        </p>

        <div className="mt-auto pt-3">
          <button
            onClick={() => addItem(product)}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-amber-400 py-2 text-sm font-semibold text-navy transition-colors hover:bg-amber-500"
          >
            <ShoppingCart className="h-4 w-4" />
            {t("add_to_cart")}
          </button>

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
    </div>
  );
}
