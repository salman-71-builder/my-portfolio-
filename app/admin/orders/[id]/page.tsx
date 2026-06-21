import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  OrderDetailAdmin,
  type DetailOrder,
} from "@/components/admin/order-detail-admin";
import { PaymentPanel } from "@/components/admin/payment-panel";
import type { PaymentRow, InstallmentRow } from "@/lib/payments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false },
};

interface LoadResult {
  order: DetailOrder;
  payments: PaymentRow[];
  installments: InstallmentRow[];
  paymentPlan: string | null;
}

async function loadOrder(id: string): Promise<LoadResult | null> {
  try {
    const o = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        events: { orderBy: { createdAt: "asc" } },
        payments: { orderBy: { date: "desc" } },
        installments: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!o) return null;
    const order: DetailOrder = {
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
    return {
      order,
      paymentPlan: o.paymentPlan,
      payments: o.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        txnId: p.txnId,
        note: p.note,
        date: p.date.toISOString(),
      })),
      installments: o.installments.map((x) => ({
        id: x.id,
        label: x.label,
        amount: x.amount,
        dueDate: x.dueDate ? x.dueDate.toISOString() : null,
        sortOrder: x.sortOrder,
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
  const data = await loadOrder(params.id);
  if (!data) notFound();
  const { order, payments, installments, paymentPlan } = data;

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <OrderDetailAdmin order={order} />
        <div className="mt-6">
          <PaymentPanel
            orderId={order.id}
            total={order.total}
            customer={{ name: order.name, phone: order.phone, email: order.email }}
            initialPayments={payments}
            initialInstallments={installments}
            initialPlan={paymentPlan}
          />
        </div>
      </main>
    </div>
  );
}
