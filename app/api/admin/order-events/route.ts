import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// POST /api/admin/order-events — add an internal note { orderId, note }
export async function POST(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const orderId = String(body.orderId ?? "");
  const note = String(body.note ?? "").trim().slice(0, 500);
  if (!orderId || !note) {
    return NextResponse.json({ error: "Missing orderId or note" }, { status: 400 });
  }
  try {
    const ev = await prisma.orderEvent.create({
      data: { orderId, note },
    });
    return NextResponse.json({ ok: true, id: ev.id, createdAt: ev.createdAt.toISOString() });
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
