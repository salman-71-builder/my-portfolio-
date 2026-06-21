import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { LabelSheet, type LabelOrder } from "@/components/admin/label-sheet";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shipping Labels",
  robots: { index: false },
};

export default async function LabelsPage({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  if (!isAdmin()) redirect("/admin/login");

  const ids = (searchParams.ids ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let orders: LabelOrder[] = [];
  if (ids.length) {
    try {
      const rows = await prisma.order.findMany({
        where: { id: { in: ids } },
        include: { items: true },
      });
      orders = rows.map((o) => ({
        id: o.id,
        name: o.name,
        phone: o.phone,
        address: o.address,
        city: o.city,
        paymentMethod: o.paymentMethod,
        total: o.total,
        itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
      }));
    } catch {
      orders = [];
    }
  }

  return <LabelSheet orders={orders} />;
}
