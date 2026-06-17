"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ImageGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = React.useState(0);
  const [zoom, setZoom] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 50, y: 50 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border bg-muted"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
      >
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className={cn(
            "object-cover transition-transform duration-200",
            zoom && "scale-[1.8]"
          )}
          style={
            zoom
              ? { transformOrigin: `${pos.x}% ${pos.y}%` }
              : undefined
          }
        />
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white">
          Hover to zoom
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-colors",
              active === i ? "border-brand" : "border-transparent hover:border-brand/40"
            )}
          >
            <Image
              src={img}
              alt={`${alt} view ${i + 1}`}
              fill
              sizes="120px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
