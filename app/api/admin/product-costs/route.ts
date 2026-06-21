import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// GET /api/admin/product-costs — list per-product cost overrides (admin only)
export async function GET() {
  if (!isAdmin()) return unauthorized();
  try {
    const rows = await prisma.productCost.findMany();
    return NextResponse.json({
      costs: rows.map((r) => ({ productId: r.productId, costPrice: r.costPrice })),
    });
  } catch {
    return NextResponse.json({ costs: [], error: true });
  }
}

// POST /api/admin/product-costs — upsert { productId, costPrice }
export async function POST(req: NextRequest) {
  if (!isAdmin()) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const productId = String(body.productId ?? "");
  const costPrice = Math.round(Number(body.costPrice));
  if (!productId || !Number.isFinite(costPrice) || costPrice < 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  try {
    await prisma.productCost.upsert({
      where: { productId },
      create: { productId, costPrice },
      update: { costPrice },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// DELETE /api/admin/product-costs?productId=... — clear override
export async function DELETE(req: NextRequest) {
  if (!isAdmin()) return unauthorized();
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }
  try {
    await prisma.productCost.delete({ where: { productId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
