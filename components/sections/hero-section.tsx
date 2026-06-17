"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Store, ShieldCheck, Truck, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-brand text-white">
      {/* Chinese pattern motif */}
      <div className="absolute inset-0 bg-chinese-pattern opacity-60" />
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="container relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
            Bangladesh&apos;s #1 B2B Wholesale Sourcing Platform
          </span>

          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Source Directly from China —{" "}
            <span className="text-gradient-gold">Save Up to 60%</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
            Connect with 500+ verified suppliers and import wholesale products
            straight to your doorstep in Bangladesh. Transparent BDT pricing, no
            hidden fees.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="gold" size="lg" asChild>
              <Link href="/products">
                Browse Products <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-brand"
            >
              <Link href="/auth?tab=register">
                <Store className="h-4 w-4" /> Become a Supplier
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold" /> Verified Suppliers
            </span>
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gold" /> 5–15 Day Delivery
            </span>
            <span className="flex items-center gap-2">
              <BadgePercent className="h-4 w-4 text-gold" /> Factory Prices
            </span>
          </div>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="relative hidden lg:block"
        >
          <div className="relative mx-auto aspect-square max-w-md">
            <div className="absolute inset-0 rotate-6 rounded-3xl bg-gold/30 backdrop-blur" />
            <div className="absolute inset-0 -rotate-3 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl" />
            <div className="absolute inset-6 flex flex-col justify-between rounded-2xl bg-white p-6 text-neutral-900 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brand">
                  🚢 Live Shipment
                </span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  In Transit
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Guangzhou Port, China", done: true },
                  { label: "Chittagong Port, BD", done: true },
                  { label: "Customs Cleared", done: true },
                  { label: "Out for Delivery — Dhaka", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        step.done
                          ? "bg-brand text-white"
                          : "border-2 border-dashed border-brand text-brand"
                      }`}
                    >
                      {step.done ? "✓" : i + 1}
                    </span>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-accent p-3 text-center">
                <p className="text-xs text-muted-foreground">Estimated savings</p>
                <p className="text-2xl font-extrabold text-brand">৳ 1,24,500</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
