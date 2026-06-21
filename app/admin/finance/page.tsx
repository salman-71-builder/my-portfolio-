import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { FinanceDashboard } from "@/components/admin/finance-dashboard";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import type { FinanceOrder, ExpenseRow, CostMap } from "@/lib/finance";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finance Dashboard",
  robots: { index: false },
};

// productId → human category name (from the bundled catalog)
function buildCategoryMap(): Record<string, string> {
  const slugToName = new Map(categories.map((c) => [c.slug, c.name]));
  const map: Record<string, string> = {};
  for (const p of products) {
    map[p.id] = slugToName.get(p.category) ?? "Other";
  }
  return map;
}

async function loadFinance(): Promise<{
  orders: FinanceOrder[];
  expenses: ExpenseRow[];
  costMap: CostMap;
  error: boolean;
}> {
  const catMap = buildCategoryMap();
  try {
    const [orderRows, expenseRows, costRows] = await Promise.all([
      prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.expense.findMany({ orderBy: { date: "desc" } }),
      prisma.productCost.findMany(),
    ]);

    const orders: FinanceOrder[] = orderRows.map((o) => ({
      id: o.id,
      name: o.name,
      email: o.email,
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        category: catMap[i.productId] ?? "Other",
      })),
    }));

    const expenses: ExpenseRow[] = expenseRows.map((e) => ({
      id: e.id,
      category: e.category,
      amount: e.amount,
      note: e.note,
      date: e.date.toISOString(),
    }));

    const costMap: CostMap = {};
    for (const c of costRows) costMap[c.productId] = c.costPrice;

    return { orders, expenses, costMap, error: false };
  } catch {
    return { orders: [], expenses: [], costMap: {}, error: true };
  }
}

export default async function FinancePage() {
  if (!isAdmin()) redirect("/admin/login");

  const { orders, expenses, costMap, error } = await loadFinance();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Finance Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revenue, expenses, profit &amp; loss — all in BDT.
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Database not reachable</p>
              <p>
                Set a valid <code>DATABASE_URL</code> (Neon Postgres) and run{" "}
                <code>npm run db:push</code>. Seed sample data with{" "}
                <code>npm run seed</code>. Figures will appear once connected.
              </p>
            </div>
          </div>
        )}

        <FinanceDashboard
          orders={orders}
          initialExpenses={expenses}
          costMap={costMap}
        />
      </main>
    </div>
  );
}
