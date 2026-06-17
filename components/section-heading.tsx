import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View All",
  center = false,
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  center?: boolean;
}) {
  return (
    <div
      className={`mb-6 flex flex-col gap-1 ${
        center
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between"
      }`}
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
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="group inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-800"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
