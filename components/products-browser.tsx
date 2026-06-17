"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { ProductCard } from "@/components/product-card";
import {
  FilterSidebar,
  type Filters,
  PRICE_BOUNDS,
} from "@/components/filter-sidebar";
import { products, searchProducts } from "@/data/products";
import { getCategoryBySlug } from "@/data/categories";

const PAGE_SIZE = 12;

type SortKey = "newest" | "price-asc" | "popular" | "rating";

const sortLabels: Record<SortKey, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  popular: "Most Popular",
  rating: "Best Rating",
};

const defaultFilters = (category: string): Filters => ({
  category,
  price: [...PRICE_BOUNDS] as [number, number],
  minMoq: 0,
  minRating: 0,
  shipping: "any",
});

export function ProductsBrowser() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? "all";
  const urlSort = (searchParams.get("sort") as SortKey) ?? "popular";

  const [filters, setFilters] = React.useState<Filters>(
    defaultFilters(urlCategory)
  );
  const [sort, setSort] = React.useState<SortKey>(urlSort);
  const [page, setPage] = React.useState(1);
  const [mobileFilters, setMobileFilters] = React.useState(false);

  // sync when URL params change
  React.useEffect(() => {
    setFilters((f) => ({ ...f, category: urlCategory }));
    setPage(1);
  }, [urlCategory]);

  React.useEffect(() => {
    setSort(urlSort);
  }, [urlSort]);

  const base = React.useMemo(() => (q ? searchProducts(q) : products), [q]);

  const filtered = React.useMemo(() => {
    let list = base.filter((p) => {
      if (filters.category !== "all" && p.category !== filters.category)
        return false;
      if (p.priceMin > filters.price[1] || p.priceMax < filters.price[0])
        return false;
      if (filters.minMoq && p.moq > filters.minMoq) return false;
      if (filters.minRating && p.rating < filters.minRating) return false;
      if (filters.shipping !== "any") {
        const max = parseInt(p.shippingDays.split("-")[1] ?? "99", 10);
        if (max > parseInt(filters.shipping, 10)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "newest":
          return Number(b.isNew) - Number(a.isNew);
        case "price-asc":
          return a.priceMin - b.priceMin;
        case "rating":
          return b.rating - a.rating;
        default:
          return b.reviews - a.reviews;
      }
    });
    return list;
  }, [base, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE
  );

  // active filter tags
  const tags: { label: string; clear: () => void }[] = [];
  if (filters.category !== "all") {
    tags.push({
      label: getCategoryBySlug(filters.category)?.name ?? filters.category,
      clear: () => setFilters({ ...filters, category: "all" }),
    });
  }
  if (filters.minMoq) {
    tags.push({
      label: `MOQ ≤ ${filters.minMoq}`,
      clear: () => setFilters({ ...filters, minMoq: 0 }),
    });
  }
  if (filters.minRating) {
    tags.push({
      label: `${filters.minRating}★ & up`,
      clear: () => setFilters({ ...filters, minRating: 0 }),
    });
  }
  if (filters.shipping !== "any") {
    tags.push({
      label: `≤ ${filters.shipping} days`,
      clear: () => setFilters({ ...filters, shipping: "any" }),
    });
  }
  if (
    filters.price[0] !== PRICE_BOUNDS[0] ||
    filters.price[1] !== PRICE_BOUNDS[1]
  ) {
    tags.push({
      label: "Price range",
      clear: () =>
        setFilters({ ...filters, price: [...PRICE_BOUNDS] as [number, number] }),
    });
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {q ? (
            <>
              Search results for{" "}
              <span className="text-brand">&ldquo;{q}&rdquo;</span>
            </>
          ) : filters.category !== "all" ? (
            getCategoryBySlug(filters.category)?.name
          ) : (
            "All Products"
          )}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} product{filtered.length !== 1 && "s"} found
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-44 rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Filters</h2>
              <button
                onClick={() => setFilters(defaultFilters("all"))}
                className="text-xs text-brand hover:underline"
              >
                Reset
              </button>
            </div>
            <FilterSidebar filters={filters} onChange={setFilters} />
          </div>
        </aside>

        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileFilters(true)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                Sort by
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-lg border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {Object.entries(sortLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active tags */}
          {tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {tags.map((t, i) => (
                <button key={i} onClick={t.clear}>
                  <Badge variant="secondary" className="gap-1 pr-1">
                    {t.label}
                    <X className="h-3 w-3" />
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {pageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
              <PackageSearch className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
                    n === current
                      ? "bg-brand text-white"
                      : "border hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={current === totalPages}
                onClick={() => setPage(current + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters */}
      <Sheet
        open={mobileFilters}
        onOpenChange={setMobileFilters}
        side="left"
        title="Filters"
      >
        <div className="p-4">
          <FilterSidebar filters={filters} onChange={setFilters} />
          <Button
            className="mt-6 w-full"
            onClick={() => setMobileFilters(false)}
          >
            Show {filtered.length} results
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
