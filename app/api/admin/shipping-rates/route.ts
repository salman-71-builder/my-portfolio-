import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { getShippingRates } from "@/lib/shipping-server";

export const dynamic = "force-dynamic";

// GET /api/admin/shipping-rates — current merged rates (public read)
export async function GET() {
  const rates = await getShippingRates();
  return NextResponse.json({ rates });
}

// POST /api/admin/shipping-rates — { updates: { key: perKg } } (admin only)
export async function POST(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const updates = (body.updates ?? {}) as Record<string, unknown>;
  const entries = Object.entries(updates)
    .map(([key, v]) => [key, Math.round(Number(v))] as const)
    .filter(([, v]) => Number.isFinite(v) && v >= 0);

  if (entries.length === 0) {
    return NextResponse.json({ error: "No valid updates" }, { status: 400 });
  }
  try {
    await prisma.$transaction(
      entries.map(([key, perKg]) =>
        prisma.shippingRate.upsert({
          where: { key },
          create: { key, perKg },
          update: { perKg },
        })
      )
    );
    return NextResponse.json({ ok: true, updated: entries.length });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
