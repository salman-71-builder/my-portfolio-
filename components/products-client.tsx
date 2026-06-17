"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, ImageIcon, ArrowUpDown } from "lucide-react";

import { products as allProducts } from "@/data/products";
import { categories, getCategoryBySlug } from "@/data/categories";
import { ProductCard } from "@/components/product-card";
import {
  FilterSidebar,
  DEFAULT_FILTERS,
  type Filters,
} from "@/components/filter-sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SortKey = "newest" | "price-asc" | "popular" | "rating";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "rating", label: "Best Rating" },
];

const PAGE_SIZE = 12;

export function ProductsClient() {
  const params = useSearchParams();
  const router = useRouter();

  const search = params.get("search") ?? "";
  const categoryParam = params.get("category") ?? "all";
  const visual = params.get("visual") === "1";
  const sortParam = (params.get("sort") as SortKey) ?? "popular";

  const [filters, setFilters] = React.useState<Filters>({
    ...DEFAULT_FILTERS,
    category: categoryParam,
  });
  const [sort, setSort] = React.useState<SortKey>(sortParam);
  const [page, setPage] = React.useState(1);

  // Sync category filter when the URL changes (e.g. navbar category click).
  React.useEffect(() => {
    setFilters((f) => ({ ...f, category: categoryParam }));
    setPage(1);
  }, [categoryParam]);

  React.useEffect(() => setSort(sortParam), [sortParam]);
  React.useEffect(() => setPage(1), [search, sort]);

  const filtered = React.useMemo(() => {
    let list = allProducts.filter((p) => {
      if (filters.category !== "all" && p.category !== filters.category)
        return false;
      if (p.priceMin > filters.price[1] || p.priceMax < filters.price[0])
        return false;
      if (filters.moq !== 0 && p.moq > filters.moq) return false;
      if (filters.rating !== 0 && p.rating < filters.rating) return false;
      if (filters.shippingDays !== 0 && p.shippingDays > filters.shippingDays)
        return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${p.name} ${p.category} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.priceMin - b.priceMin;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return Number(b.isNew) - Number(a.isNew);
        default:
          return b.reviews - a.reviews;
      }
    });

    return list;
  }, [filters, sort, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    router.push("/products");
  }

  function clearSearch() {
    const next = new URLSearchParams(params.toString());
    next.delete("search");
    next.delete("visual");
    next.delete("imageUrl");
    router.push(`/products?${next.toString()}`);
  }

  const activeCategory =
    filters.category !== "all" ? getCategoryBySlug(filters.category) : null;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {activeCategory ? activeCategory.name : "All Products"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {filtered.length} wholesale products available
      </p>

      {/* Visual search banner */}
      {visual && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-gold/50 bg-secondary/20 p-3 text-sm">
          <ImageIcon className="h-5 w-5 text-primary" />
          <span className="flex-1">
            Showing visually similar wholesale products based on your image.
          </span>
          <button onClick={clearSearch} aria-label="Clear visual search">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Active filter tags */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {search && (
          <FilterTag label={`Search: "${search}"`} onRemove={clearSearch} />
        )}
        {activeCategory && (
          <FilterTag
            label={activeCategory.name}
            onRemove={() => setFilters({ ...filters, category: "all" })}
          />
        )}
        {filters.rating > 0 && (
          <FilterTag
            label={`${filters.rating}★ & up`}
            onRemove={() => setFilters({ ...filters, rating: 0 })}
          />
        )}
        {filters.moq > 0 && (
          <FilterTag
            label={`MOQ ≤ ${filters.moq}`}
            onRemove={() => setFilters({ ...filters, moq: 0 })}
          />
        )}
      </div>

      <div className="mt-6 flex gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
          />
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between gap-3">
            {/* Mobile filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  onReset={resetFilters}
                />
              </SheetContent>
            </Sheet>

            <div className="ml-auto flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <select
                aria-label="Sort by"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {paged.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <p className="text-lg font-semibold">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
              <Button className="mt-4" onClick={resetFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {paged.map((p) => (
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
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="gap-1 py-1 pl-3 pr-1.5">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="rounded-full p-0.5 hover:bg-black/10"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
