import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateCart,
  serializeCart,
  cartCookieOptions,
  CART_COOKIE,
} from "@/lib/cart-server";
import { getProductById } from "@/data/products";

export const dynamic = "force-dynamic";

async function respond(cartId: string, isNew: boolean) {
  const cart = await serializeCart(cartId);
  const res = NextResponse.json(cart);
  if (isNew) res.cookies.set(CART_COOKIE, cartId, cartCookieOptions());
  return res;
}

// GET /api/cart — current cart
export async function GET() {
  const { cartId, isNew } = await getOrCreateCart();
  return respond(cartId, isNew);
}

// POST /api/cart — add item { productId, quantity? } (increments)
export async function POST(req: NextRequest) {
  const { productId, quantity } = await req.json().catch(() => ({}));
  const product = getProductById(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const qty = Math.max(1, Number(quantity) || product.moq);
  const { cartId, isNew } = await getOrCreateCart();

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId, productId } },
    update: { quantity: { increment: qty } },
    create: { cartId, productId, quantity: qty },
  });

  return respond(cartId, isNew);
}

// PATCH /api/cart — set quantity { productId, quantity }
export async function PATCH(req: NextRequest) {
  const { productId, quantity } = await req.json().catch(() => ({}));
  if (!getProductById(productId)) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const { cartId, isNew } = await getOrCreateCart();
  const qty = Number(quantity) || 0;

  if (qty <= 0) {
    await prisma.cartItem.deleteMany({ where: { cartId, productId } });
  } else {
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      update: { quantity: qty },
      create: { cartId, productId, quantity: qty },
    });
  }

  return respond(cartId, isNew);
}

// DELETE /api/cart?productId=...  (remove one) or no param (clear all)
export async function DELETE(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  const { cartId, isNew } = await getOrCreateCart();

  if (productId) {
    await prisma.cartItem.deleteMany({ where: { cartId, productId } });
  } else {
    await prisma.cartItem.deleteMany({ where: { cartId } });
  }

  return respond(cartId, isNew);
}
