import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View All",
  center,
  className,
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex items-end justify-between gap-4",
        center && "flex-col items-center text-center",
        className
      )}
    >
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        )}
        {center && (
          <span className="mx-auto mt-3 block h-1 w-20 rounded-full bg-gradient-to-r from-primary to-brand-gold" />
        )}
      </div>
      {viewAllHref && !center && (
        <Link
          href={viewAllHref}
          className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
