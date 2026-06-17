import Link from "next/link";

import { HeroSection } from "@/components/hero-section";
import { StatsBar } from "@/components/stats-bar";
import { CategoryGrid } from "@/components/category-grid";
import { ProductSlider } from "@/components/product-slider";
import { FlashDeals } from "@/components/flash-deals";
import { HowItWorks } from "@/components/how-it-works";
import { WhyChooseUs } from "@/components/why-choose-us";
import { SuppliersShowcase } from "@/components/suppliers-showcase";
import { TestimonialSlider } from "@/components/testimonial-slider";
import { Newsletter } from "@/components/newsletter";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { products, hotProducts, newProducts } from "@/data/products";

export default function HomePage() {
  const featured = [...hotProducts, ...products].slice(0, 12);
  const arrivals = newProducts.slice(0, 8);

  return (
    <>
      <HeroSection />
      <StatsBar />

      {/* Categories */}
      <section className="container py-12">
        <SectionHeading
          title="Shop by Category"
          subtitle="Explore wholesale products across 12 categories"
          viewAllHref="/categories"
          viewAllLabel="All Categories"
        />
        <CategoryGrid />
      </section>

      {/* Featured Products */}
      <section className="container py-12">
        <SectionHeading
          title="Featured Products"
          subtitle="Hand-picked wholesale deals from top suppliers"
          viewAllHref="/products"
          viewAllLabel="View All Products"
        />
        <ProductSlider products={featured} />
      </section>

      <FlashDeals />

      {/* How It Works */}
      <section className="container py-14">
        <SectionHeading
          title="How It Works"
          subtitle="From China to your doorstep in 4 simple steps"
          center
        />
        <HowItWorks />
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/30 py-14">
        <div className="container">
          <SectionHeading
            title="Why Choose Import China"
            subtitle="The smartest way to source wholesale from China"
            center
          />
          <WhyChooseUs />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container py-12">
        <SectionHeading
          title="New Arrivals"
          subtitle="The latest products fresh from our suppliers"
          viewAllHref="/products?sort=newest"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {arrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <SuppliersShowcase />

      {/* Testimonials */}
      <section className="container py-14">
        <SectionHeading
          title="What Our Buyers Say"
          subtitle="Join 50,000+ happy businesses across Bangladesh"
          center
        />
        <TestimonialSlider />
      </section>

      {/* CTA strip */}
      <section className="container pb-4">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary to-red-700 p-8 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h3 className="text-2xl font-extrabold">
              Ready to start sourcing?
            </h3>
            <p className="text-white/90">
              Create a free account and unlock wholesale prices today.
            </p>
          </div>
          <Button size="lg" variant="gold" className="shrink-0" asChild>
            <Link href="/auth?tab=register">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
