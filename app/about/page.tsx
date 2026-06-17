import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Target, Eye, Heart, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Import China is Bangladesh's leading B2B wholesale sourcing platform, connecting local businesses with verified suppliers in China.",
};

const team = [
  { name: "Abdullah Al Mamun", role: "Founder & CEO", seed: "ceo" },
  { name: "Farzana Haque", role: "Head of Sourcing", seed: "sourcing" },
  { name: "Li Wei", role: "China Operations Lead", seed: "china" },
  { name: "Sabbir Ahmed", role: "Logistics Manager", seed: "logistics" },
];

const values = [
  {
    icon: Heart,
    title: "Trust First",
    desc: "Every supplier is verified and every order is backed by quality checks.",
  },
  {
    icon: Globe2,
    title: "Borderless Trade",
    desc: "We make global sourcing as easy as shopping locally.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="gradient-brand py-14 text-white">
        <div className="container text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            About Import China
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/80">
            Empowering Bangladeshi businesses to source smarter, faster and
            cheaper — directly from China.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-sm">
            <Image
              src="https://picsum.photos/seed/aboutstory/800/600"
              alt="Import China team and warehouse"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Our Story</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <p>
                Import China was founded in 2020 with a simple mission: make it
                effortless for Bangladeshi entrepreneurs and businesses to source
                quality products directly from Chinese factories.
              </p>
              <p>
                Frustrated by middlemen, hidden costs and unreliable shipping,
                our founders built a platform that brings transparency, verified
                suppliers and end-to-end logistics under one roof.
              </p>
              <p>
                Today we serve 50,000+ buyers across Bangladesh, working with
                500+ verified suppliers and shipping thousands of orders every
                month — all with transparent BDT pricing.
              </p>
            </div>
            <Button className="mt-6" asChild>
              <Link href="/products">Explore Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-accent/40 py-14">
        <div className="container grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
              <Target className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-xl font-bold">Our Mission</h3>
            <p className="mt-2 text-muted-foreground">
              To democratize global trade for Bangladesh — giving every business,
              big or small, direct access to factory-priced wholesale products
              with zero hassle.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-neutral-900">
              <Eye className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-xl font-bold">Our Vision</h3>
            <p className="mt-2 text-muted-foreground">
              To become South Asia&apos;s most trusted cross-border sourcing
              platform, powering the next generation of resellers, retailers and
              manufacturers.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="flex gap-4 rounded-2xl border bg-card p-6 shadow-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-brand">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-bold">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Team */}
      <section className="bg-accent/40 py-14">
        <div className="container">
          <SectionHeading
            title="Meet the Team"
            subtitle="The people behind your sourcing success"
            center
          />
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.name} className="text-center">
                <div className="relative mx-auto aspect-square w-full max-w-[180px] overflow-hidden rounded-2xl border shadow-sm">
                  <Image
                    src={`https://picsum.photos/seed/${m.seed}/300/300`}
                    alt={m.name}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-3 font-bold">{m.name}</h3>
                <p className="text-sm text-brand">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
