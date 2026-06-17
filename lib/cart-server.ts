import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getProductById } from "@/lib/catalog";

export const CART_COOKIE = "cartId";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SerializedCartItem {
  id: string; // productId
  name: string;
  image: string;
  price: number;
  priceMax: number;
  moq: number;
  quantity: number;
}

export interface SerializedCart {
  cartId: string;
  items: SerializedCartItem[];
  totalItems: number;
  subtotal: number;
}

/** Cookie attributes used whenever we (re)issue the cart cookie. */
export function cartCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  };
}

/**
 * Resolve the cart for the current request, creating one (and flagging that a
 * cookie must be set on the response) when none exists yet.
 */
export async function getOrCreateCart(): Promise<{
  cartId: string;
  isNew: boolean;
}> {
  const existingId = cookies().get(CART_COOKIE)?.value;
  if (existingId) {
    const cart = await prisma.cart.findUnique({ where: { id: existingId } });
    if (cart) return { cartId: cart.id, isNew: false };
  }
  const cart = await prisma.cart.create({ data: {} });
  return { cartId: cart.id, isNew: true };
}

/** Build a client-friendly cart payload, enriched from the product catalog. */
export async function serializeCart(cartId: string): Promise<SerializedCart> {
  const rows = await prisma.cartItem.findMany({
    where: { cartId },
    orderBy: { createdAt: "asc" },
  });

  const items: SerializedCartItem[] = [];
  for (const row of rows) {
    const product = await getProductById(row.productId);
    if (!product) continue; // skip stale references
    items.push({
      id: product.id,
      name: product.name,
      image: product.images[0],
      price: product.priceMin,
      priceMax: product.priceMax,
      moq: product.moq,
      quantity: row.quantity,
    });
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { cartId, items, totalItems, subtotal };
}
