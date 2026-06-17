"use client";

import { motion } from "framer-motion";
import { Search, ShoppingBag, Plane, Truck } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse & Select Products",
    desc: "Explore 10,000+ wholesale products from verified Chinese suppliers and pick what fits your business.",
  },
  {
    icon: ShoppingBag,
    title: "Place Bulk Order",
    desc: "Add to cart, meet the MOQ and place your order with secure payment in BDT — bKash, Nagad or bank.",
  },
  {
    icon: Plane,
    title: "We Source from China",
    desc: "Our team handles supplier coordination, quality checks, consolidation and international shipping.",
  },
  {
    icon: Truck,
    title: "Delivered to Your Door",
    desc: "We clear customs and deliver straight to your doorstep anywhere in Bangladesh in 5–15 days.",
  },
];

export function HowItWorks() {
  return (
    <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* connector line */}
      <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-brand/20 via-brand to-brand/20 lg:block" />
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-4 ring-accent">
              <Icon className="h-7 w-7" />
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-neutral-900">
                {i + 1}
              </span>
            </div>
            <h3 className="text-base font-bold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
