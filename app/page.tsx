import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { HeroSection } from "@/components/sections/hero-section";
import { StatsBar } from "@/components/sections/stats-bar";
import { CategoryGrid } from "@/components/sections/category-grid";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { FlashDeals } from "@/components/sections/flash-deals";
import { HowItWorks } from "@/components/sections/how-it-works";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { TestimonialSlider } from "@/components/sections/testimonial-slider";
import { SuppliersShowcase } from "@/components/sections/suppliers-showcase";
import { Newsletter } from "@/components/sections/newsletter";
import { ProductCard } from "@/components/product-card";
import {
  getFeaturedProducts,
  getFlashDeals,
  getNewProducts,
  getCategories,
} from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, flashDeals, arrivals] = await Promise.all([
    getCategories(),
    getFeaturedProducts(12),
    getFlashDeals(6),
    getNewProducts(8),
  ]);

  return (
    <>
      <HeroSection />
      <StatsBar />

      {/* Categories */}
      <section className="container py-12 sm:py-16">
        <SectionHeading
          title="Shop by Category"
          subtitle="Explore wholesale products across every category"
          viewAllHref="/categories"
        />
        <CategoryGrid categories={categories} />
      </section>

      {/* Featured Products */}
      <section className="container py-12 sm:py-16">
        <SectionHeading
          title="Featured Products"
          subtitle="Top-rated wholesale items from verified suppliers"
          viewAllHref="/products"
          viewAllLabel="View All Products"
        />
        <FeaturedProducts products={featured} />
      </section>

      {/* Flash Deals */}
      {flashDeals.length > 0 && (
        <section className="container py-6 sm:py-8">
          <FlashDeals products={flashDeals} />
        </section>
      )}

      {/* How It Works */}
      <section className="bg-accent/40 py-12 sm:py-16">
        <div className="container">
          <SectionHeading
            title="How It Works"
            subtitle="From China to your doorstep in 4 simple steps"
            center
          />
          <HowItWorks />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container py-12 sm:py-16">
        <SectionHeading
          title="Why Choose Import China"
          subtitle="The smartest way to source wholesale from China"
          center
        />
        <WhyChooseUs />
      </section>

      {/* New Arrivals */}
      {arrivals.length > 0 && (
        <section className="container py-12 sm:py-16">
          <SectionHeading
            title="New Arrivals"
            subtitle="Freshly added products"
            viewAllHref="/products?sort=newest"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {arrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Suppliers */}
      <section className="container py-12 sm:py-16">
        <SuppliersShowcase />
      </section>

      {/* Testimonials */}
      <section className="bg-accent/40 py-12 sm:py-16">
        <div className="container">
          <SectionHeading
            title="What Our Buyers Say"
            subtitle="Join 50,000+ happy buyers across Bangladesh"
            center
          />
          <TestimonialSlider />
        </div>
      </section>

      {/* Newsletter */}
      <section className="container py-12 sm:py-16">
        <Newsletter />
      </section>

      {/* Bottom CTA */}
      <section className="container pb-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-10 text-center shadow-sm">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Ready to start sourcing?
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Create a free account and place your first wholesale order today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth?tab=register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
