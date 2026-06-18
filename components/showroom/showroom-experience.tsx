"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  X,
  Volume2,
  VolumeX,
  Users,
  Loader2,
  ShoppingCart,
  ArrowRight,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { formatBDT } from "@/lib/utils";
import type { Product } from "@/data/products";

const ShowroomScene = dynamic(
  () => import("@/components/showroom/showroom-scene"),
  { ssr: false, loading: () => null }
);

interface Room {
  id: string;
  name: string;
  emoji: string;
  accent: string;
  query?: string;
  category?: string;
}

const ROOMS: Room[] = [
  { id: "electronics", name: "Electronics", emoji: "📱", accent: "#1a2f5e", query: "smartphone laptop electronics" },
  { id: "furniture", name: "Furniture", emoji: "🛋️", accent: "#6b4a2b", category: "furniture" },
  { id: "fashion", name: "Fashion", emoji: "👗", accent: "#c0392b", query: "shirt dress fashion tops" },
  { id: "gadgets", name: "Gadgets", emoji: "🎧", accent: "#1f5e3a", category: "mobile-accessories" },
];

export function ShowroomExperience() {
  const { addItem } = useCart();
  const [roomId, setRoomId] = React.useState("electronics");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [music, setMusic] = React.useState(false);
  const [people, setPeople] = React.useState(0);
  const mountWrapRef = React.useRef<HTMLDivElement>(null);

  const room = ROOMS.find((r) => r.id === roomId)!;

  // simulated live shopper count, refreshed per room
  React.useEffect(() => {
    setPeople(6 + Math.floor(Math.random() * 15));
    const id = setInterval(() => {
      setPeople((p) => Math.max(3, p + (Math.random() > 0.5 ? 1 : -1)));
    }, 5000);
    return () => clearInterval(id);
  }, [roomId]);

  // load products for the room
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setSelectedId(null);
    const qs = room.category
      ? `category=${room.category}`
      : `q=${encodeURIComponent(room.query ?? "")}`;
    fetch(`/api/products?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const list: Product[] = Array.isArray(d.products) ? d.products : [];
        setProducts(list.slice(0, 8));
      })
      .catch(() => active && setProducts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [room]);

  function toggleMusic() {
    const audio = (mountWrapRef.current?.querySelector("[data-scene]") as
      | (HTMLElement & { __audio?: { start: () => void; stop: () => void } })
      | null)?.__audio;
    // the scene attaches __audio to its mount div; find it
    const sceneEl = mountWrapRef.current?.firstElementChild as
      | (HTMLElement & { __audio?: { start: () => void; stop: () => void } })
      | null;
    const ctrl = audio ?? sceneEl?.__audio;
    if (!ctrl) return;
    if (music) {
      ctrl.stop();
      setMusic(false);
    } else {
      ctrl.start();
      setMusic(true);
    }
  }

  const selected = products.find((p) => p.id === selectedId);

  return (
    <div className="fixed inset-0 z-[60] bg-[#0a0f1e] text-white">
      {/* 3D scene */}
      <div ref={mountWrapRef} className="absolute inset-0">
        {!loading && products.length > 0 && (
          <ShowroomScene
            key={roomId}
            products={products}
            accent={room.accent}
            onSelect={setSelectedId}
          />
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#0a0f1e]">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-sm text-white/70">Entering the {room.name} room…</p>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent p-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20"
        >
          <X className="h-4 w-4" /> Exit
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1.5 text-xs font-semibold text-green-300 backdrop-blur">
            <Users className="h-3.5 w-3.5" /> {people} people in {room.name} now
          </span>
          <button
            onClick={toggleMusic}
            aria-label="Toggle ambient music"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20"
          >
            {music ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Room selector */}
      <div className="no-scrollbar absolute left-1/2 top-16 z-20 flex max-w-[92vw] -translate-x-1/2 gap-2 overflow-x-auto">
        {ROOMS.map((r) => (
          <button
            key={r.id}
            onClick={() => setRoomId(r.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur transition-colors ${
              r.id === roomId ? "bg-gold text-black" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {r.emoji} {r.name} Room
          </button>
        ))}
      </div>

      {/* Controls hint */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-20 hidden rounded-lg bg-black/40 px-3 py-2 text-[11px] text-white/70 backdrop-blur sm:block">
        <p className="flex items-center gap-1.5 font-semibold text-white/90">
          <Gamepad2 className="h-3.5 w-3.5" /> Controls
        </p>
        <p>Click to look · WASD/arrows to move · click a product</p>
      </div>

      {/* Product detail panel */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 z-30 mx-auto max-w-md rounded-t-2xl border border-white/10 bg-[#12182a]/95 p-4 shadow-2xl backdrop-blur sm:bottom-6 sm:left-6 sm:right-auto sm:rounded-2xl">
          <button
            onClick={() => setSelectedId(null)}
            aria-label="Close"
            className="absolute right-2 top-2 rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white/10">
              <Image src={selected.images[0]} alt={selected.name} fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold">{selected.name}</p>
              <p className="mt-0.5 text-lg font-extrabold text-gold">{formatBDT(selected.priceMin)}</p>
              <p className="text-[11px] text-white/60">MOQ: {selected.moq} pcs</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="gold" className="flex-1" onClick={() => addItem(selected)}>
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </Button>
            <Button asChild className="flex-1">
              <Link href={`/products/${selected.id}`}>
                View <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
