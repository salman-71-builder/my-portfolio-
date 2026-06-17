import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, MapPin, Store, TrendingUp, Users, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { SectionHeading } from "@/components/section-heading";
import { suppliers } from "@/data/suppliers";

export const metadata: Metadata = {
  title: "Verified Suppliers",
  description:
    "Browse Import China's 500+ verified suppliers from China's top manufacturing hubs.",
};

const benefits = [
  {
    icon: Users,
    title: "Reach 50,000+ Buyers",
    desc: "Get instant access to Bangladesh's largest wholesale buyer base.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Sales",
    desc: "List unlimited products and scale orders with zero upfront cost.",
  },
  {
    icon: Globe2,
    title: "We Handle Logistics",
    desc: "Focus on production — we manage shipping, customs and delivery.",
  },
];

export default function SuppliersPage() {
  return (
    <>
      <section className="gradient-brand py-14 text-white">
        <div className="container text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Verified Suppliers
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/80">
            Source from 500+ quality-audited manufacturers across China&apos;s
            leading production hubs.
          </p>
        </div>
      </section>

      {/* Supplier grid */}
      <section className="container py-14">
        <SectionHeading
          title="Featured Suppliers"
          subtitle="Trusted partners with proven track records"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={s.logo}
                  alt={s.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold leading-tight">{s.name}</h3>
                    {s.verified && (
                      <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" />
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {s.location}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <StarRating rating={s.rating} reviews={s.reviews} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-center text-xs">
                <div>
                  <p className="font-bold text-brand">{s.yearsActive} yrs</p>
                  <p className="text-muted-foreground">Active</p>
                </div>
                <div>
                  <p className="font-bold text-brand">{s.responseRate}</p>
                  <p className="text-muted-foreground">Response</p>
                </div>
                <div>
                  <Badge variant="success" className="text-[10px]">
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Become a supplier */}
      <section className="bg-accent/40 py-14">
        <div className="container">
          <SectionHeading
            title="Become a Supplier"
            subtitle="Join the platform and grow your export business"
            center
          />
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="rounded-2xl border bg-card p-6 text-center shadow-sm"
                >
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-bold">{b.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Button size="lg" variant="gold" asChild>
              <Link href="/auth?tab=register">
                <Store className="h-4 w-4" /> Apply to Become a Supplier
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
