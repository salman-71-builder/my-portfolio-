import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { DynamicIcon } from "@/components/dynamic-icon";
import { categories } from "@/data/categories";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse all 12 wholesale product categories — Electronics, Fashion, Home & Kitchen, Tools and more.",
};

export default function CategoriesPage() {
  const total = categories.reduce((s, c) => s + c.productCount, 0);

  return (
    <>
      <section className="gradient-brand py-12 text-white">
        <div className="container text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            All Categories
          </h1>
          <p className="mt-2 text-white/80">
            {categories.length} categories · {total.toLocaleString()}+ wholesale
            products
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-brand backdrop-blur">
                  <DynamicIcon name={cat.icon} className="h-6 w-6" />
                </span>
                <div className="absolute bottom-3 left-4 text-white">
                  <h3 className="text-lg font-bold">{cat.name}</h3>
                  <p className="text-xs text-white/80">
                    {cat.productCount.toLocaleString()} products
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {cat.description}
                </p>
                <ArrowRight className="h-4 w-4 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
