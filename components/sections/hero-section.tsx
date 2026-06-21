"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-background">
      <div className="container grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Bangladesh&apos;s #1 Chinese Wholesale Platform
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
            Source directly from China.{" "}
            <span className="text-primary">Save up to 60%.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Connect with 500+ verified suppliers and import wholesale products
            straight to your doorstep in Bangladesh — transparent BDT pricing,
            no hidden fees.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/products">
                Browse Products <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/auth?tab=register">Become a Supplier</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Verified Suppliers
            </span>
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> 5–15 Day Delivery
            </span>
            <span className="flex items-center gap-2">
              <BadgePercent className="h-4 w-4 text-primary" /> Factory Prices
            </span>
          </div>
        </motion.div>

        {/* Clean shipment card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="relative hidden lg:block"
        >
          <div className="mx-auto max-w-md rounded-3xl border bg-card p-8 soft-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                🚢 Live Shipment
              </span>
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                In Transit
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {[
                { label: "Guangzhou Port, China", done: true },
                { label: "Chittagong Port, BD", done: true },
                { label: "Customs Cleared", done: true },
                { label: "Out for Delivery — Dhaka", done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      step.done
                        ? "bg-primary text-white"
                        : "border-2 border-dashed border-border text-muted-foreground"
                    }`}
                  >
                    {step.done ? "✓" : i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-secondary p-4 text-center">
              <p className="text-xs text-muted-foreground">Estimated savings</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                ৳ 1,24,500
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
