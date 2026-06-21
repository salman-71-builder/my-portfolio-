"use client";

import * as React from "react";
import Link from "next/link";
import {
  Menu,
  ShoppingCart,
  MapPin,
  ChevronRight,
  Heart,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { SearchBar } from "@/components/search-bar";
import { BrandLogo } from "@/components/branding-provider";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { useCategories } from "@/components/use-categories";
import { useLang } from "@/components/language-provider";

const quickLinks = (t: (k: string) => string) => [
  { href: "/products", label: t("todays_deals") },
  { href: "/products?category=electronics", label: t("electronics") },
  { href: "/products?category=fashion-clothing", label: t("fashion") },
  { href: "/products?category=home-kitchen", label: t("home_kitchen") },
  { href: "/products?sort=popular", label: t("best_sellers") },
  { href: "/products?sort=newest", label: t("new_arrivals") },
];

export function Navbar() {
  const { totalItems, setOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const categories = useCategories();
  const { lang, setLang, t } = useLang();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main navy bar */}
      <div className="bg-navy text-white">
        <div className="container flex items-center gap-2 py-2 sm:gap-4">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded p-1.5 hover:bg-white/10 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link
            href="/"
            aria-label="ChinaCart home"
            className="shrink-0 rounded px-1 py-1 hover:outline hover:outline-1 hover:outline-white/40"
          >
            <BrandLogo
              slot="mainLogo"
              imgClassName="h-9 w-auto max-w-[160px] object-contain"
              fallback={
                <span className="text-xl font-extrabold tracking-tight">
                  China<span className="text-amber-400">Cart</span>
                </span>
              }
            />
          </Link>

          {/* Deliver to (desktop) */}
          <Link
            href="/products"
            className="hidden items-center gap-1 rounded px-1 py-1 text-xs hover:outline hover:outline-1 hover:outline-white/40 xl:flex"
          >
            <MapPin className="h-4 w-4" />
            <span className="leading-tight">
              <span className="block text-white/70">{t("deliver_to_bd")}</span>
              <span className="font-bold">Dhaka 1212</span>
            </span>
          </Link>

          {/* Big search */}
          <div className="flex-1">
            <SearchBar />
          </div>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="hidden items-center gap-1 rounded border border-white/30 px-2 py-1 text-xs font-semibold hover:bg-white/10 sm:flex"
            aria-label="Toggle language"
          >
            {lang === "en" ? "🇧🇩 বাংলা" : "🇬🇧 EN"}
          </button>

          {/* Account */}
          <Link
            href="/auth"
            className="hidden rounded px-1 py-1 text-xs leading-tight hover:outline hover:outline-1 hover:outline-white/40 lg:block"
          >
            <span className="block text-white/80">{t("hello_signin")}</span>
            <span className="font-bold">{t("account_lists")}</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label={t("wishlist")}
            className="relative hidden rounded p-1.5 hover:outline hover:outline-1 hover:outline-white/40 sm:block"
          >
            <Heart className="h-6 w-6" />
            {wishCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-navy">
                {wishCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button
            onClick={() => setOpen(true)}
            className="relative flex items-center gap-1 rounded px-1 py-1 hover:outline hover:outline-1 hover:outline-white/40"
            aria-label={t("cart")}
          >
            <span className="relative">
              <ShoppingCart className="h-7 w-7" />
              <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-navy">
                {totalItems}
              </span>
            </span>
            <span className="hidden font-bold sm:inline">{t("cart")}</span>
          </button>
        </div>
      </div>

      {/* Secondary nav strip */}
      <div className="bg-[#22407a] text-white">
        <div className="container flex h-10 items-center gap-1 overflow-x-auto text-sm no-scrollbar">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex shrink-0 items-center gap-1 rounded px-2 py-1 font-semibold hover:outline hover:outline-1 hover:outline-white/40"
          >
            <Menu className="h-4 w-4" /> {t("all")}
          </button>
          {quickLinks(t).map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="shrink-0 whitespace-nowrap rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white/40"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu / all categories */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="left" title="Menu">
        <nav className="flex flex-col p-2">
          <Link href="/auth" onClick={() => setMobileOpen(false)} className="rounded-lg bg-navy px-3 py-3 text-sm font-semibold text-white">
            {t("hello_signin")} →
          </Link>
          <div className="my-2 border-t" />
          {quickLinks(t).map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
            >
              {l.label}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
          <div className="my-2 border-t" />
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("all_categories")}
          </p>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
            >
              {c.name}
            </Link>
          ))}
          <div className="my-2 border-t" />
          <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted">
            <Heart className="h-4 w-4" /> {t("wishlist")} {wishCount > 0 && `(${wishCount})`}
          </Link>
          <button
            onClick={() => {
              setLang(lang === "en" ? "bn" : "en");
            }}
            className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted"
          >
            🌐 {lang === "en" ? "বাংলা" : "English"}
          </button>
        </nav>
      </Sheet>
    </header>
  );
}
