"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

import { testimonials } from "@/data/testimonials";
import { Button } from "@/components/ui/button";

export function TestimonialSlider() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const next = React.useCallback(
    () => setIndex((i) => (i + 1) % testimonials.length),
    []
  );
  const prev = () =>
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  const t = testimonials[index];

  return (
    <div
      className="relative mx-auto max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border bg-card p-8 text-center shadow-sm"
        >
          <Quote className="mx-auto h-10 w-10 text-brand-gold/40" />
          <div className="mt-3 flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  i < t.rating
                    ? "h-5 w-5 fill-brand-gold text-brand-gold"
                    : "h-5 w-5 text-muted"
                }
              />
            ))}
          </div>
          <p className="mt-4 text-lg leading-relaxed text-foreground/90">
            &ldquo;{t.comment}&rdquo;
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.avatar}
              alt={t.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="font-bold">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.role} · {t.location}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={prev}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={next}
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
