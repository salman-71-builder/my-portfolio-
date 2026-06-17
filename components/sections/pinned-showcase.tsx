"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, Ship, Truck } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const panels = [
  {
    step: "01",
    label: "Discover",
    title: "10,000+ factory-direct products",
    desc: "Browse verified Chinese suppliers across every category, with transparent wholesale pricing in BDT.",
    Icon: Search,
  },
  {
    step: "02",
    label: "Source",
    title: "We negotiate, inspect & consolidate",
    desc: "Our team handles supplier coordination, quality checks and consolidated freight — so you don't have to.",
    Icon: Ship,
  },
  {
    step: "03",
    label: "Deliver",
    title: "To your door in 5–15 days",
    desc: "Customs cleared and delivered anywhere in Bangladesh, with tracking at every step of the journey.",
    Icon: Truck,
  },
];

export function PinnedShowcase() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const panelRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  React.useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const ctx = gsap.context(() => {
      const items = panelRefs.current.filter(Boolean) as HTMLDivElement[];
      // initial state: only first panel visible
      gsap.set(items, { autoAlpha: 0, yPercent: 12 });
      gsap.set(items[0], { autoAlpha: 1, yPercent: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => "+=" + window.innerHeight * (items.length - 1),
          pin: stage,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      for (let i = 1; i < items.length; i++) {
        tl.to(items[i - 1], { autoAlpha: 0, yPercent: -12, duration: 0.4 }, ">");
        tl.fromTo(
          items[i],
          { autoAlpha: 0, yPercent: 12 },
          { autoAlpha: 1, yPercent: 0, duration: 0.4 },
          "<"
        );
      }
    }, container);

    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    // Static, accessible fallback
    return (
      <section className="bg-[#0a0604] py-16 text-white">
        <div className="container space-y-10">
          {panels.map((p) => (
            <div key={p.step} className="flex items-start gap-4">
              <p.Icon className="h-8 w-8 text-gold" />
              <div>
                <p className="text-sm font-semibold text-gold">
                  {p.step} — {p.label}
                </p>
                <h3 className="text-2xl font-extrabold">{p.title}</h3>
                <p className="mt-1 text-white/70">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-[#0a0604] text-white"
      style={{ height: `${panels.length * 100}vh` }}
    >
      <div
        ref={stageRef}
        className="flex h-screen items-center justify-center overflow-hidden"
      >
        {/* glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,215,0,0.12), transparent 60%)",
          }}
        />
        {/* rotating ring accent */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 animate-[spin_28s_linear_infinite] rounded-full border border-gold/20" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[42vmin] w-[42vmin] -translate-x-1/2 -translate-y-1/2 animate-[spin_20s_linear_infinite_reverse] rounded-full border border-brand/30" />

        <div className="relative grid place-items-center">
          {panels.map((p, i) => (
            <div
              key={p.step}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className="col-start-1 row-start-1 max-w-2xl px-6 text-center"
            >
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-brand text-black shadow-lg">
                <p.Icon className="h-8 w-8" />
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">
                {p.step} — {p.label}
              </p>
              <h3
                className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl"
                style={{ textShadow: "0 2px 24px rgba(255,215,0,0.25)" }}
              >
                {p.title}
              </h3>
              <p className="mx-auto mt-4 max-w-lg text-base text-white/70 sm:text-lg">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
