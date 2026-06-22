import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart-server";
import { placeOrder } from "@/lib/place-order";
import { isValidTxnId } from "@/lib/payment-gateway";

export const dynamic = "force-dynamic";

const METHODS = ["bkash", "nagad", "rocket", "bank"];

// POST /api/orders — create an order with a required advance payment (manual
// TrxID confirmation). Automated bKash uses /api/bkash/create + callback.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, email, phone, address, city, note } = body ?? {};
  const paymentMethod = String(body.paymentMethod ?? "");
  const txnId = String(body.txnId ?? "").trim();

  if (!name || !email || !phone || !address || !city) {
    return NextResponse.json({ error: "Missing required customer fields" }, { status: 400 });
  }
  if (!METHODS.includes(paymentMethod)) {
    return NextResponse.json({ error: "Select a payment method" }, { status: 400 });
  }
  if (!isValidTxnId(txnId)) {
    return NextResponse.json(
      { error: "Enter the transaction ID / reference from your payment." },
      { status: 400 }
    );
  }

  const { cartId } = await getOrCreateCart();
  const result = await placeOrder({
    cartId,
    name: String(name),
    email: String(email),
    phone: String(phone),
    address: String(address),
    city: String(city),
    note: note ? String(note) : null,
    method: paymentMethod,
    advanceAmount: Math.round(Number(body.advanceAmount)),
    txnId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  await prisma.cartItem.deleteMany({ where: { cartId } });
  return NextResponse.json({ id: result.id }, { status: 201 });
}
