"use client";

import Link from "next/link";
import { Facebook, Youtube, MessageCircle, MapPin, Mail, Phone } from "lucide-react";
import { ChinaCartLogo } from "@/components/chinacart-logo";
import { useCategories } from "@/components/use-categories";

const paymentMethods = ["bKash", "Nagad", "Visa", "Mastercard", "Bank"];

export function Footer() {
  const categories = useCategories();
  return (
    <footer className="border-t bg-secondary text-muted-foreground">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" aria-label="ChinaCart home" className="inline-flex">
              <ChinaCartLogo variant="nav" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Bangladesh&apos;s #1 B2B wholesale sourcing platform. Source
              directly from verified factories in China and save up to 60%.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-brand hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-brand hover:text-white"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-green-600 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "All Products" },
                { href: "/how-it-works", label: "How It Works" },
                { href: "/suppliers", label: "Suppliers" },
                { href: "/about", label: "About Us" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
              Categories
            </h4>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="hover:text-primary"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
              Customer Service
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                "Track Your Order",
                "Shipping Policy",
                "Returns & Refunds",
                "Payment Methods",
                "FAQ",
              ].map((l) => (
                <li key={l}>
                  <Link href="/how-it-works" className="hover:text-primary">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
              Contact Info
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>House 12, Road 7, Gulshan-1, Dhaka 1212, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href="tel:01700000000" className="hover:text-primary">
                  01700-000000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:info@importchina.com.bd" className="hover:text-primary">
                  info@importchina.com.bd
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2025 ChinaCart. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {paymentMethods.map((m) => (
              <span
                key={m}
                className="rounded-md border bg-background px-2.5 py-1 text-[11px] font-bold text-foreground"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
