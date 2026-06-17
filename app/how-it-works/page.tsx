import type { Metadata } from "next";
import Link from "next/link";
import { Plane, Ship, Warehouse, Truck, Home } from "lucide-react";

import { HowItWorks } from "@/components/how-it-works";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how Import China sources wholesale products from China and delivers them to your door in Bangladesh.",
};

const timeline = [
  { icon: Warehouse, title: "Order Confirmed", desc: "Supplier prepares your goods in China.", day: "Day 1" },
  { icon: Plane, title: "Quality Check", desc: "Our QC team inspects before shipping.", day: "Day 2-3" },
  { icon: Ship, title: "International Freight", desc: "Air or sea freight to Bangladesh.", day: "Day 4-12" },
  { icon: Truck, title: "Customs Clearance", desc: "We handle all import paperwork.", day: "Day 12-14" },
  { icon: Home, title: "Doorstep Delivery", desc: "Delivered anywhere in Bangladesh.", day: "Day 15" },
];

const faqs = [
  {
    q: "What is the minimum order quantity (MOQ)?",
    a: "MOQ varies by product and supplier — it's clearly shown on every product page, typically ranging from 5 to 200 pieces.",
  },
  {
    q: "How long does delivery take?",
    a: "Most orders arrive in 5-15 days depending on the shipping method (air or sea) and product availability.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bKash, Nagad, Visa, Mastercard and direct bank transfer. All payments are secured.",
  },
  {
    q: "Do you handle customs and import duties?",
    a: "Yes. Our team manages customs clearance and all import documentation. Duty estimates are included in your quote.",
  },
  {
    q: "Can I return a product?",
    a: "Yes. We offer hassle-free returns and refund protection on eligible orders. Contact support within 7 days of delivery.",
  },
  {
    q: "How do I become a supplier?",
    a: "Register as a supplier from the sign-up page. Our team will verify your business and list your products.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="pb-10">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-dark to-primary py-14 text-center text-white">
        <div className="container">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            How Import China Works
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-200">
            From browsing products to doorstep delivery — sourcing wholesale from
            China has never been this simple.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="container py-14">
        <HowItWorks />
      </section>

      {/* Timeline */}
      <section className="bg-muted/30 py-14">
        <div className="container">
          <SectionHeading
            title="Shipping Timeline: China → Bangladesh"
            subtitle="A typical end-to-end delivery journey"
            center
          />
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {timeline.map((t, i) => (
              <div
                key={t.title}
                className="relative rounded-xl border bg-card p-5 text-center shadow-sm"
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white">
                  {t.day}
                </span>
                <span className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <t.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-sm font-bold">{t.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
                <span className="mt-2 inline-block text-lg font-bold text-brand-gold">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-14">
        <SectionHeading
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about sourcing with us"
          center
        />
        <div className="mx-auto mt-6 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" asChild>
            <Link href="/products">Start Browsing Products</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
