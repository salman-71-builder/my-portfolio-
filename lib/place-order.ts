import "server-only";
import { prisma } from "@/lib/prisma";
import { serializeCart } from "@/lib/cart-server";
import { sendNewOrderEmail } from "@/lib/email";
import { getPaymentSettings } from "@/lib/payment-settings-server";
import { minAdvanceAmount, planForAdvancePct, methodLabel } from "@/lib/payments";

const FREE_SHIPPING_THRESHOLD = 50000;
const FLAT_SHIPPING_FEE = 500;

export interface PlaceOrderInput {
  cartId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note?: string | null;
  method: string; // bkash | nagad | rocket | bank
  advanceAmount: number;
  txnId: string;
}

export type PlaceOrderResult =
  | { ok: true; id: string }
  | { ok: false; error: string; status: number };

/**
 * Validates the advance rule and creates an order + advance payment from the
 * current cart. Shared by the manual checkout (/api/orders) and the bKash
 * callback. Does NOT clear the cart — callers decide when to do that.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const cart = await serializeCart(input.cartId);
  if (cart.items.length === 0) {
    return { ok: false, error: "Cart is empty", status: 400 };
  }

  const subtotal = cart.subtotal;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const settings = await getPaymentSettings();
  const minAdvance = minAdvanceAmount(total, settings.minAdvancePct);
  const advanceAmount = Math.round(input.advanceAmount);
  if (!Number.isFinite(advanceAmount) || advanceAmount < minAdvance) {
    return {
      ok: false,
      status: 400,
      error: `Minimum ${settings.minAdvancePct}% advance required (৳${minAdvance}).`,
    };
  }
  if (advanceAmount > total) {
    return { ok: false, error: "Advance cannot exceed the order total.", status: 400 };
  }

  const pct = Math.round((advanceAmount / total) * 100);
  const plan = planForAdvancePct(pct);
  const fullyPaid = advanceAmount >= total;
  const status = input.method === "bank" ? "pending" : "confirmed";

  const order = await prisma.order.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      city: input.city,
      note: input.note ?? null,
      paymentMethod: methodLabel(input.method),
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
          method: input.method,
          txnId: input.txnId,
          note: "Advance payment at checkout",
          date: new Date(),
        },
      },
      events: {
        create: {
          note: `Advance ৳${advanceAmount} (${pct}%) via ${methodLabel(
            input.method
          )} · Trx ${input.txnId}${input.method === "bank" ? " · awaiting verification" : ""}`,
        },
      },
    },
  });

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

  return { ok: true, id: order.id };
}
