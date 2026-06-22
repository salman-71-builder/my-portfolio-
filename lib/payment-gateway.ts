/**
 * Payment gateway abstraction.
 *
 * Automated bKash / Nagad PGW integration plugs in HERE. Real integration
 * requires merchant credentials + outbound access to the PGW sandbox/live
 * hosts, which aren't available in this environment, so the default is a
 * MANUAL confirmation flow: the customer pays to the merchant number and
 * enters the Transaction ID, which we record and the admin verifies.
 *
 * To go live with bKash PGW:
 *   1. Set BKASH_APP_KEY / BKASH_APP_SECRET / BKASH_USERNAME / BKASH_PASSWORD
 *      (+ NAGAD_* equivalents) in env.
 *   2. Allow-list tokenized.sandbox.bka.sh / api.mynagad.com in egress.
 *   3. Implement createPayment()/executePayment() below to call the PGW REST
 *      API (grant token → create → execute) and verify the result server-side.
 *   4. Switch GATEWAY_MODE to "live".
 */

export type GatewayMode = "manual" | "live";
export const GATEWAY_MODE: GatewayMode =
  process.env.BKASH_APP_KEY ? "live" : "manual";

/** Whether automated PGW is configured for a method. */
export function isAutomated(method: string): boolean {
  if (GATEWAY_MODE !== "live") return false;
  return method === "bkash" || method === "nagad";
}

/** Validate a Bangladeshi mobile-wallet number (01XXXXXXXXX). */
export function isValidBdMobile(num: string): boolean {
  return /^01[3-9]\d{8}$/.test(num.replace(/[\s-]/g, ""));
}

/** Basic transaction-id sanity check (manual confirmation). */
export function isValidTxnId(txn: string): boolean {
  const t = txn.trim();
  return t.length >= 4 && t.length <= 40;
}
