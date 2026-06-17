"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { categories } from "@/data/categories";
import { getCategoryIcon } from "@/lib/category-icons";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {categories.map((category, i) => {
        const Icon = getCategoryIcon(category.icon);
        return (
          <motion.div
            key={category.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Link
              href={`/products?category=${category.slug}`}
              className="group flex h-full flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-brand-gold/20 text-primary transition-colors group-hover:from-primary group-hover:to-red-700 group-hover:text-white">
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  {category.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {category.productCount.toLocaleString()} items
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
