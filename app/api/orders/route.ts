import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, serializeCart } from "@/lib/cart-server";
import { sendNewOrderEmail } from "@/lib/email";
import { getPaymentSettings } from "@/lib/payment-settings-server";
import { minAdvanceAmount, planForAdvancePct, methodLabel } from "@/lib/payments";
import { isValidTxnId } from "@/lib/payment-gateway";

export const dynamic = "force-dynamic";

const FREE_SHIPPING_THRESHOLD = 50000;
const FLAT_SHIPPING_FEE = 500;
const METHODS = ["bkash", "nagad", "rocket", "bank"];

// POST /api/orders — create an order with a required advance payment
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, email, phone, address, city, note } = body ?? {};
  const paymentMethod = String(body.paymentMethod ?? "");
  const advanceAmount = Math.round(Number(body.advanceAmount));
  const txnId = String(body.txnId ?? "").trim();

  if (!name || !email || !phone || !address || !city) {
    return NextResponse.json(
      { error: "Missing required customer fields" },
      { status: 400 }
    );
  }
  if (!METHODS.includes(paymentMethod)) {
    return NextResponse.json({ error: "Select a payment method" }, { status: 400 });
  }

  const { cartId } = await getOrCreateCart();
  const cart = await serializeCart(cartId);
  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const subtotal = cart.subtotal;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  // --- advance-payment rules ---
  const settings = await getPaymentSettings();
  const minAdvance = minAdvanceAmount(total, settings.minAdvancePct);
  if (!Number.isFinite(advanceAmount) || advanceAmount < minAdvance) {
    return NextResponse.json(
      { error: `Minimum ${settings.minAdvancePct}% advance required (৳${minAdvance}).` },
      { status: 400 }
    );
  }
  if (advanceAmount > total) {
    return NextResponse.json(
      { error: "Advance cannot exceed the order total." },
      { status: 400 }
    );
  }
  if (!isValidTxnId(txnId)) {
    return NextResponse.json(
      { error: "Enter the transaction ID / reference from your payment." },
      { status: 400 }
    );
  }

  const pct = Math.round((advanceAmount / total) * 100);
  const plan = planForAdvancePct(pct);
  const fullyPaid = advanceAmount >= total;
  // bank transfer needs manual verification before confirming
  const status = paymentMethod === "bank" ? "pending" : "confirmed";

  const order = await prisma.order.create({
    data: {
      name: String(name),
      email: String(email),
      phone: String(phone),
      address: String(address),
      city: String(city),
      note: note ? String(note) : null,
      paymentMethod: methodLabel(paymentMethod),
      subtotal,
      shippingFee,
      total,
      status,
      paid: fullyPaid,
      paymentPlan: plan,
      items: {
        create: cart.items.map((i) => ({
          productId: i.id,
          name: i.name,
          image: i.image,
          unitPrice: i.price,
          quantity: i.quantity,
        })),
      },
      payments: {
        create: {
          amount: advanceAmount,
          method: paymentMethod,
          txnId,
          note: "Advance payment at checkout",
          date: new Date(),
        },
      },
      events: {
        create: {
          note: `Advance ৳${advanceAmount} (${pct}%) via ${methodLabel(
            paymentMethod
          )} · Trx ${txnId}${paymentMethod === "bank" ? " · awaiting verification" : ""}`,
        },
      },
    },
  });

  await prisma.cartItem.deleteMany({ where: { cartId } });

  await sendNewOrderEmail({
    id: order.id,
    name: order.name,
    email: order.email,
    phone: order.phone,
    address: order.address,
    city: order.city,
    total: order.total,
    items: cart.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.price,
    })),
  });

  return NextResponse.json({ id: order.id }, { status: 201 });
}
