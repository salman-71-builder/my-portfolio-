"use client";

import { motion } from "framer-motion";
import { Search, ShoppingCart, Ship, PackageCheck } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse & Select Products",
    desc: "Explore 10,000+ wholesale products from verified China suppliers.",
  },
  {
    icon: ShoppingCart,
    title: "Place Bulk Order",
    desc: "Add to cart or request a custom quote with your required quantity.",
  },
  {
    icon: Ship,
    title: "We Source from China",
    desc: "Our team handles quality checks, payment & international shipping.",
  },
  {
    icon: PackageCheck,
    title: "Deliver to Your Door",
    desc: "Receive your order anywhere in Bangladesh within 5-15 days.",
  },
];

export function HowItWorks() {
  return (
    <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* connector line on desktop */}
      <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-primary/20 via-brand-gold/40 to-primary/20 lg:block" />

      {steps.map((step, i) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="relative flex flex-col items-center text-center"
        >
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-red-700 text-white shadow-lg">
            <step.icon className="h-7 w-7" />
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-black">
              {i + 1}
            </span>
          </span>
          <h3 className="mt-4 font-bold">{step.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
