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
import { RouteVisualization } from "@/components/sections/route-visualization";
import { MoodShopping } from "@/components/sections/mood-shopping";
import { PinnedShowcase } from "@/components/sections/pinned-showcase";
import { Reveal } from "@/components/reveal";
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

      {/* China → Bangladesh route visualization */}
      <RouteVisualization />

      {/* Mood-based shopping */}
      <MoodShopping />

      {/* 3D Virtual Showroom CTA */}
      <section className="container py-6 sm:py-8">
        <Link
          href="/showroom"
          className="group flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card p-8 text-center soft-shadow transition-shadow hover:shadow-lg sm:flex-row sm:text-left"
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
              🕹️ New · Immersive
            </span>
            <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
              Step inside our 3D Virtual Showroom
            </h2>
            <p className="mt-1 max-w-xl text-muted-foreground">
              Walk through Electronics, Furniture, Fashion &amp; Gadgets rooms —
              click any product to shop. VR-headset compatible. 🥽
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-transform group-hover:scale-105">
            Enter Showroom →
          </span>
        </Link>
      </section>

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

      {/* Apple-style pinned scroll showcase */}
      <PinnedShowcase />

      {/* How It Works */}
      <section className="bg-accent/40 py-12 sm:py-16">
        <div className="container">
          <Reveal direction="rotate">
            <SectionHeading
              title="How It Works"
              subtitle="From China to your doorstep in 4 simple steps"
              center
            />
            <HowItWorks />
          </Reveal>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container py-12 sm:py-16">
        <Reveal direction="up">
          <SectionHeading
            title="Why Choose Import China"
            subtitle="The smartest way to source wholesale from China"
            center
          />
          <WhyChooseUs />
        </Reveal>
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
