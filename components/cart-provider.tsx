"use client";

import * as React from "react";
import type { Product } from "@/data/products";

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number; // unit price used (priceMin)
  priceMax: number;
  moq: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  refresh: () => Promise<void>;
  totalItems: number;
  subtotal: number;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isOpen, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Reconcile local state with the authoritative server cart payload.
  const applyServer = React.useCallback(
    (data: { items?: CartItem[] } | null) => {
      if (data && Array.isArray(data.items)) setItems(data.items);
    },
    []
  );

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (res.ok) applyServer(await res.json());
    } catch {
      /* offline — keep optimistic state */
    } finally {
      setLoading(false);
    }
  }, [applyServer]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  // Generic mutation: apply optimistic state, then sync with the server.
  const mutate = React.useCallback(
    async (
      optimistic: (prev: CartItem[]) => CartItem[],
      request: () => Promise<Response>
    ) => {
      setItems(optimistic);
      try {
        const res = await request();
        if (res.ok) applyServer(await res.json());
        else refresh();
      } catch {
        /* keep optimistic state if the request fails */
      }
    },
    [applyServer, refresh]
  );

  const addItem = React.useCallback(
    (product: Product, quantity?: number) => {
      const qty = quantity ?? product.moq;
      setOpen(true);
      mutate(
        (prev) => {
          const existing = prev.find((i) => i.id === product.id);
          if (existing) {
            return prev.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
            );
          }
          return [
            ...prev,
            {
              id: product.id,
              name: product.name,
              image: product.images[0],
              price: product.priceMin,
              priceMax: product.priceMax,
              moq: product.moq,
              quantity: qty,
            },
          ];
        },
        () =>
          fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id, quantity: qty }),
          })
      );
    },
    [mutate]
  );

  const removeItem = React.useCallback(
    (id: string) => {
      mutate(
        (prev) => prev.filter((i) => i.id !== id),
        () => fetch(`/api/cart?productId=${encodeURIComponent(id)}`, {
          method: "DELETE",
        })
      );
    },
    [mutate]
  );

  const updateQuantity = React.useCallback(
    (id: string, quantity: number) => {
      const qty = Math.max(1, quantity);
      mutate(
        (prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        () =>
          fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id, quantity: qty }),
          })
      );
    },
    [mutate]
  );

  const clear = React.useCallback(() => {
    mutate(
      () => [],
      () => fetch("/api/cart", { method: "DELETE" })
    );
  }, [mutate]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const value: CartContextValue = {
    items,
    isOpen,
    loading,
    setOpen,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    refresh,
    totalItems,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
