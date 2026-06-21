import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { buildInstallments } from "@/lib/payments";

export const dynamic = "force-dynamic";

// POST /api/admin/orders/payment-plan — { orderId, plan, customSplits?, startDate? }
export async function POST(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const orderId = String(body.orderId ?? "");
  const plan = String(body.plan ?? "");
  if (!orderId || !plan) {
    return NextResponse.json({ error: "Missing orderId or plan" }, { status: 400 });
  }
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { total: true, createdAt: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const customSplits: number[] | undefined = Array.isArray(body.customSplits)
      ? body.customSplits.map((n: unknown) => Math.round(Number(n))).filter((n: number) => n > 0)
      : undefined;
    const start = body.startDate
      ? new Date(String(body.startDate)).toISOString()
      : order.createdAt.toISOString();

    const rows = buildInstallments(plan, order.total, start, customSplits);

    // replace existing installments + set plan
    await prisma.$transaction([
      prisma.installment.deleteMany({ where: { orderId } }),
      prisma.order.update({ where: { id: orderId }, data: { paymentPlan: plan } }),
      ...(rows.length
        ? [
            prisma.installment.createMany({
              data: rows.map((r) => ({ orderId, ...r })),
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ ok: true, installments: rows });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
