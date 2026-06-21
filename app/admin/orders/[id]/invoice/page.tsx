import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { InvoiceView, type InvoiceData } from "@/components/admin/invoice-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false },
};

export default async function InvoicePage({
  params,
}: {
  params: { id: string };
}) {
  if (!isAdmin()) redirect("/admin/login");

  let data: InvoiceData | null = null;
  try {
    const o = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });
    if (o) {
      data = {
        id: o.id,
        name: o.name,
        email: o.email,
        phone: o.phone,
        address: o.address,
        city: o.city,
        paymentMethod: o.paymentMethod,
        subtotal: o.subtotal,
        shippingFee: o.shippingFee,
        total: o.total,
        paid: o.paid,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i) => ({
          name: i.name,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
        })),
      };
    }
  } catch {
    data = null;
  }

  if (!data) notFound();
  return <InvoiceView data={data} />;
}
