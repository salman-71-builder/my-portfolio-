import "server-only";

/**
 * bKash PGW (tokenized checkout) client — sandbox by default.
 *
 * Flow: grantToken → createPayment (returns bkashURL to redirect to) → after
 * the customer pays, bKash redirects to our callbackURL → executePayment
 * verifies and returns the trxID. Set the env vars below to enable it; sandbox
 * test credentials are published by bKash. Egress to *.bka.sh must be allowed.
 */

const BASE =
  process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
const APP_KEY = process.env.BKASH_APP_KEY || "";
const APP_SECRET = process.env.BKASH_APP_SECRET || "";
const USERNAME = process.env.BKASH_USERNAME || "";
const PASSWORD = process.env.BKASH_PASSWORD || "";

export function bkashConfigured(): boolean {
  return Boolean(APP_KEY && APP_SECRET && USERNAME && PASSWORD);
}

let tokenCache: { token: string; exp: number } | null = null;

async function grantToken(): Promise<string> {
  if (tokenCache && tokenCache.exp > Date.now()) return tokenCache.token;
  const res = await fetch(`${BASE}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: USERNAME,
      password: PASSWORD,
    },
    body: JSON.stringify({ app_key: APP_KEY, app_secret: APP_SECRET }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.id_token) throw new Error(data.statusMessage || "bKash token grant failed");
  // id_token is valid ~1h; cache for 50 min
  tokenCache = { token: data.id_token, exp: Date.now() + 50 * 60 * 1000 };
  return data.id_token;
}

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    authorization: token,
    "x-app-key": APP_KEY,
  };
}

export interface CreatePaymentResult {
  paymentID: string;
  bkashURL: string;
}

export async function createPayment(opts: {
  amount: number;
  invoice: string;
  callbackURL: string;
  payerReference: string;
}): Promise<CreatePaymentResult> {
  const token = await grantToken();
  const res = await fetch(`${BASE}/tokenized/checkout/create`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      mode: "0011", // checkout (URL based)
      payerReference: opts.payerReference,
      callbackURL: opts.callbackURL,
      amount: String(opts.amount),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: opts.invoice,
    }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.paymentID || !data.bkashURL) {
    throw new Error(data.statusMessage || "bKash create payment failed");
  }
  return { paymentID: data.paymentID, bkashURL: data.bkashURL };
}

export interface ExecuteResult {
  transactionStatus?: string;
  trxID?: string;
  amount?: string;
  paymentID?: string;
  statusMessage?: string;
}

export async function executePayment(paymentID: string): Promise<ExecuteResult> {
  const token = await grantToken();
  const res = await fetch(`${BASE}/tokenized/checkout/execute`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ paymentID }),
    cache: "no-store",
  });
  return (await res.json()) as ExecuteResult;
}
