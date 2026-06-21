import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAllBanners } from "@/lib/banners-server";
import { BannersManager } from "@/components/admin/banners-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Hero Banners",
  robots: { index: false },
};

export default async function BannersPage() {
  if (!isAdmin()) redirect("/admin/login");
  const banners = await getAllBanners();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Hero Banners</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the homepage cover carousel — add images, text overlays, links
          and order. Changes appear on the homepage immediately.
        </p>
        <BannersManager initialBanners={banners} />
      </main>
    </div>
  );
}
