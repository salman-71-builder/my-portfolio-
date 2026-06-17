import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-7xl font-extrabold text-brand">404</p>
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back to sourcing.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    </div>
  );
}
