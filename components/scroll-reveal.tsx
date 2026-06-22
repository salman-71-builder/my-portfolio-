"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * Scroll-reveal wrapper: gentle fade + zoom (0.95→1) + rise as it enters view.
 * Animates once and stays (viewport.once). Reduced-motion → no transform.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 24,
  zoom = 0.96,
  as = "div",
  amount = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  zoom?: number;
  as?: "div" | "section";
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const MotionTag = as === "section" ? motion.section : motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, scale: zoom }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </MotionTag>
  );
}

/** Heading entrance — slides up with a touch of 3D depth. */
export function RevealHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, rotateX: -12 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 800, transformOrigin: "bottom" }}
    >
      {children}
    </motion.div>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.9, rotateX: -4 },
  show: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
};

/**
 * Staggered product grid: each card zooms in (0.9→1), rises and rotates flat as
 * it enters view, one after another. Animates once, stays visible.
 */
export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ staggerChildren: 0.08 }}
      style={{ transformPerspective: 1000 }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={cardVariants}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: "transform, opacity" }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
