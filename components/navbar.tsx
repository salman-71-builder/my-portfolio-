"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ShoppingCart,
  Phone,
  Ship,
  User,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { SearchBar } from "@/components/search-bar";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/products", label: "Suppliers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, setOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top bar */}
      <div className="bg-brand-dark text-white">
        <div className="container flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-1.5">
            <Ship className="h-3.5 w-3.5 text-brand-gold" />
            <span className="hidden sm:inline">
              Free shipping on orders over ৳50,000
            </span>
            <span className="sm:hidden">Free shipping over ৳50,000</span>
          </p>
          <a
            href="tel:01700000000"
            className="flex items-center gap-1.5 hover:text-brand-gold"
          >
            <Phone className="h-3.5 w-3.5 text-brand-gold" />
            Call: 01700-000000
          </a>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container flex h-16 items-center gap-3 lg:h-20">
          {/* Mobile menu */}
          <MobileMenu pathname={pathname} />

          <Logo />

          {/* Search (desktop) */}
          <div className="mx-2 hidden flex-1 lg:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1 lg:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Open cart"
              onClick={() => setOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link href="/auth">Login</Link>
            </Button>
            <Button className="hidden sm:inline-flex" asChild>
              <Link href="/auth?tab=register">Register</Link>
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden" asChild>
              <Link href="/auth" aria-label="Account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Search (mobile) */}
        <div className="container pb-3 lg:hidden">
          <SearchBar />
        </div>

        {/* Nav links (desktop) */}
        <nav className="hidden border-t lg:block">
          <div className="container flex h-11 items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-2 transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-primary"
                    : "text-foreground/80"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                )}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col p-2">
          {navLinks.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted",
                  pathname === link.href && "bg-muted text-primary"
                )}
              >
                {link.label}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </SheetClose>
          ))}
        </nav>
        <div className="space-y-2 p-4">
          <SheetClose asChild>
            <Button className="w-full" asChild>
              <Link href="/auth?tab=register">Register</Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth">Login</Link>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
