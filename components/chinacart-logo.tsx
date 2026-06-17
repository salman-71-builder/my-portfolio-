"use client";

import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ChinaCart wordmark with CSS 3D effects.
 * - CHINA: #1a2f5e (navy)  ·  CART + cart icon: #c0392b (orange-red)
 * - black plate behind the logo
 *
 * variant="nav"  → crisp, subtle (hover tilt + shine), stays clean in the navbar
 * variant="hero" → full show: load rotate, float, cart bounce+spin, shine sweep
 *
 * All effects are GPU-composited CSS transforms and honour prefers-reduced-motion.
 */
export function ChinaCartLogo({
  variant = "nav",
  className,
}: {
  variant?: "nav" | "hero";
  className?: string;
}) {
  return (
    <span
      className={cn("cc-scene", variant === "hero" ? "cc-hero" : "cc-nav", className)}
    >
      <span className="cc-inner">
        <span className="cc-word cc-navy">CHINA</span>
        <span className="cc-cart-bounce" aria-hidden>
          <span className="cc-cart-spin">
            <ShoppingCart className="cc-cart-icon" strokeWidth={2.5} />
          </span>
        </span>
        <span className="cc-word cc-red">CART</span>
        <span className="cc-shine" aria-hidden />
      </span>
      <span className="sr-only">ChinaCart</span>
    </span>
  );
}
