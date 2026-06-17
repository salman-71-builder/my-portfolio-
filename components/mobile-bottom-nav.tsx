"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setOpen } = useCart();

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/categories", label: "Categories", icon: LayoutGrid },
    { href: "/auth", label: "Account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t bg-white/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-4">
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                active ? "text-brand" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className="relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground"
        >
          <ShoppingCart className="h-5 w-5" />
          Cart
          {totalItems > 0 && (
            <span className="absolute right-1/4 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </button>
        <Link
          href="/auth"
          className={cn(
            "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
            pathname === "/auth" ? "text-brand" : "text-muted-foreground"
          )}
        >
          <User className="h-5 w-5" />
          Account
        </Link>
      </div>
    </nav>
  );
}
