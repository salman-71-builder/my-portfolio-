import type { Metadata } from "next";
import Link from "next/link";
import { Target, Eye, Heart, Users } from "lucide-react";

import { StatsBar } from "@/components/stats-bar";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Import China — Bangladesh's #1 B2B wholesale sourcing platform connecting buyers with verified China suppliers.",
};

const team = [
  { name: "Salman Rahman", role: "Founder & CEO", img: "https://i.pravatar.cc/200?img=15" },
  { name: "Ayesha Siddiqua", role: "Head of Operations", img: "https://i.pravatar.cc/200?img=47" },
  { name: "Imran Hossain", role: "Sourcing Director (Shenzhen)", img: "https://i.pravatar.cc/200?img=51" },
  { name: "Farzana Akter", role: "Customer Success Lead", img: "https://i.pravatar.cc/200?img=32" },
];

export default function AboutPage() {
  return (
    <div className="pb-10">
      <section className="bg-gradient-to-br from-brand-dark to-primary py-16 text-center text-white">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Connecting Bangladesh to China&apos;s Factories
          </h1>
          <p className="mt-4 text-gray-200">
            Import China was founded with one mission: to make wholesale sourcing
            from China simple, affordable, and transparent for every Bangladeshi
            business — from small shops to large enterprises.
          </p>
        </div>
      </section>

      <StatsBar />

      {/* Story */}
      <section className="container grid items-center gap-10 py-14 lg:grid-cols-2">
        <div>
          <SectionHeading title="Our Story" />
          <div className="space-y-4 text-muted-foreground">
            <p>
              Started in 2020, Import China began when our founders — frustrated
              by the high costs and middlemen in traditional importing — decided
              to build a direct bridge between Bangladeshi buyers and Chinese
              manufacturers.
            </p>
            <p>
              Today, we work with 500+ verified suppliers across Shenzhen,
              Guangzhou, Yiwu and beyond, helping over 50,000 businesses source
              quality products at factory-direct prices.
            </p>
            <p>
              With our own sourcing team on the ground in China and a logistics
              network optimized for the China-Bangladesh corridor, we handle
              everything — so you can focus on growing your business.
            </p>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&q=80"
          alt="Our team sourcing products"
          className="h-80 w-full rounded-2xl object-cover shadow-lg"
        />
      </section>

      {/* Mission/Vision/Values */}
      <section className="bg-muted/30 py-14">
        <div className="container grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Our Mission",
              desc: "To empower Bangladeshi businesses with affordable, direct access to China's wholesale market.",
            },
            {
              icon: Eye,
              title: "Our Vision",
              desc: "To become the most trusted cross-border sourcing platform in South Asia.",
            },
            {
              icon: Heart,
              title: "Our Values",
              desc: "Transparency, reliability, and a relentless focus on customer success.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border bg-card p-6 text-center shadow-sm"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <v.icon className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="container py-14">
        <SectionHeading
          title="Meet Our Team"
          subtitle="The people making global sourcing local"
          center
        />
        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {team.map((m) => (
            <div key={m.name} className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.img}
                alt={m.name}
                className="mx-auto h-28 w-28 rounded-full border-4 border-brand-gold/30 object-cover shadow"
              />
              <h3 className="mt-3 font-bold">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary to-red-700 p-8 text-center text-white sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <Users className="hidden h-10 w-10 sm:block" />
            <div>
              <h3 className="text-2xl font-extrabold">Join 50,000+ buyers</h3>
              <p className="text-white/90">
                Start sourcing smarter with Import China today.
              </p>
            </div>
          </div>
          <Button size="lg" variant="gold" className="shrink-0" asChild>
            <Link href="/auth?tab=register">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
