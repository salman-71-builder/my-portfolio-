import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { getShippingRates } from "@/lib/shipping-server";
import { ShippingRatesManager } from "@/components/admin/shipping-rates-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shipping Rates",
  robots: { index: false },
};

export default async function ShippingRatesPage() {
  if (!isAdmin()) redirect("/admin/login");
  const rates = await getShippingRates();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Shipping Rates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Per-kg air &amp; sea rates used by the bulk order calculator. Update
          any value and save — changes apply to new calculations instantly.
        </p>
        <ShippingRatesManager initialRates={rates} />
      </main>
    </div>
  );
}
