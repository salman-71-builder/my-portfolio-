"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { formatBDT } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 50000;

export function CartDrawer() {
  const {
    items,
    isOpen,
    setOpen,
    removeItem,
    updateQuantity,
    totalPrice,
    totalItems,
  } = useCart();

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <ShoppingBag className="h-14 w-14 text-muted-foreground/40" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button onClick={() => setOpen(false)} asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {remaining > 0 ? (
                <p className="mb-4 rounded-md bg-secondary/30 p-2 text-center text-xs font-medium">
                  Add {formatBDT(remaining)} more for{" "}
                  <span className="font-bold text-primary">FREE shipping</span> 🚢
                </p>
              ) : (
                <p className="mb-4 rounded-md bg-green-100 p-2 text-center text-xs font-semibold text-green-700">
                  🎉 You&apos;ve unlocked FREE shipping!
                </p>
              )}

              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
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
                        className="line-clamp-2 text-sm font-medium hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm font-bold text-primary">
                        {formatBDT(item.price)}
                      </p>
                      <div className="mt-auto flex items-center gap-2">
                        <div className="flex items-center rounded-md border">
                          <button
                            aria-label="Decrease quantity"
                            className="px-2 py-1 hover:bg-muted"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            className="px-2 py-1 hover:bg-muted"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          aria-label="Remove item"
                          className="ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t p-4">
              <div className="mb-3 flex items-center justify-between text-lg font-bold">
                <span>Subtotal</span>
                <span className="text-primary">{formatBDT(totalPrice)}</span>
              </div>
              <Button size="lg" className="w-full">
                Proceed to Quote / Checkout
              </Button>
              <Button
                variant="ghost"
                className="mt-1 w-full"
                onClick={() => setOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
