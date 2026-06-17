import Link from "next/link";
import { Boxes } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex shrink-0 items-center gap-2", className)}
      aria-label="Import China home"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-red-700 shadow-md">
        <Boxes className="h-5 w-5 text-brand-gold" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight">
          <span className="text-primary">Import</span>
          <span className="text-brand-gold drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]">
            China
          </span>
        </span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          Wholesale Sourcing
        </span>
      </span>
    </Link>
  );
}
