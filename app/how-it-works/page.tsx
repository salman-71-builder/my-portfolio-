import Link from "next/link";
import type { Metadata } from "next";
import {
  Search,
  ShoppingBag,
  Plane,
  Truck,
  Ship,
  Warehouse,
  PackageCheck,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Faq, type FaqItem } from "@/components/faq";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how Import China sources wholesale products from China and delivers them to your doorstep in Bangladesh in 5–15 days.",
};

const timeline = [
  {
    icon: Warehouse,
    title: "Order Consolidation",
    days: "Day 1–2",
    desc: "Your order is confirmed and consolidated at our Guangzhou warehouse.",
  },
  {
    icon: PackageCheck,
    title: "Quality Inspection",
    days: "Day 2–3",
    desc: "Every shipment is quality-checked and securely packed for export.",
  },
  {
    icon: Ship,
    title: "International Shipping",
    days: "Day 3–10",
    desc: "Goods ship via air or sea freight from China to Chittagong port.",
  },
  {
    icon: Home,
    title: "Customs & Delivery",
    days: "Day 10–15",
    desc: "We clear customs and deliver to your doorstep anywhere in Bangladesh.",
  },
];

const faqs: FaqItem[] = [
  {
    q: "What is the minimum order quantity (MOQ)?",
    a: "MOQ varies by product and supplier — it's clearly shown on each product page. Many products start as low as 10–50 pieces, making it easy for small businesses to get started.",
  },
  {
    q: "How long does delivery take to Bangladesh?",
    a: "Most orders arrive within 5–15 days depending on the product, shipping method (air or sea) and your location. You'll get tracking updates at every stage.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bKash, Nagad, Visa, Mastercard and direct bank transfer. All prices are shown transparently in BDT with no hidden fees.",
  },
  {
    q: "Do you handle customs clearance?",
    a: "Yes. Our team handles all import documentation and customs clearance so you don't have to worry about the paperwork.",
  },
  {
    q: "Can I request product samples?",
    a: "Absolutely. Use the 'Request Quote' button on any product to ask for samples and custom pricing before placing a bulk order.",
  },
  {
    q: "Are the suppliers verified?",
    a: "Every supplier on Import China is vetted and quality-audited. You can see ratings, response rates and years active on each product page.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="gradient-brand py-14 text-white">
        <div className="container text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">How It Works</h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/80">
            Sourcing wholesale from China has never been easier. Here&apos;s how
            we get factory-direct products to your doorstep in Bangladesh.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="container py-14">
        <SectionHeading
          title="4 Simple Steps"
          subtitle="From browsing to delivery"
          center
        />
        <HowItWorks />
      </section>

      {/* Timeline */}
      <section className="bg-accent/40 py-14">
        <div className="container">
          <SectionHeading
            title="Shipping Timeline: China → Bangladesh"
            subtitle="A typical 5–15 day journey"
            center
          />
          <div className="mx-auto max-w-3xl space-y-4">
            {timeline.map((t, i) => {
              const Icon = t.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">{t.title}</h3>
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-brand">
                        {t.days}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-14">
        <SectionHeading
          title="Frequently Asked Questions"
          subtitle="Everything you need to know"
          center
        />
        <Faq items={faqs} />
      </section>

      {/* CTA */}
      <section className="container pb-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl gradient-brand p-10 text-center text-white">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Start sourcing today
          </h2>
          <p className="max-w-lg text-white/80">
            Thousands of products, verified suppliers and transparent BDT
            pricing — all in one place.
          </p>
          <Button size="lg" variant="gold" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
