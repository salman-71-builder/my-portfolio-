import type { Product } from "@/data/products";

const KEY = "cc_recently_viewed";
const MAX = 12;

export function getRecentlyViewed(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(product: Product) {
  if (typeof window === "undefined") return;
  try {
    const list = getRecentlyViewed().filter((p) => p.id !== product.id);
    list.unshift(product);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* ignore quota / serialization errors */
  }
}
