"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";

import { useCart } from "@/context/cart-context";
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
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-4">
        {items.slice(0, 2).map((item) => (
          <NavButton key={item.href} {...item} active={pathname === item.href} />
        ))}

        <button
          onClick={() => setOpen(true)}
          className="relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-foreground/70"
        >
          <span className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </span>
          Cart
        </button>

        <NavButton
          {...items[2]}
          active={pathname === items[2].href}
        />
      </div>
    </nav>
  );
}

function NavButton({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-foreground/70"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
