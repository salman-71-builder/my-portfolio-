"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  className?: string;
}

/** Lightweight dual-thumb range slider (no external deps). */
export function Slider({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  className,
}: SliderProps) {
  const [lo, hi] = value;
  const range = max - min || 1;
  const loPct = ((lo - min) / range) * 100;
  const hiPct = ((hi - min) / range) * 100;

  return (
    <div className={cn("relative h-6 w-full", className)}>
      <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-muted" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
        style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={lo}
        onChange={(e) => {
          const next = Math.min(Number(e.target.value), hi - step);
          onValueChange([next, hi]);
        }}
        className="pointer-events-none absolute h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
        aria-label="Minimum value"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={hi}
        onChange={(e) => {
          const next = Math.max(Number(e.target.value), lo + step);
          onValueChange([lo, next]);
        }}
        className="pointer-events-none absolute h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
        aria-label="Maximum value"
      />
    </div>
  );
}
