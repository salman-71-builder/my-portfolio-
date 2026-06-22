"use client";

import * as React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Subtle scroll parallax: the wrapped content drifts vertically as the element
 * passes through the viewport, creating depth. The inner layer is scaled up so
 * the translate never reveals edges. Reduced-motion → static. GPU-only (y).
 */
export function ParallaxImage({
  children,
  className,
  amount = 14,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={{ y, willChange: "transform" }}
        className="absolute inset-0 scale-[1.12]"
      >
        {children}
      </motion.div>
    </div>
  );
}
