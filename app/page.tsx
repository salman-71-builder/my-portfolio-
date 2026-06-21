import Link from "next/link";
import { HeroCarousel } from "@/components/sections/hero-carousel";
import { CategoryGrid } from "@/components/sections/category-grid";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { FlashDeals } from "@/components/sections/flash-deals";
import { SuppliersShowcase } from "@/components/sections/suppliers-showcase";
import { TestimonialSlider } from "@/components/sections/testimonial-slider";
import { Newsletter } from "@/components/sections/newsletter";
import { RecentlyViewed } from "@/components/recently-viewed";
import {
  getFeaturedProducts,
  getFlashDeals,
  getNewProducts,
  getCategories,
} from "@/lib/catalog";

export const dynamic = "force-dynamic";

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-medium text-[#1a6fc4] hover:underline">
            See more
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function HomePage() {
  const [categories, featured, flashDeals, arrivals] = await Promise.all([
    getCategories(),
    getFeaturedProducts(12),
    getFlashDeals(6),
    getNewProducts(12),
  ]);

  const trending = [...featured].reverse();

  return (
    <div className="bg-[#f3f3f3]">
      <HeroCarousel />

      <div className="container space-y-4 py-4">
        {/* Shop by category */}
        <Section title="Shop by Category" href="/categories">
          <CategoryGrid categories={categories} />
        </Section>

        {/* Deals of the Day */}
        {flashDeals.length > 0 && <FlashDeals products={flashDeals} />}

        {/* Best Sellers */}
        <Section title="Best Sellers" href="/products?sort=popular">
          <FeaturedProducts products={featured} />
        </Section>

        {/* New Arrivals */}
        {arrivals.length > 0 && (
          <Section title="New Arrivals" href="/products?sort=newest">
            <FeaturedProducts products={arrivals} />
          </Section>
        )}

        {/* Trending in Bangladesh */}
        <Section title="Trending in Bangladesh 🇧🇩" href="/products">
          <FeaturedProducts products={trending} />
        </Section>

        {/* Recently viewed */}
        <RecentlyViewed />

        {/* Suppliers */}
        <SuppliersShowcase />

        {/* Trust / reviews */}
        <Section title="What Our Buyers Say">
          <TestimonialSlider />
        </Section>

        {/* Newsletter */}
        <Newsletter />
      </div>
    </div>
  );
}
