import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { formatBDT } from "@/lib/utils";
import { OrdersTable, type AdminOrder } from "@/components/admin/orders-table";
import { AdminHeader } from "@/components/admin/admin-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false },
};

async function loadOrders(): Promise<{ orders: AdminOrder[]; error: boolean }> {
  try {
    const rows = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    const orders: AdminOrder[] = rows.map((o) => ({
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

export default async function AdminDashboardPage() {
  if (!isAdmin()) redirect("/admin/login");

  const { orders, error } = await loadOrders();

  const active = orders.filter(
    (o) => o.status !== "cancelled" && o.status !== "returned"
  );
  const revenue = active.reduce((s, o) => s + o.total, 0);
  const count = orders.length;
  const aov = active.length ? Math.round(revenue / active.length) : 0;
  const pending = orders.filter((o) => o.status === "pending").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const unitsSold = active.reduce(
    (s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0),
    0
  );

  const stats = [
    {
      label: "Total Revenue",
      value: formatBDT(revenue),
      icon: TrendingUp,
      accent: "text-green-600",
    },
    {
      label: "Total Orders",
      value: count.toString(),
      icon: ShoppingBag,
      accent: "text-brand",
    },
    {
      label: "Avg Order Value",
      value: formatBDT(aov),
      icon: Wallet,
      accent: "text-blue-600",
    },
    {
      label: "Units Sold",
      value: unitsSold.toLocaleString(),
      icon: TrendingUp,
      accent: "text-purple-600",
    },
    {
      label: "Pending",
      value: pending.toString(),
      icon: Clock,
      accent: "text-amber-600",
    },
    {
      label: "Delivered",
      value: delivered.toString(),
      icon: CheckCircle2,
      accent: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />

      <main className="container py-8">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of customer orders, sales and revenue.
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Database not reachable</p>
              <p>
                Set a valid <code>DATABASE_URL</code> (Neon Postgres) and run{" "}
                <code>npm run db:push</code>. Orders will appear here once the
                database is connected.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <Icon className={`h-5 w-5 ${s.accent}`} />
                <p className="mt-3 text-xl font-extrabold tracking-tight">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Orders */}
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Customer Orders</h2>
          <OrdersTable orders={orders} />
        </div>
      </main>
    </div>
  );
}
