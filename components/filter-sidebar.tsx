"use client";

import { Star } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import type { Category } from "@/data/categories";
import { formatBDT, cn } from "@/lib/utils";

export interface Filters {
  category: string;
  price: [number, number];
  minMoq: number;
  minRating: number;
  shipping: string;
}

export const PRICE_BOUNDS: [number, number] = [0, 300000];

const moqOptions = [
  { label: "Any", value: 0 },
  { label: "≤ 50 pcs", value: 50 },
  { label: "≤ 100 pcs", value: 100 },
  { label: "≤ 200 pcs", value: 200 },
];

const shippingOptions = [
  { label: "Any time", value: "any" },
  { label: "Within 12 days", value: "12" },
  { label: "Within 16 days", value: "16" },
  { label: "Within 20 days", value: "20" },
];

export function FilterSidebar({
  filters,
  onChange,
  categories,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  categories: Category[];
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">
          Category
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => set("category", "all")}
            className={cn(
              "block w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              filters.category === "all"
                ? "bg-accent font-semibold text-brand"
                : "hover:bg-muted"
            )}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => set("category", c.slug)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                filters.category === c.slug
                  ? "bg-accent font-semibold text-brand"
                  : "hover:bg-muted"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">
          Price Range
        </h3>
        <Slider
          min={PRICE_BOUNDS[0]}
          max={PRICE_BOUNDS[1]}
          step={1000}
          value={filters.price}
          onValueChange={(v) => set("price", v)}
        />
        <div className="mt-3 flex items-center justify-between text-sm font-medium">
          <span>{formatBDT(filters.price[0])}</span>
          <span>{formatBDT(filters.price[1])}</span>
        </div>
      </div>

      <Separator />

      {/* MOQ */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">
          Minimum Order (MOQ)
        </h3>
        <div className="space-y-1">
          {moqOptions.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <input
                type="radio"
                name="moq"
                checked={filters.minMoq === o.value}
                onChange={() => set("minMoq", o.value)}
                className="accent-brand"
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">
          Supplier Rating
        </h3>
        <div className="space-y-1">
          {[0, 4, 4.5, 4.8].map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === r}
                onChange={() => set("minRating", r)}
                className="accent-brand"
              />
              {r === 0 ? (
                "Any rating"
              ) : (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {r} &
                  up
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Shipping */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">
          Shipping Time
        </h3>
        <div className="space-y-1">
          {shippingOptions.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <input
                type="radio"
                name="shipping"
                checked={filters.shipping === o.value}
                onChange={() => set("shipping", o.value)}
                className="accent-brand"
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
