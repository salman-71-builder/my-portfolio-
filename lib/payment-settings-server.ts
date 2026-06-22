import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PAYMENT_SETTINGS, type PaymentSettings } from "@/lib/payment-settings";

/** Payment settings singleton (id="default"); falls back to defaults. */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const row = await prisma.paymentSettings.findUnique({ where: { id: "default" } });
    if (!row) return DEFAULT_PAYMENT_SETTINGS;
    return {
      minAdvancePct: row.minAdvancePct,
      bkashEnabled: row.bkashEnabled,
      nagadEnabled: row.nagadEnabled,
      rocketEnabled: row.rocketEnabled,
      bankEnabled: row.bankEnabled,
      bkashNumber: row.bkashNumber,
      nagadNumber: row.nagadNumber,
      rocketNumber: row.rocketNumber,
      bankName: row.bankName,
      bankAccountName: row.bankAccountName,
      bankAccountNumber: row.bankAccountNumber,
      bankBranch: row.bankBranch,
      bankRouting: row.bankRouting,
    };
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
}
