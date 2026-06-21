import Link from "next/link";
import { HeroCarousel } from "@/components/sections/hero-carousel";
import { TrustBar } from "@/components/sections/trust-bar";
import { CategoryGrid } from "@/components/sections/category-grid";
import { ShippingShowcase } from "@/components/sections/shipping-showcase";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { FlashDeals } from "@/components/sections/flash-deals";
import { HowItWorks } from "@/components/sections/how-it-works";
import { WhyChinaCart } from "@/components/sections/why-chinacart";
import { SuppliersShowcase } from "@/components/sections/suppliers-showcase";
import { TestimonialSlider } from "@/components/sections/testimonial-slider";
import { Newsletter } from "@/components/sections/newsletter";
import { RecentlyViewed } from "@/components/recently-viewed";
import { getActiveBanners } from "@/lib/banners-server";
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
  const [banners, categories, featured, flashDeals, arrivals] = await Promise.all([
    getActiveBanners(),
    getCategories(),
    getFeaturedProducts(12),
    getFlashDeals(6),
    getNewProducts(12),
  ]);

  const trending = [...featured].reverse();

  return (
    <div className="bg-[#f3f3f3]">
      {/* 1. Cover banner (admin-managed) */}
      <HeroCarousel banners={banners} />

      <div className="container space-y-4 py-4">
        {/* 2. Trust badges */}
        <TrustBar />

        {/* 3. Shop by category */}
        <Section title="Shop by Category" href="/categories">
          <CategoryGrid categories={categories} />
        </Section>

        {/* 4. China → Bangladesh shipping route */}
        <ShippingShowcase />

        {/* 5. Featured / trending */}
        <Section title="Trending in Bangladesh 🇧🇩" href="/products">
          <FeaturedProducts products={trending} />
        </Section>

        {/* 6. Flash deals */}
        {flashDeals.length > 0 && <FlashDeals products={flashDeals} />}

        {/* 7. Best sellers */}
        <Section title="Best Sellers" href="/products?sort=popular">
          <FeaturedProducts products={featured} />
        </Section>

        {/* New arrivals */}
        {arrivals.length > 0 && (
          <Section title="New Arrivals" href="/products?sort=newest">
            <FeaturedProducts products={arrivals} />
          </Section>
        )}

        {/* Recently viewed */}
        <RecentlyViewed />

        {/* 8. How it works */}
        <Section title="How It Works">
          <HowItWorks />
        </Section>

        {/* 9. Why ChinaCart (comparison) */}
        <WhyChinaCart />

        {/* 10. Testimonials */}
        <Section title="What Our Buyers Say">
          <TestimonialSlider />
        </Section>

        {/* 11. Suppliers */}
        <SuppliersShowcase />

        {/* 12. Newsletter */}
        <Newsletter />
      </div>
    </div>
  );
}
