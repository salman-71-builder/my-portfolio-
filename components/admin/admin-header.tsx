"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Boxes, LogOut, LayoutDashboard, LineChart, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/finance", label: "Finance", icon: LineChart },
  { href: "/admin/products", label: "Cost Prices", icon: Tags },
];

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = React.useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white">
              <Boxes className="h-5 w-5" />
            </span>
            <div className="leading-none">
              <p className="font-bold">
                China<span className="text-primary">Cart</span>
              </p>
              <p className="text-[11px] text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((l) => {
              const Icon = l.icon;
              const active =
                l.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/" target="_blank">
              View Site
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={logout} disabled={loading}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
