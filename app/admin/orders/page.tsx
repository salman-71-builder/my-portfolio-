import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  OrdersManager,
  type ManagedOrder,
} from "@/components/admin/orders-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Management",
  robots: { index: false },
};

async function loadOrders(): Promise<{ orders: ManagedOrder[]; error: boolean }> {
  try {
    const rows = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    const orders: ManagedOrder[] = rows.map((o) => ({
      id: o.id,
      name: o.name,
      email: o.email,
      phone: o.phone,
      address: o.address,
      city: o.city,
      note: o.note,
      paymentMethod: o.paymentMethod,
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      total: o.total,
      status: o.status,
      paid: o.paid,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        id: i.id,
        name: i.name,
        image: i.image,
        productId: i.productId,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
    }));
    return { orders, error: false };
  } catch {
    return { orders: [], error: true };
  }
}

export default async function OrdersPage() {
  if (!isAdmin()) redirect("/admin/login");
  const { orders, error } = await loadOrders();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Order Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track, update, print and fulfil every order.
        </p>
        <OrdersManager orders={orders} dbError={error} />
      </main>
    </div>
  );
}
