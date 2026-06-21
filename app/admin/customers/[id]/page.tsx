import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  aggregateCustomers,
  decodeCustomerId,
  vipTier,
  type CustomerOrderInput,
} from "@/lib/customers";
import {
  CustomerProfile,
  type ProfileOrder,
} from "@/components/admin/customer-profile";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Customer Profile",
  robots: { index: false },
};

export default async function CustomerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  if (!isAdmin()) redirect("/admin/login");

  let email = "";
  try {
    email = decodeCustomerId(params.id).toLowerCase();
  } catch {
    notFound();
  }

  async function fetchRows() {
    try {
      return await prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      return [];
    }
  }
  const rows = await fetchRows();

  const inputs: CustomerOrderInput[] = rows.map((o) => ({
    id: o.id,
    name: o.name,
    email: o.email,
    phone: o.phone,
    address: o.address,
    city: o.city,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  }));

  const customers = aggregateCustomers(inputs);
  const rank = customers.findIndex((c) => c.email.toLowerCase() === email);
  const customer = rank >= 0 ? customers[rank] : null;
  if (!customer) notFound();

  const tier = vipTier(rank, customer.totalSpent);

  const history: ProfileOrder[] = rows
    .filter((o) => o.email.toLowerCase() === email)
    .map((o) => ({
      id: o.id,
      total: o.total,
      status: o.status,
      paid: o.paid,
      createdAt: o.createdAt.toISOString(),
      itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
    }));

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <CustomerProfile customer={customer} tier={tier} orders={history} />
      </main>
    </div>
  );
}
