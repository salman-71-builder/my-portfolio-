import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart-server";
import { placeOrder } from "@/lib/place-order";
import { executePayment } from "@/lib/bkash";

export const dynamic = "force-dynamic";

// GET /api/bkash/callback?ref=<pendingId>&paymentID=...&status=success|failure|cancel
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const ref = req.nextUrl.searchParams.get("ref") ?? "";
  const paymentID = req.nextUrl.searchParams.get("paymentID") ?? "";
  const status = req.nextUrl.searchParams.get("status") ?? "";

  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/checkout?pay=${reason}`);

  const pending = ref
    ? await prisma.pendingCheckout.findUnique({ where: { id: ref } }).catch(() => null)
    : null;
  if (!pending) return fail("expired");

  if (status !== "success" || !paymentID) {
    await prisma.pendingCheckout.delete({ where: { id: pending.id } }).catch(() => {});
    return fail(status === "cancel" ? "cancelled" : "failed");
  }

  try {
    const exec = await executePayment(paymentID);
    if (exec.transactionStatus !== "Completed" || !exec.trxID) {
      await prisma.pendingCheckout.delete({ where: { id: pending.id } }).catch(() => {});
      return fail("failed");
    }

    const { cartId } = await getOrCreateCart();
    const result = await placeOrder({
      cartId,
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      address: pending.address,
      city: pending.city,
      note: pending.note,
      method: "bkash",
      advanceAmount: pending.advanceAmount,
      txnId: exec.trxID,
    });

    await prisma.pendingCheckout.delete({ where: { id: pending.id } }).catch(() => {});

    if (!result.ok) return fail("failed");
    await prisma.cartItem.deleteMany({ where: { cartId } });
    return NextResponse.redirect(`${origin}/orders/${result.id}`);
  } catch {
    return fail("failed");
  }
}
