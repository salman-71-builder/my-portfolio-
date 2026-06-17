"use client";

import * as React from "react";
import type { Category } from "@/data/categories";

// Module-level cache so navbar + footer share a single fetch per session.
let cache: Category[] | null = null;
let inFlight: Promise<Category[]> | null = null;

async function load(): Promise<Category[]> {
  if (cache) return cache;
  if (!inFlight) {
    inFlight = fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        const list: Category[] = Array.isArray(d.categories)
          ? d.categories
          : [];
        cache = list;
        return list;
      })
      .catch(() => {
        const list: Category[] = [];
        cache = list;
        return list;
      });
  }
  return inFlight;
}

/** Client hook returning the catalog's categories (fetched once, cached). */
export function useCategories(): Category[] {
  const [categories, setCategories] = React.useState<Category[]>(cache ?? []);

  React.useEffect(() => {
    let active = true;
    if (cache) {
      setCategories(cache);
      return;
    }
    load().then((c) => {
      if (active) setCategories(c);
    });
    return () => {
      active = false;
    };
  }, []);

  return categories;
}
