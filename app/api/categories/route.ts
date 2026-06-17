import { NextResponse } from "next/server";
import { getCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

// GET /api/categories — all categories (mapped from the data source)
export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories });
}
