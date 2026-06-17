import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, serializeCart } from "@/lib/cart-server";
import { sendNewOrderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const FREE_SHIPPING_THRESHOLD = 50000;
const FLAT_SHIPPING_FEE = 500;

// POST /api/orders — create an order from the current cart
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, email, phone, address, city, note, paymentMethod } = body ?? {};

  if (!name || !email || !phone || !address || !city) {
    return NextResponse.json(
      { error: "Missing required customer fields" },
      { status: 400 }
    );
  }

  const { cartId } = await getOrCreateCart();
  const cart = await serializeCart(cartId);

  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const subtotal = cart.subtotal;
  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const order = await prisma.order.create({
    data: {
      name: String(name),
      email: String(email),
      phone: String(phone),
      address: String(address),
      city: String(city),
      note: note ? String(note) : null,
      paymentMethod: paymentMethod ? String(paymentMethod) : "Cash on Delivery",
      subtotal,
      shippingFee,
      total,
      items: {
        create: cart.items.map((i) => ({
          productId: i.id,
          name: i.name,
          image: i.image,
          unitPrice: i.price,
          quantity: i.quantity,
        })),
      },
    },
  });

  // empty the cart now that it's been converted to an order
  await prisma.cartItem.deleteMany({ where: { cartId } });

  // notify admin of the new order (no-op if email isn't configured)
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
