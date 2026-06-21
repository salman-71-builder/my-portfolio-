"use client";

import Link from "next/link";
import { Facebook, Youtube, MessageCircle, MapPin, Mail, Phone } from "lucide-react";
import { useCategories } from "@/components/use-categories";
import { useLang } from "@/components/language-provider";
import { BrandLogo } from "@/components/branding-provider";

const paymentMethods = ["bKash", "Nagad", "Visa", "Mastercard", "Bank"];

const columns = [
  {
    title: "Get to Know Us",
    links: [
      { href: "/about", label: "About ChinaCart" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/suppliers", label: "Suppliers" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/products?sort=popular", label: "Best Sellers" },
      { href: "/products?sort=newest", label: "New Arrivals" },
      { href: "/wishlist", label: "Your Wishlist" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { href: "/how-it-works", label: "Track Your Order" },
      { href: "/how-it-works", label: "Shipping Policy" },
      { href: "/how-it-works", label: "Returns & Refunds" },
      { href: "/how-it-works", label: "FAQ" },
    ],
  },
];

export function Footer() {
  const categories = useCategories();
  const { t } = useLang();

  return (
    <footer className="mt-12">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full bg-[#22407a] py-3 text-center text-sm font-medium text-white hover:bg-[#2a4d92]"
      >
        {t("back_to_top")} ↑
      </button>

      {/* Link columns */}
      <div className="bg-navy text-white">
        <div className="container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-bold">{col.title}</h4>
              <ul className="space-y-2 text-sm text-white/75">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-3 text-sm font-bold">Top Categories</h4>
            <ul className="space-y-2 text-sm text-white/75">
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="hover:text-white hover:underline"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-5">
            <div className="flex flex-col gap-4 border-t border-white/15 pt-6 text-sm text-white/75 md:flex-row md:items-start md:justify-between">
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> House 12, Road 7,
                  Gulshan-1, Dhaka 1212
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a href="tel:01700000000" className="hover:text-white">01700-000000</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href="mailto:info@importchina.com.bd" className="hover:text-white">
                    info@importchina.com.bd
                  </a>
                </li>
              </ul>
              <div className="flex gap-2">
                {[Facebook, Youtube, MessageCircle].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="bg-[#0f1d3d] text-white/70">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs md:flex-row">
          <p className="flex items-center gap-2">
            <BrandLogo
              slot="footerLogo"
              imgClassName="h-6 w-auto max-w-[120px] object-contain"
              fallback={
                <span>
                  China<span className="font-bold text-amber-400">Cart</span>
                </span>
              }
            />
            <span>· © 2025 — Bangladesh&apos;s #1 Chinese wholesale platform</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {paymentMethods.map((m) => (
              <span
                key={m}
                className="rounded bg-white px-2 py-0.5 text-[11px] font-bold text-neutral-900"
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
