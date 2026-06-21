import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  OrderDetailAdmin,
  type DetailOrder,
} from "@/components/admin/order-detail-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false },
};

async function loadOrder(id: string): Promise<DetailOrder | null> {
  try {
    const o = await prisma.order.findUnique({
      where: { id },
      include: { items: true, events: { orderBy: { createdAt: "asc" } } },
    });
    if (!o) return null;
    return {
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
      events: o.events.map((e) => ({
        id: e.id,
        status: e.status,
        note: e.note,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isAdmin()) redirect("/admin/login");
  const order = await loadOrder(params.id);
  if (!order) notFound();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <OrderDetailAdmin order={order} />
      </main>
    </div>
  );
}
