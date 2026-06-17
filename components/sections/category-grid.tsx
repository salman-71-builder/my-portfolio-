"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/data/categories";
import { DynamicIcon } from "@/components/dynamic-icon";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
        >
          <Link
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-brand transition-colors group-hover:bg-brand group-hover:text-white">
              <DynamicIcon name={cat.icon} className="h-7 w-7" />
            </span>
            <span className="text-sm font-semibold leading-tight">
              {cat.name}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {cat.productCount.toLocaleString()} items
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
