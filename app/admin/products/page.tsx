import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { getAllProducts } from "@/lib/catalog";
import { categories } from "@/data/categories";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  ProductCostsManager,
  type CostProduct,
} from "@/components/admin/product-costs-manager";
import type { CostMap } from "@/lib/finance";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Cost Prices",
  robots: { index: false },
};

async function loadCosts(): Promise<{ costMap: CostMap; error: boolean }> {
  try {
    const rows = await prisma.productCost.findMany();
    const costMap: CostMap = {};
    for (const r of rows) costMap[r.productId] = r.costPrice;
    return { costMap, error: false };
  } catch {
    return { costMap: {}, error: true };
  }
}

export default async function ProductCostsPage() {
  if (!isAdmin()) redirect("/admin/login");

  const slugToName = new Map(categories.map((c) => [c.slug, c.name]));
  const [allProducts, { costMap, error }] = await Promise.all([
    getAllProducts(),
    loadCosts(),
  ]);

  const products: CostProduct[] = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.images[0] ?? "",
    category: slugToName.get(p.category) ?? p.category,
    price: p.priceMin,
  }));

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Product Cost Prices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set the cost price (what you pay in China) for each product. Profit per
          sale is then calculated exactly across orders and the finance
          dashboard.
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Database not reachable</p>
              <p>
                Set a valid <code>DATABASE_URL</code> (Neon Postgres) and run{" "}
                <code>npm run db:push</code>. Cost prices are stored in the
                database and will save once it&apos;s connected.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <ProductCostsManager products={products} initialCosts={costMap} />
        </div>
      </main>
    </div>
  );
}
