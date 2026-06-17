"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ShoppingCart,
  User,
  Phone,
  Boxes,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { SearchBar } from "@/components/search-bar";
import { useCart } from "@/components/cart-provider";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="gradient-brand text-white">
        <div className="container flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-2">
            <span>🚢 Free shipping on orders over ৳50,000</span>
          </p>
          <a
            href="tel:01700000000"
            className="flex items-center gap-1 font-medium hover:text-gold"
          >
            <Phone className="h-3.5 w-3.5" /> Call: 01700-000000
          </a>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="gradient-brand flex h-10 w-10 items-center justify-center rounded-lg shadow-md ring-2 ring-gold">
              <Boxes className="h-6 w-6 text-gold" />
            </div>
            <div className="leading-none">
              <span className="block text-lg font-extrabold tracking-tight text-brand">
                Import<span className="text-gold-600">China</span>
              </span>
              <span className="hidden text-[10px] font-medium text-muted-foreground sm:block">
                B2B Wholesale Sourcing
              </span>
            </div>
          </Link>

          {/* Search (desktop) */}
          <div className="hidden flex-1 lg:block">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 lg:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              asChild
            >
              <Link href="/auth">
                <User className="h-4 w-4" /> Login
              </Link>
            </Button>
            <Button
              size="sm"
              className="hidden sm:inline-flex"
              asChild
            >
              <Link href="/auth?tab=register">Register</Link>
            </Button>

            <button
              onClick={() => setOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Search (mobile) */}
        <div className="container pb-3 lg:hidden">
          <SearchBar />
        </div>

        {/* Nav links (desktop) */}
        <nav className="hidden border-t lg:block">
          <div className="container flex h-11 items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-brand",
                  pathname === link.href
                    ? "text-brand"
                    : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <Sheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        side="left"
        title="Menu"
      >
        <nav className="flex flex-col p-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
            >
              {link.label}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
          <div className="my-2 border-t" />
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Categories
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
          <div className="flex gap-2 p-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/auth" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            </Button>
            <Button className="flex-1" asChild>
              <Link
                href="/auth?tab=register"
                onClick={() => setMobileOpen(false)}
              >
                Register
              </Link>
            </Button>
          </div>
        </nav>
      </Sheet>
    </header>
  );
}
