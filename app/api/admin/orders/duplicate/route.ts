import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// POST /api/admin/orders/duplicate — clone an order as a new pending order
export async function POST(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const src = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!src) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const copy = await prisma.order.create({
      data: {
        name: src.name,
        email: src.email,
        phone: src.phone,
        address: src.address,
        city: src.city,
        note: src.note,
        paymentMethod: src.paymentMethod,
        subtotal: src.subtotal,
        shippingFee: src.shippingFee,
        total: src.total,
        status: "pending",
        paid: false,
        items: {
          create: src.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.image,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
          })),
        },
        events: { create: { note: `Duplicated from order ${id.slice(-8).toUpperCase()}` } },
      },
    });
    return NextResponse.json({ ok: true, id: copy.id });
  } catch {
    return NextResponse.json({ error: "Could not duplicate" }, { status: 500 });
  }
}
