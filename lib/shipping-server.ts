import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RATES, type ShippingRates } from "@/lib/shipping";

/**
 * Current shipping rates: canonical defaults merged with any admin overrides
 * from the ShippingRate table. Falls back to defaults if the DB is unreachable.
 */
export async function getShippingRates(): Promise<ShippingRates> {
  const rates: ShippingRates = { ...DEFAULT_RATES };
  try {
    const rows = await prisma.shippingRate.findMany();
    for (const row of rows) rates[row.key] = row.perKg;
  } catch {
    /* DB unavailable — use defaults */
  }
  return rates;
}
