"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart-provider";
import { formatBDT } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 50000;

export function CartDrawer() {
  const {
    items,
    isOpen,
    setOpen,
    removeItem,
    updateQuantity,
    subtotal,
    totalItems,
    clear,
  } = useCart();

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={setOpen}
      side="right"
      title={`Your Cart (${totalItems})`}
    >
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="rounded-full bg-muted p-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold">Your cart is empty</p>
          <p className="text-sm text-muted-foreground">
            Browse our wholesale catalog and add products to get started.
          </p>
          <Button onClick={() => setOpen(false)} asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-4 p-4">
            {remaining > 0 ? (
              <p className="rounded-lg bg-accent px-3 py-2 text-xs text-brand-800">
                Add <strong>{formatBDT(remaining)}</strong> more for FREE
                shipping 🚢
              </p>
            ) : (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                🎉 You qualify for FREE shipping!
              </p>
            )}

            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/products/${item.id}`}
                    onClick={() => setOpen(false)}
                    className="line-clamp-2 text-sm font-medium hover:text-brand"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-sm font-bold text-brand">
                    {formatBDT(item.price)}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-lg border">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1.5 text-muted-foreground hover:text-brand"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1.5 text-muted-foreground hover:text-brand"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clear}
              className="text-xs text-muted-foreground underline hover:text-destructive"
            >
              Clear cart
            </button>
          </div>

          <div className="border-t bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-xl font-extrabold text-brand">
                {formatBDT(subtotal)}
              </span>
            </div>
            <Separator className="mb-3" />
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
            <Button
              variant="ghost"
              className="mt-1 w-full"
              onClick={() => setOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
