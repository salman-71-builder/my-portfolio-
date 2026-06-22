import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, serializeCart } from "@/lib/cart-server";
import { getPaymentSettings } from "@/lib/payment-settings-server";
import { minAdvanceAmount } from "@/lib/payments";
import { bkashConfigured, createPayment } from "@/lib/bkash";

export const dynamic = "force-dynamic";

const FREE_SHIPPING_THRESHOLD = 50000;
const FLAT_SHIPPING_FEE = 500;

// POST /api/bkash/create — start an automated bKash payment, return { bkashURL }
export async function POST(req: NextRequest) {
  if (!bkashConfigured()) {
    return NextResponse.json(
      { error: "bKash automated checkout is not configured." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { name, email, phone, address, city, note } = body ?? {};
  const advanceAmount = Math.round(Number(body.advanceAmount));

  if (!name || !email || !phone || !address || !city) {
    return NextResponse.json({ error: "Missing required customer fields" }, { status: 400 });
  }

  const { cartId } = await getOrCreateCart();
  const cart = await serializeCart(cartId);
  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const subtotal = cart.subtotal;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const settings = await getPaymentSettings();
  const minAdvance = minAdvanceAmount(total, settings.minAdvancePct);
  if (!Number.isFinite(advanceAmount) || advanceAmount < minAdvance || advanceAmount > total) {
    return NextResponse.json(
      { error: `Advance must be between ৳${minAdvance} and ৳${total}.` },
      { status: 400 }
    );
  }

  try {
    const pending = await prisma.pendingCheckout.create({
      data: {
        name: String(name),
        email: String(email),
        phone: String(phone),
        address: String(address),
        city: String(city),
        note: note ? String(note) : null,
        advanceAmount,
        method: "bkash",
      },
    });

    const origin = req.nextUrl.origin;
    const { paymentID, bkashURL } = await createPayment({
      amount: advanceAmount,
      invoice: pending.id,
      callbackURL: `${origin}/api/bkash/callback?ref=${pending.id}`,
      payerReference: String(phone),
    });

    await prisma.pendingCheckout.update({
      where: { id: pending.id },
      data: { bkashPaymentID: paymentID },
    });

    return NextResponse.json({ bkashURL });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Could not start bKash payment." },
      { status: 502 }
    );
  }
}
