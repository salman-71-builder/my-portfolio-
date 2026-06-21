import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { ReceiptView, type ReceiptData } from "@/components/admin/receipt-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment Receipt", robots: { index: false } };

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { p?: string };
}) {
  if (!isAdmin()) redirect("/admin/login");

  let data: ReceiptData | null = null;
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { payments: { orderBy: { date: "asc" } } },
    });
    if (order) {
      const payment =
        order.payments.find((p) => p.id === searchParams.p) ?? order.payments[order.payments.length - 1];
      if (payment) {
        const paidSoFar = order.payments
          .filter((p) => p.date <= payment.date)
          .reduce((s, p) => s + p.amount, 0);
        data = {
          orderId: order.id,
          name: order.name,
          phone: order.phone,
          amount: payment.amount,
          method: payment.method,
          txnId: payment.txnId,
          date: payment.date.toISOString(),
          total: order.total,
          remaining: Math.max(0, order.total - paidSoFar),
        };
      }
    }
  } catch {
    data = null;
  }

  if (!data) notFound();
  return <ReceiptView data={data} />;
}
