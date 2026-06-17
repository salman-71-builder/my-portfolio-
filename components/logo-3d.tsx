"use client";

import { Boxes } from "lucide-react";

const faces = ["front", "back", "right", "left", "top", "bottom"] as const;

/** Continuously rotating 3D cube logo (pure CSS 3D — cheap, GPU-composited). */
export function Logo3D() {
  return (
    <div className="logo3d-scene h-10 w-10 shrink-0">
      <div className="logo3d-cube">
        {faces.map((f) => (
          <span key={f} className={`logo3d-face logo3d-${f}`}>
            <Boxes className="h-5 w-5 text-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}
