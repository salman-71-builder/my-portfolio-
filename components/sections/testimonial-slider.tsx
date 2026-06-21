"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { testimonials } from "@/data/testimonials";

export function TestimonialSlider() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % testimonials.length),
      5000
    );
    return () => clearInterval(id);
  }, [paused]);

  const go = (dir: number) =>
    setIndex(
      (i) => (i + dir + testimonials.length) % testimonials.length
    );

  const t = testimonials[index];

  return (
    <div
      className="relative mx-auto max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm sm:p-10">
        <Quote className="absolute right-6 top-6 h-16 w-16 text-accent" />
        <AnimatePresence mode="wait">
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            className="relative"
          >
            <StarRating rating={t.rating} size="md" showCount={false} />
            <p className="mt-4 text-lg font-medium leading-relaxed text-foreground">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Image
                src={t.avatar}
                alt={t.name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-gold"
              />
              <div>
                <p className="font-bold">{t.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t.role}, {t.company}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => go(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground shadow-sm hover:bg-brand hover:text-white"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-brand" : "w-2.5 bg-muted"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground shadow-sm hover:bg-brand hover:text-white"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
