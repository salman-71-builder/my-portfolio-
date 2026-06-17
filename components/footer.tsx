import Link from "next/link";
import { Facebook, Youtube, MessageCircle, MapPin, Mail, Phone } from "lucide-react";

import { Logo } from "@/components/logo";
import { categories } from "@/data/categories";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Products" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/auth?tab=register", label: "Become a Supplier" },
];

const customerService = [
  { href: "/how-it-works", label: "Shipping & Delivery" },
  { href: "/how-it-works", label: "Returns & Refunds" },
  { href: "/contact", label: "Track Your Order" },
  { href: "/contact", label: "Help Center" },
  { href: "/how-it-works", label: "FAQ" },
];

const payments = ["bKash", "Nagad", "Visa", "Mastercard", "Bank"];

export function Footer() {
  return (
    <footer className="mt-12 border-t bg-brand-dark text-gray-300">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="[&_*]:text-white">
              <Logo />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Bangladesh&apos;s #1 B2B wholesale sourcing platform. Source
              directly from verified China suppliers and save up to 60%.
            </p>
            <div className="mt-4 flex gap-2">
              <SocialIcon href="#" label="Facebook">
                <Facebook className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="#" label="YouTube">
                <Youtube className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="#" label="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>

          <FooterColumn title="Quick Links" links={quickLinks} />

          <div>
            <h3 className="mb-4 font-bold text-white">Categories</h3>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="text-gray-400 transition-colors hover:text-brand-gold"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title="Customer Service" links={customerService} />

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-bold text-white">Contact Info</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand-gold" />
                House 12, Road 5, Banani, Dhaka 1213, Bangladesh
              </li>
              <li className="flex gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-gold" />
                <a href="tel:01700000000" className="hover:text-brand-gold">
                  01700-000000
                </a>
              </li>
              <li className="flex gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand-gold" />
                <a
                  href="mailto:info@importchina.com.bd"
                  className="hover:text-brand-gold"
                >
                  info@importchina.com.bd
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payments */}
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
          <span className="text-sm text-gray-400">We accept:</span>
          {payments.map((p) => (
            <span
              key={p}
              className="rounded bg-white/10 px-3 py-1 text-xs font-semibold text-white"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © 2025 Import China. All rights reserved. ·{" "}
        <span className="text-gray-400">importchina.com.bd</span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 font-bold text-white">{title}</h3>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-gray-400 transition-colors hover:text-brand-gold"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary"
    >
      {children}
    </a>
  );
}
