"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Store, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-[#660000] to-primary text-white">
      {/* Chinese pattern motif */}
      <div className="absolute inset-0 bg-chinese-pattern [background-size:24px_24px] opacity-60" />
      <div className="absolute -right-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-gold/20 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />

      <div className="container relative grid items-center gap-8 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-brand-gold" />
            500+ Verified China Suppliers
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Source Directly from China —{" "}
            <span className="text-gradient-gold">Save Up to 60%</span>
          </h1>

          <p className="mt-5 max-w-lg text-lg text-gray-200">
            Bangladesh&apos;s #1 B2B Wholesale Sourcing Platform. Browse millions
            of products, place bulk orders, and we deliver straight to your door.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="gold" asChild>
              <Link href="/products">
                Browse Products
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-primary"
              asChild
            >
              <Link href="/auth?tab=register">
                <Store className="h-5 w-5" />
                Become a Supplier
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="relative hidden lg:block"
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80",
              "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
              "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&q=80",
              "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&q=80",
            ].map((src, i) => (
              <motion.div
                key={src}
                animate={{ y: [0, i % 2 === 0 ? -10 : 10, 0] }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="overflow-hidden rounded-2xl border-2 border-brand-gold/30 shadow-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Wholesale product"
                  className="h-44 w-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
