"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ChinaCartLogo } from "@/components/chinacart-logo";

/** Large animated hero logo that scales/fades down smoothly as the user scrolls. */
export function HeroLogo() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 420], [1, 0.7]);
  const opacity = useTransform(scrollY, [0, 380], [1, 0]);
  const y = useTransform(scrollY, [0, 420], [0, -28]);

  if (reduce) {
    return <ChinaCartLogo variant="hero" />;
  }

  return (
    <motion.div
      style={{ scale, opacity, y, transformOrigin: "left center" }}
      className="inline-block"
    >
      <ChinaCartLogo variant="hero" />
    </motion.div>
  );
}
