"use client";

import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { suppliers } from "@/data/suppliers";

export function SuppliersShowcase() {
  // duplicate for seamless marquee
  const logos = [...suppliers, ...suppliers];

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Trusted by 500+ Verified Suppliers
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sourcing directly from China&apos;s top manufacturing hubs
          </p>
        </div>

        <div className="no-scrollbar relative w-full overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-4">
            {logos.map((s, i) => (
              <div
                key={`${s.id}-${i}`}
                className="glass flex w-44 shrink-0 items-center gap-3 rounded-xl px-4 py-3"
              >
                <Image
                  src={s.logo}
                  alt={s.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div className="text-left">
                  <p className="line-clamp-1 text-xs font-bold">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {s.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button variant="gold" size="lg" asChild>
          <Link href="/auth?tab=register">
            <Store className="h-4 w-4" /> Become a Supplier
          </Link>
        </Button>
      </div>
    </div>
  );
}
