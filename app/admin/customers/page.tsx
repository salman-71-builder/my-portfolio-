import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { aggregateCustomers, type Customer } from "@/lib/customers";
import { CustomersManager } from "@/components/admin/customers-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Customer Management",
  robots: { index: false },
};

async function loadCustomers(): Promise<{ customers: Customer[]; error: boolean }> {
  try {
    const rows = await prisma.order.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const customers = aggregateCustomers(
      rows.map((o) => ({
        id: o.id,
        name: o.name,
        email: o.email,
        phone: o.phone,
        address: o.address,
        city: o.city,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      }))
    );
    return { customers, error: false };
  } catch {
    return { customers: [], error: true };
  }
}

export default async function CustomersPage() {
  if (!isAdmin()) redirect("/admin/login");
  const { customers, error } = await loadCustomers();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Customer Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone who has ordered, with spending, VIP tiers and insights.
        </p>
        {error && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Database not reachable — connect <code>DATABASE_URL</code> and run{" "}
            <code>npm run db:push</code> / <code>npm run seed</code>.
          </div>
        )}
        <CustomersManager customers={customers} />
      </main>
    </div>
  );
}
