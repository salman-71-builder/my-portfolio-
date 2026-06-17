import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { categories } from "@/data/categories";
import { getCategoryIcon } from "@/lib/category-icons";

export const metadata: Metadata = {
  title: "All Categories",
  description:
    "Browse all 12 wholesale product categories — from Electronics to Industrial Goods.",
};

export default function CategoriesPage() {
  return (
    <div className="container py-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Browse All Categories
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Discover wholesale products across 12 categories, sourced directly from
          verified suppliers in China.
        </p>
        <span className="mx-auto mt-4 block h-1 w-24 rounded-full bg-gradient-to-r from-primary to-brand-gold" />
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          return (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-primary shadow">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="absolute bottom-3 left-4 text-white">
                  <h2 className="text-xl font-bold">{category.name}</h2>
                  <p className="text-sm text-white/80">
                    {category.productCount.toLocaleString()} products
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
                <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
