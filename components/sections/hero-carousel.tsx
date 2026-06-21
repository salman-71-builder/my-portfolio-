"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Magnetic } from "@/components/magnetic";
import { BANNER_GRADIENTS, type Banner } from "@/lib/banners";

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const slides = banners.length ? banners : [];
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (paused || slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;
  const go = (dir: number) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  function onMove(e: React.MouseEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 12,
      y: ((e.clientY - r.top) / r.height - 0.5) * 8,
    });
  }

  return (
    <div
      className="relative overflow-hidden bg-navy"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setTilt({ x: 0, y: 0 });
      }}
      onMouseMove={onMove}
    >
      <div className="relative h-[220px] sm:h-[300px] lg:h-[380px]">
        {slides.map((s, i) => {
          const active = i === index;
          const grad = BANNER_GRADIENTS[i % BANNER_GRADIENTS.length];
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {s.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.imageUrl}
                  alt={s.title ?? "banner"}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    transform: active
                      ? `scale(1.06) translate(${tilt.x}px, ${tilt.y}px)`
                      : "scale(1.06)",
                    transition: "transform 0.3s ease-out",
                  }}
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-r ${grad}`} />
              )}
              {/* readability scrim */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

              <div className="container relative flex h-full flex-col justify-center">
                <div
                  className="max-w-xl text-white"
                  style={{
                    transform: active ? `translateX(${tilt.x * 0.5}px)` : undefined,
                  }}
                >
                  {s.title && (
                    <h1 className="text-2xl font-bold leading-tight drop-shadow sm:text-4xl lg:text-5xl">
                      {s.title}
                    </h1>
                  )}
                  {s.subtitle && (
                    <p className="mt-2 text-sm text-white/90 drop-shadow sm:text-base">
                      {s.subtitle}
                    </p>
                  )}
                  {s.ctaText && s.ctaHref && (
                    <Magnetic className="mt-5 inline-block">
                      <Link
                        href={s.ctaHref}
                        className="inline-flex rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-navy shadow-lg transition-colors hover:bg-amber-500"
                      >
                        {s.ctaText}
                      </Link>
                    </Magnetic>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
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
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
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
        </>
      )}
    </div>
  );
}
