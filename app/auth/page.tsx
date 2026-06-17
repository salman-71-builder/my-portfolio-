import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Login or Register",
  description:
    "Sign in or create your Import China account as a buyer or supplier.",
};

export default function AuthPage() {
  return (
    <section className="relative overflow-hidden bg-accent/40 py-14">
      <div className="container flex justify-center">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="gradient-brand flex h-11 w-11 items-center justify-center rounded-lg ring-2 ring-gold">
                <Boxes className="h-6 w-6 text-gold" />
              </div>
              <span className="text-xl font-extrabold text-brand">
                Import<span className="text-gold-600">China</span>
              </span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Welcome! Access your wholesale sourcing dashboard.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
            <Suspense
              fallback={
                <div className="py-10 text-center text-muted-foreground">
                  Loading…
                </div>
              }
            >
              <AuthForm />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
