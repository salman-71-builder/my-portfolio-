import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  reviews,
  size = "sm",
  showCount = true,
}: {
  rating: number;
  reviews?: number;
  size?: "sm" | "md";
  showCount?: boolean;
}) {
  const px = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              px,
              i <= Math.round(rating)
                ? "fill-gold text-gold"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "font-semibold text-foreground",
          size === "sm" ? "text-xs" : "text-sm"
        )}
      >
        {rating.toFixed(1)}
      </span>
      {showCount && reviews !== undefined && (
        <span
          className={cn(
            "text-muted-foreground",
            size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          ({reviews.toLocaleString()})
        </span>
      )}
    </div>
  );
}
