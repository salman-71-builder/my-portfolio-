import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { PAYMENT_METHOD_KEYS } from "@/lib/payments";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Recompute Order.paid from the sum of its payments. */
async function syncPaid(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { total: true },
  });
  if (!order) return;
  const agg = await prisma.payment.aggregate({
    where: { orderId },
    _sum: { amount: true },
  });
  const paid = (agg._sum.amount ?? 0) >= order.total && order.total > 0;
  await prisma.order.update({ where: { id: orderId }, data: { paid } });
}

// POST /api/admin/payments — { orderId, amount, method, txnId?, note?, date? }
export async function POST(req: NextRequest) {
  if (!isAdmin()) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const orderId = String(body.orderId ?? "");
  const amount = Math.round(Number(body.amount));
  const method = String(body.method ?? "");
  if (!orderId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (!PAYMENT_METHOD_KEYS.includes(method)) {
    return NextResponse.json({ error: "Invalid method" }, { status: 400 });
  }
  const date = body.date ? new Date(String(body.date)) : new Date();
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  try {
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
        txnId: body.txnId ? String(body.txnId).slice(0, 100) : null,
        note: body.note ? String(body.note).slice(0, 300) : null,
        date,
      },
    });
    // record a timeline event + sync paid flag
    await prisma.orderEvent.create({
      data: { orderId, note: `Payment received: ৳${amount} (${method})` },
    });
    await syncPaid(orderId);
    return NextResponse.json({
      ok: true,
      payment: { ...payment, date: payment.date.toISOString() },
    });
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}

// DELETE /api/admin/payments?id=...
export async function DELETE(req: NextRequest) {
  if (!isAdmin()) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const payment = await prisma.payment.delete({ where: { id } });
    await syncPaid(payment.orderId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
