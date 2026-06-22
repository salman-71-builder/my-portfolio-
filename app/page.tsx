import Link from "next/link";
import { HeroCarousel } from "@/components/sections/hero-carousel";
import { TrustBar } from "@/components/sections/trust-bar";
import { CategoryGrid } from "@/components/sections/category-grid";
import { HowItWorks } from "@/components/sections/how-it-works";
import { WhyChinaCart } from "@/components/sections/why-chinacart";
import { SuppliersShowcase } from "@/components/sections/suppliers-showcase";
import { TestimonialSlider } from "@/components/sections/testimonial-slider";
import { Newsletter } from "@/components/sections/newsletter";
import { RecentlyViewed } from "@/components/recently-viewed";
import { ProductCard } from "@/components/product-card";
import { ScrollReveal, RevealHeading, StaggerGrid } from "@/components/scroll-reveal";
import { getActiveBanners } from "@/lib/banners-server";
import {
  getFeaturedProducts,
  getNewProducts,
  getCategories,
} from "@/lib/catalog";
import type { Product } from "@/data/products";

export const dynamic = "force-dynamic";

const GRID = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";

function ProductSection({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Product[];
}) {
  return (
    <ScrollReveal as="section" className="rounded-md border bg-card p-4">
      <RevealHeading className="mb-3 flex items-baseline justify-between">
        <h2 className="heading-accent text-lg font-bold sm:text-xl">{title}</h2>
        <Link href={href} className="text-sm font-medium text-primary hover:underline">
          See more
        </Link>
      </RevealHeading>
      <StaggerGrid className={GRID}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </StaggerGrid>
    </ScrollReveal>
  );
}

export default async function HomePage() {
  const [banners, categories, featured, arrivals] = await Promise.all([
    getActiveBanners(),
    getCategories(),
    getFeaturedProducts(12),
    getNewProducts(12),
  ]);

  const trending = [...featured].reverse().slice(0, 8);
  const bestSellers = featured.slice(0, 8);
  const newArrivals = arrivals.slice(0, 8);

  return (
    <div className="bg-[#f5f5f5]">
      {/* 1. Cover banner */}
      <HeroCarousel banners={banners} />

      <div className="container space-y-4 py-4">
        {/* 2. Trust badges */}
        <ScrollReveal>
          <TrustBar />
        </ScrollReveal>

        {/* 3. Trending products */}
        <ProductSection
          title="Trending in Bangladesh 🇧🇩"
          href="/products"
          products={trending}
        />

        {/* 4. Best sellers */}
        <ProductSection
          title="Best Sellers"
          href="/products?sort=popular"
          products={bestSellers}
        />

        {/* 5. Featured / new arrivals */}
        <ProductSection
          title="New Arrivals"
          href="/products?sort=newest"
          products={newArrivals}
        />

        {/* recently viewed */}
        <ScrollReveal>
          <RecentlyViewed />
        </ScrollReveal>

        {/* 6. How it works */}
        <ScrollReveal as="section" className="rounded-md border bg-card p-4">
          <RevealHeading className="mb-3">
            <h2 className="heading-accent text-lg font-bold sm:text-xl">How It Works</h2>
          </RevealHeading>
          <HowItWorks />
        </ScrollReveal>

        {/* 7. Why ChinaCart */}
        <ScrollReveal>
          <WhyChinaCart />
        </ScrollReveal>

        {/* 8. Testimonials */}
        <ScrollReveal as="section" className="rounded-md border bg-card p-4">
          <RevealHeading className="mb-3">
            <h2 className="heading-accent text-lg font-bold sm:text-xl">What Our Buyers Say</h2>
          </RevealHeading>
          <TestimonialSlider />
        </ScrollReveal>

        {/* 9. Suppliers */}
        <ScrollReveal>
          <SuppliersShowcase />
        </ScrollReveal>

        {/* 10. Shop by category */}
        <ScrollReveal as="section" className="rounded-md border bg-card p-4">
          <RevealHeading className="mb-3 flex items-baseline justify-between">
            <h2 className="heading-accent text-lg font-bold sm:text-xl">Shop by Category</h2>
            <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
              See more
            </Link>
          </RevealHeading>
          <CategoryGrid categories={categories} />
        </ScrollReveal>

        {/* 11. Newsletter */}
        <ScrollReveal>
          <Newsletter />
        </ScrollReveal>
      </div>
    </div>
  );
}
