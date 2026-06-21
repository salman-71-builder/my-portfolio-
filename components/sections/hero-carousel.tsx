"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bg: string; // tailwind gradient classes
  emoji: string;
}

const SLIDES: Slide[] = [
  {
    title: "Wholesale from China, delivered to Bangladesh",
    subtitle: "10,000+ products from verified suppliers · transparent BDT pricing",
    cta: "Shop all products",
    href: "/products",
    bg: "from-[#1a2f5e] to-[#22407a]",
    emoji: "🚢",
  },
  {
    title: "Today's Deals — up to 60% off",
    subtitle: "Limited-time wholesale discounts across every category",
    cta: "See today's deals",
    href: "/products?sort=popular",
    bg: "from-[#7a1f17] to-[#c0392b]",
    emoji: "🔥",
  },
  {
    title: "Factory-direct prices, no middlemen",
    subtitle: "Source straight from 500+ verified Chinese manufacturers",
    cta: "Browse suppliers",
    href: "/suppliers",
    bg: "from-[#0f3d2e] to-[#1b7a52]",
    emoji: "🏭",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, [paused]);

  const go = (dir: number) =>
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);

  const s = SLIDES[index];

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`bg-gradient-to-r ${s.bg} transition-colors duration-500`}>
        <div className="container flex min-h-[180px] items-center justify-between gap-6 py-8 sm:min-h-[240px] sm:py-12">
          <div className="max-w-2xl text-white">
            <h1 className="text-2xl font-bold leading-tight sm:text-4xl">
              {s.title}
            </h1>
            <p className="mt-2 text-sm text-white/80 sm:text-base">{s.subtitle}</p>
            <Link
              href={s.href}
              className="mt-5 inline-flex rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-amber-500"
            >
              {s.cta}
            </Link>
          </div>
          <span className="hidden text-7xl sm:block lg:text-8xl" aria-hidden>
            {s.emoji}
          </span>
        </div>
      </div>

      {/* arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy shadow hover:bg-white"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy shadow hover:bg-white"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
