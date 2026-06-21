"use client";

import Link from "next/link";
import type { Category } from "@/data/categories";
import { DynamicIcon } from "@/components/dynamic-icon";
import { TiltCard } from "@/components/tilt-card";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((cat) => (
        <TiltCard key={cat.id} hoverOnly strength={12} className="h-full">
          <Link
            href={`/products?category=${cat.slug}`}
            className="group flex h-full flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-navy hover:shadow-lg"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-navy transition-colors group-hover:bg-navy group-hover:text-white">
              <DynamicIcon name={cat.icon} className="h-7 w-7" />
            </span>
            <span className="text-sm font-semibold leading-tight">{cat.name}</span>
            <span className="text-[11px] text-muted-foreground">
              {cat.productCount.toLocaleString()} items
            </span>
          </Link>
        </TiltCard>
      ))}
    </div>
  );
}
