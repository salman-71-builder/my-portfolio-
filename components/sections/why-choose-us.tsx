"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Truck,
  Headphones,
  RotateCcw,
  Tag,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Suppliers",
    desc: "Every supplier is vetted and quality-audited before listing.",
  },
  {
    icon: Lock,
    title: "Secure Payment",
    desc: "Pay safely with bKash, Nagad, cards or bank transfer.",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    desc: "Door-to-door delivery across Bangladesh in 5–15 days.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Dedicated sourcing agents ready to help anytime.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "Hassle-free returns on defective or mismatched items.",
  },
  {
    icon: Tag,
    title: "Competitive Prices",
    desc: "Direct factory pricing — save up to 60% vs local retail.",
  },
];

export function WhyChooseUs() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
            className="group flex gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-brand hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-brand transition-colors group-hover:bg-brand group-hover:text-white">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
