"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Boxes, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-[#0a0604] text-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-brand text-black">
            <Boxes className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <p className="font-extrabold">
              Import<span className="text-gold">China</span>
            </p>
            <p className="text-[11px] text-white/50">Admin Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/" target="_blank">
              View Site
            </Link>
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={logout}
            disabled={loading}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
