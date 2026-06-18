"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Share2,
  Check,
  FolderHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import {
  useWishlist,
  COLLECTIONS,
  type WishlistItem,
} from "@/components/wishlist-provider";
import { formatBDT } from "@/lib/utils";
import type { Product } from "@/data/products";

export function WishlistView() {
  const params = useSearchParams();
  const sharedIds = params.get("ids");

  if (sharedIds) return <SharedWishlist ids={sharedIds.split(",").filter(Boolean)} />;
  return <OwnWishlist />;
}

/* ------------------------------- own ------------------------------- */
function OwnWishlist() {
  const { items, count, remove, setCollection, clear } = useWishlist();
  const { addItem } = useCart();
  const [copied, setCopied] = React.useState(false);

  const total = items.reduce((s, i) => s + i.price, 0);

  function addAllToCart() {
    items.forEach((i) =>
      addItem({
        id: i.id,
        name: i.name,
        images: [i.image],
        priceMin: i.price,
        priceMax: i.priceMax,
        moq: i.moq,
        category: i.category,
      } as Product)
    );
  }

  function share() {
    const url = `${window.location.origin}/wishlist?ids=${items.map((i) => i.id).join(",")}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (count === 0) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-muted p-6">
          <Heart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Your wishlist is empty</h1>
        <p className="text-muted-foreground">
          Tap the ♥ on any product to save it here.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const grouped = COLLECTIONS.map((c) => ({
    name: c,
    items: items.filter((i) => i.collection === c),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
            <FolderHeart className="h-7 w-7 text-brand" /> My Wishlist
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count} item{count !== 1 && "s"} · total {formatBDT(total)} (per piece)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={share}>
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Link copied!" : "Share"}
          </Button>
          <Button onClick={addAllToCart}>
            <ShoppingCart className="h-4 w-4" /> Add all to cart
          </Button>
          <Button variant="ghost" onClick={clear}>
            Clear
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {grouped.map((group) => (
          <div key={group.name}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {group.name} · {group.items.length}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <WishRow
                  key={item.id}
                  item={item}
                  onRemove={() => remove(item.id)}
                  onMove={(c) => setCollection(item.id, c)}
                  onAdd={() =>
                    addItem({
                      id: item.id,
                      name: item.name,
                      images: [item.image],
                      priceMin: item.price,
                      priceMax: item.priceMax,
                      moq: item.moq,
                      category: item.category,
                    } as Product)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WishRow({
  item,
  onRemove,
  onMove,
  onAdd,
}: {
  item: WishlistItem;
  onRemove: () => void;
  onMove: (c: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/products/${item.id}`}
          className="line-clamp-2 text-sm font-semibold hover:text-brand"
        >
          {item.name}
        </Link>
        <span className="mt-0.5 text-sm font-bold text-brand">{formatBDT(item.price)}</span>
        <select
          value={item.collection}
          onChange={(e) => onMove(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-1.5 py-1 text-xs focus:outline-none"
        >
          {COLLECTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="mt-2 flex gap-1.5">
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded bg-brand px-2 py-1 text-[11px] font-semibold text-white hover:bg-brand-800"
          >
            <ShoppingCart className="h-3 w-3" /> Add
          </button>
          <button
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ shared ----------------------------- */
function SharedWishlist({ ids }: { ids: string[] }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        const all: Product[] = Array.isArray(d.products) ? d.products : [];
        const idSet = new Set(ids);
        setProducts(all.filter((p) => idSet.has(p.id)));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ids]);

  const total = products.reduce((s, p) => s + p.priceMin, 0);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">A shared wishlist 💝</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {loading ? "Loading…" : `${products.length} items · total ${formatBDT(total)}`}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="flex gap-3 rounded-xl border bg-card p-3 shadow-sm">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image src={p.images[0]} alt={p.name} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link href={`/products/${p.id}`} className="line-clamp-2 text-sm font-semibold hover:text-brand">
                {p.name}
              </Link>
              <span className="mt-0.5 text-sm font-bold text-brand">{formatBDT(p.priceMin)}</span>
              <div className="mt-2 flex gap-1.5">
                <button
                  onClick={() => addItem(p)}
                  className="inline-flex items-center gap-1 rounded bg-brand px-2 py-1 text-[11px] font-semibold text-white hover:bg-brand-800"
                >
                  <ShoppingCart className="h-3 w-3" /> Add to cart
                </button>
                <button
                  onClick={() => toggle(p)}
                  className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-brand"
                >
                  <Heart className={`h-3 w-3 ${has(p.id) ? "fill-brand text-brand" : ""}`} /> Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
