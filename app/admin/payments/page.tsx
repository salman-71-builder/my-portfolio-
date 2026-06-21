import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  PaymentsManager,
  type PaymentOrderRow,
  type PaymentFlat,
} from "@/components/admin/payments-manager";
import { summarize } from "@/lib/payments";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false },
};

async function load(): Promise<{
  orders: PaymentOrderRow[];
  payments: PaymentFlat[];
  error: boolean;
}> {
  try {
    const rows = await prisma.order.findMany({
      where: { status: { notIn: ["cancelled", "returned"] } },
      include: {
        payments: { orderBy: { date: "asc" } },
        installments: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    const orders: PaymentOrderRow[] = [];
    const payments: PaymentFlat[] = [];

    for (const o of rows) {
      const prows = o.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        date: p.date.toISOString(),
      }));
      const sum = summarize(o.total, prows.map((p) => ({ ...p, txnId: null, note: null })));

      // next unpaid installment due date
      let cumulative = 0;
      let nextDue: string | null = null;
      for (const inst of o.installments) {
        cumulative += inst.amount;
        if (sum.paid < cumulative && inst.dueDate) {
          nextDue = inst.dueDate.toISOString();
          break;
        }
      }

      orders.push({
        id: o.id,
        name: o.name,
        phone: o.phone,
        email: o.email,
        total: o.total,
        paid: sum.paid,
        remaining: sum.remaining,
        status: sum.status,
        nextDue,
        createdAt: o.createdAt.toISOString(),
      });
      for (const p of prows) payments.push({ ...p, orderId: o.id });
    }

    return { orders, payments, error: false };
  } catch {
    return { orders: [], payments: [], error: true };
  }
}

export default async function PaymentsPage() {
  if (!isAdmin()) redirect("/admin/login");
  const { orders, payments, error } = await load();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track collected money, outstanding balances and overdue payments.
        </p>
        {error && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Database not reachable — connect <code>DATABASE_URL</code> and run{" "}
            <code>npm run db:push</code>.
          </div>
        )}
        <PaymentsManager orders={orders} payments={payments} />
      </main>
    </div>
  );
}
