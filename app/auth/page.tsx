import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthClient } from "@/components/auth-client";

export const metadata: Metadata = {
  title: "Login or Register",
  description:
    "Login or create your Import China account as a buyer or supplier.",
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-20 text-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <AuthClient />
    </Suspense>
  );
}
