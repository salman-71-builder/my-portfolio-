import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { getPaymentSettings } from "@/lib/payment-settings-server";
import { PaymentSettingsManager } from "@/components/admin/payment-settings-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Payment Settings",
  robots: { index: false },
};

export default async function PaymentSettingsPage() {
  if (!isAdmin()) redirect("/admin/login");
  const settings = await getPaymentSettings();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Payment Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the advance rule, enabled methods and merchant details used
          at checkout.
        </p>
        <PaymentSettingsManager initial={settings} />
      </main>
    </div>
  );
}
