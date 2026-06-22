import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { getPaymentSettings } from "@/lib/payment-settings-server";
import { bkashConfigured } from "@/lib/bkash";

export const dynamic = "force-dynamic";

// GET — public (checkout reads enabled methods, numbers, min advance %)
export async function GET() {
  return NextResponse.json({
    settings: await getPaymentSettings(),
    gateway: { bkash: bkashConfigured() },
  });
}

// POST — admin only (update settings)
export async function POST(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const str = (v: unknown) => (v == null || v === "" ? null : String(v).slice(0, 120));
  const data = {
    minAdvancePct: Math.min(100, Math.max(0, Math.round(Number(body.minAdvancePct) || 30))),
    bkashEnabled: body.bkashEnabled !== false,
    nagadEnabled: body.nagadEnabled !== false,
    rocketEnabled: body.rocketEnabled !== false,
    bankEnabled: body.bankEnabled !== false,
    bkashNumber: str(body.bkashNumber),
    nagadNumber: str(body.nagadNumber),
    rocketNumber: str(body.rocketNumber),
    bankName: str(body.bankName),
    bankAccountName: str(body.bankAccountName),
    bankAccountNumber: str(body.bankAccountNumber),
    bankBranch: str(body.bankBranch),
    bankRouting: str(body.bankRouting),
  };
  try {
    await prisma.paymentSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...data },
      update: data,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
