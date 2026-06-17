import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  getProductsByCategory,
  searchProducts,
} from "@/lib/catalog";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 *   ?q=...         smart text search
 *   ?category=...  filter by category slug
 * Returns the full (mapped) result set so the client browser can apply its
 * own price / MOQ / rating / shipping refinements and pagination.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const category = req.nextUrl.searchParams.get("category")?.trim();

  let products;
  if (q) {
    products = await searchProducts(q);
    if (category && category !== "all") {
      products = products.filter((p) => p.category === category);
    }
  } else if (category && category !== "all") {
    products = await getProductsByCategory(category);
  } else {
    products = await getAllProducts();
  }

  return NextResponse.json({ products, total: products.length });
}
