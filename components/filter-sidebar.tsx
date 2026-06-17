"use client";

import { Star } from "lucide-react";

import { categories } from "@/data/categories";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/utils";

export interface Filters {
  category: string;
  price: [number, number];
  moq: number;
  rating: number;
  shippingDays: number;
}

export const DEFAULT_FILTERS: Filters = {
  category: "all",
  price: [0, 30000],
  moq: 0,
  rating: 0,
  shippingDays: 0,
};

export function FilterSidebar({
  filters,
  onChange,
  onReset,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      {/* Category */}
      <FilterGroup title="Category">
        <div className="space-y-1.5">
          <RadioRow
            label="All Categories"
            checked={filters.category === "all"}
            onClick={() => onChange({ ...filters, category: "all" })}
          />
          {categories.map((c) => (
            <RadioRow
              key={c.slug}
              label={c.name}
              checked={filters.category === c.slug}
              onClick={() => onChange({ ...filters, category: c.slug })}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Price */}
      <FilterGroup title="Price Range (per piece)">
        <Slider
          min={0}
          max={30000}
          step={100}
          value={filters.price}
          onValueChange={(v) =>
            onChange({ ...filters, price: [v[0], v[1]] as [number, number] })
          }
        />
        <div className="mt-3 flex justify-between text-sm font-medium">
          <span>{formatBDT(filters.price[0])}</span>
          <span>{formatBDT(filters.price[1])}</span>
        </div>
      </FilterGroup>

      {/* MOQ */}
      <FilterGroup title="Max MOQ (pieces)">
        <div className="flex flex-wrap gap-2">
          {[0, 20, 50, 100].map((m) => (
            <Badge
              key={m}
              variant={filters.moq === m ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onChange({ ...filters, moq: m })}
            >
              {m === 0 ? "Any" : `≤ ${m}`}
            </Badge>
          ))}
        </div>
      </FilterGroup>

      {/* Rating */}
      <FilterGroup title="Minimum Rating">
        <div className="space-y-1.5">
          {[4.5, 4, 0].map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, rating: r })}
              className={`flex w-full items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted ${
                filters.rating === r ? "bg-muted font-semibold" : ""
              }`}
            >
              {r === 0 ? (
                "Any rating"
              ) : (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < Math.floor(r)
                          ? "h-4 w-4 fill-brand-gold text-brand-gold"
                          : "h-4 w-4 text-muted-foreground/30"
                      }
                    />
                  ))}
                  <span className="ml-1">&amp; up</span>
                </>
              )}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Shipping */}
      <FilterGroup title="Shipping Time">
        <div className="flex flex-wrap gap-2">
          {[
            { v: 0, label: "Any" },
            { v: 8, label: "≤ 8 days" },
            { v: 12, label: "≤ 12 days" },
          ].map((s) => (
            <Badge
              key={s.v}
              variant={filters.shippingDays === s.v ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onChange({ ...filters, shippingDays: s.v })}
            >
              {s.label}
            </Badge>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b pb-5">
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      {children}
    </div>
  );
}

function RadioRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-muted ${
        checked ? "font-semibold text-primary" : "text-foreground/80"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
          checked ? "border-primary" : "border-muted-foreground/40"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      {label}
    </button>
  );
}
