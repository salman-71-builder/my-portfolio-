"use client";

import * as React from "react";
import type { Product } from "@/data/products";

export const COLLECTIONS = [
  "General",
  "My Eid Collection",
  "My Shop Stock",
  "Gifts",
] as const;

export interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  priceMax: number;
  moq: number;
  category: string;
  collection: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  has: (id: string) => boolean;
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  setCollection: (id: string, collection: string) => void;
  clear: () => void;
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "chinacart-wishlist-v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const has = React.useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = React.useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === product.id)) {
        return prev.filter((i) => i.id !== product.id);
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
          category: product.category,
          collection: "General",
        },
      ];
    });
  }, []);

  const remove = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setCollection = React.useCallback((id: string, collection: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, collection } : i)));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const value: WishlistContextValue = {
    items,
    count: items.length,
    has,
    toggle,
    remove,
    setCollection,
    clear,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within <WishlistProvider>");
  return ctx;
}
