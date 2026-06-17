import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { ORDER_STATUSES } from "@/lib/order-status";

export const dynamic = "force-dynamic";

// PATCH /api/admin/orders — { id, status }  (admin only)
export async function PATCH(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !ORDER_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid id or status" },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.update({
      where: { id: String(id) },
      data: { status: String(status) },
    });
    return NextResponse.json({ ok: true, status: order.status });
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
