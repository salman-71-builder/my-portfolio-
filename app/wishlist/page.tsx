import { Suspense } from "react";
import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist-view";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Your saved products and collections on ChinaCart.",
};

export default function WishlistPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-20 text-center text-muted-foreground">
          Loading wishlist…
        </div>
      }
    >
      <WishlistView />
    </Suspense>
  );
}
