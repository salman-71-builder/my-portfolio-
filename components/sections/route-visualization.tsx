"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { MapPin, Plane } from "lucide-react";

const RouteScene = dynamic(() => import("@/components/three/route-scene"), {
  ssr: false,
  loading: () => null,
});

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function RouteVisualization() {
  const reduce = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return;
    const ctx = gsap.context(() => {
      gsap.from(".route-reveal", {
        opacity: 0,
        y: 40,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 75%" },
      });
    }, root);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-navy"
      aria-label="Direct sourcing route from China to Bangladesh"
    >
      <div className="container relative z-10 pt-14 text-center">
        <span className="route-reveal inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
          <Plane className="h-3.5 w-3.5" /> China&nbsp;→&nbsp;Bangladesh
        </span>
        <h2 className="route-reveal mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Direct Sourcing From China
        </h2>
        <p className="route-reveal mx-auto mt-3 max-w-2xl text-base text-white/70 sm:text-lg">
          We source products directly from Chinese manufacturers and deliver to
          Bangladesh.
        </p>
      </div>

      {/* 3D scene stage */}
      <div className="relative mt-2 h-[440px] w-full sm:h-[520px] lg:h-[600px]">
        <RouteScene reduced={!!reduce} />

        {/* distance / flight time badge */}
        <div className="route-reveal pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> 3,500 km • 5 hours flight
          </span>
        </div>
      </div>

      {/* stats */}
      <div className="container relative z-10 pb-16">
        <div className="route-reveal mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-sm font-semibold text-white/90 sm:text-base">
          <span>500+ Suppliers</span>
          <span className="text-white/30">•</span>
          <span>10,000+ Products</span>
          <span className="text-white/30">•</span>
          <span>Fast Delivery</span>
        </div>
      </div>
    </section>
  );
}
