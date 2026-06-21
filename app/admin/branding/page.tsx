import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { getBranding } from "@/lib/branding-server";
import { BrandingManager } from "@/components/admin/branding-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Logo & Branding",
  robots: { index: false },
};

export default async function BrandingPage() {
  if (!isAdmin()) redirect("/admin/login");
  const branding = await getBranding();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Logo &amp; Branding</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your logos and set brand colours — changes apply across the
          whole website.
        </p>
        <BrandingManager initial={branding} />
      </main>
    </div>
  );
}
