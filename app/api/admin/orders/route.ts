import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { ORDER_STATUSES } from "@/lib/order-status";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// GET /api/admin/orders — lightweight stats for the new-order poller
export async function GET() {
  if (!isAdmin()) return unauthorized();
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [count, pending, today, newest] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true },
      }),
    ]);
    return NextResponse.json({
      count,
      pending,
      today,
      newestAt: newest?.createdAt.toISOString() ?? null,
    });
  } catch {
    return NextResponse.json({ count: 0, pending: 0, today: 0, newestAt: null });
  }
}

// PATCH /api/admin/orders — { id, status } or { id, paid } (admin only)
export async function PATCH(req: NextRequest) {
  if (!isAdmin()) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // mark paid / unpaid
  if (typeof body.paid === "boolean") {
    try {
      await prisma.order.update({ where: { id }, data: { paid: body.paid } });
      return NextResponse.json({ ok: true, paid: body.paid });
    } catch {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
  }

  // status change (+ timeline event)
  const status = String(body.status ?? "");
  if (!ORDER_STATUSES.includes(status as never)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        events: { create: { status } },
      },
    });
    return NextResponse.json({ ok: true, status: order.status });
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
