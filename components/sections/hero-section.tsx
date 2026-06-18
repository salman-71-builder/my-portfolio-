"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Store, ShieldCheck, Truck, BadgePercent, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroLogo } from "@/components/hero-logo";
import { TypedText } from "@/components/typed-text";
import { CountUp } from "@/components/count-up";

// Lazy, client-only 3D background.
const FloatingShapes = dynamic(
  () => import("@/components/three/floating-shapes"),
  { ssr: false }
);

const headingTop = "Source Directly from China";

export function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#0a0604] text-white">
      {/* 3D floating shapes */}
      <div className="absolute inset-0">
        <FloatingShapes reduced={!!reduce} />
      </div>

      {/* glow + pattern overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 25% 30%, rgba(204,0,0,0.35), transparent 55%), radial-gradient(circle at 80% 70%, rgba(255,215,0,0.18), transparent 50%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-chinese-pattern opacity-[0.07]" />
      {/* animated futuristic grid */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />

      <div className="container relative z-10 grid items-center gap-10 py-20 lg:grid-cols-2 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-6">
            <HeroLogo />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
            Bangladesh&apos;s #1 B2B Wholesale Sourcing Platform
          </span>

          <motion.h1
            initial={reduce ? false : { opacity: 0, rotateX: -40, y: 20 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            style={{ transformPerspective: 800 }}
            className="text-3d mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {headingTop} —{" "}
            <span className="text-3d-gold text-gradient-gold">
              Save Up to 60%
            </span>
          </motion.h1>

          <p className="mt-4 text-lg font-semibold sm:text-xl">
            <TypedText
              text="Bangladesh's #1 Chinese Wholesale Platform"
              className="text-gradient-hero"
            />
          </p>

          <p className="mt-4 max-w-xl text-base text-white/75 sm:text-lg">
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
              className="border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-brand"
            >
              <Link href="/auth?tab=register">
                <Store className="h-4 w-4" /> Become a Supplier
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
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

          {/* live count-up stats */}
          <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
            {[
              { value: 10000, suffix: "+", label: "Products" },
              { value: 500, suffix: "+", label: "Suppliers" },
              { value: 50000, suffix: "+", label: "Buyers" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl px-3 py-3 text-center">
                <p className="text-xl font-extrabold text-gold sm:text-2xl">
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-0.5 text-[11px] text-white/65">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Glass shipment card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative hidden lg:block"
        >
          <div className="relative mx-auto aspect-square max-w-md">
            <div className="absolute inset-0 rotate-6 rounded-3xl bg-gold/20 blur-xl" />
            <div className="absolute inset-0 -rotate-3 rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl" />
            <div className="absolute inset-6 flex flex-col justify-between rounded-2xl border border-white/10 bg-[#120a06]/80 p-6 text-white shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gold">
                  🚢 Live Shipment
                </span>
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">
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
                          ? "bg-gold text-black"
                          : "border-2 border-dashed border-gold/60 text-gold"
                      }`}
                    >
                      {step.done ? "✓" : i + 1}
                    </span>
                    <span className="text-sm font-medium text-white/85">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-xs text-white/60">Estimated savings</p>
                <p className="text-2xl font-extrabold text-gold">৳ 1,24,500</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* bouncing scroll-down cue */}
      <a
        href="#main-content"
        aria-label="Scroll down"
        className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/60 transition-colors hover:text-gold lg:flex"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest">Scroll</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
