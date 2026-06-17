import Link from "next/link";
import { Store } from "lucide-react";

import { suppliers } from "@/data/suppliers";
import { Button } from "@/components/ui/button";

export function SuppliersShowcase() {
  // Duplicate for a seamless marquee.
  const logos = [...suppliers, ...suppliers];

  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="container">
        <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
          Trusted by 500+ Verified Suppliers
        </h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Partnering with top manufacturers across China
        </p>

        <div className="relative mt-8 overflow-hidden">
          <div className="flex w-max animate-marquee gap-6">
            {logos.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${s.id}-${i}`}
                src={s.logo}
                alt={s.name}
                className="h-14 w-auto rounded-md border bg-white object-contain p-2 shadow-sm"
              />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" variant="gold" asChild>
            <Link href="/auth?tab=register">
              <Store className="h-5 w-5" />
              Become a Supplier
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
