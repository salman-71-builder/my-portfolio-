/**
 * Customer aggregation. ChinaCart has no separate customer table — customers
 * are derived from their orders, grouped by email. Pure module (no db imports)
 * so it runs on server and client.
 */
import { isRevenueStatus } from "@/lib/order-status";

export interface CustomerOrderInput {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  total: number;
  status: string;
  createdAt: string; // ISO
}

export interface Customer {
  id: string; // url-safe encoding of the email
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number; // revenue-status orders only
  avgOrderValue: number;
  joinDate: string; // earliest order ISO
  lastOrder: string; // latest order ISO
  active: boolean; // ordered within ACTIVE_DAYS
}

export const ACTIVE_DAYS = 60;

// url-safe base64 of the (lowercased) email — stable customer id for routing
export function encodeCustomerId(email: string): string {
  const b =
    typeof window === "undefined"
      ? Buffer.from(email.toLowerCase()).toString("base64")
      : btoa(email.toLowerCase());
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeCustomerId(id: string): string {
  const b = id.replace(/-/g, "+").replace(/_/g, "/");
  return typeof window === "undefined"
    ? Buffer.from(b, "base64").toString("utf8")
    : atob(b);
}

export function aggregateCustomers(orders: CustomerOrderInput[]): Customer[] {
  const groups = new Map<string, CustomerOrderInput[]>();
  for (const o of orders) {
    const key = o.email.toLowerCase();
    const arr = groups.get(key) ?? [];
    arr.push(o);
    groups.set(key, arr);
  }

  const now = Date.now();
  const customers: Customer[] = [];
  for (const [email, list] of Array.from(groups.entries())) {
    const sorted = [...list].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const latest = sorted[sorted.length - 1];
    const revenueOrders = list.filter((o) => isRevenueStatus(o.status));
    const totalSpent = revenueOrders.reduce((s, o) => s + o.total, 0);
    const totalOrders = list.length;
    customers.push({
      id: encodeCustomerId(email),
      name: latest.name,
      email: latest.email,
      phone: latest.phone,
      address: latest.address,
      city: latest.city,
      totalOrders,
      totalSpent,
      avgOrderValue: revenueOrders.length
        ? Math.round(totalSpent / revenueOrders.length)
        : 0,
      joinDate: sorted[0].createdAt,
      lastOrder: latest.createdAt,
      active:
        now - new Date(latest.createdAt).getTime() <= ACTIVE_DAYS * 86400000,
    });
  }
  return customers.sort((a, b) => b.totalSpent - a.totalSpent);
}

// ---- VIP tiers -------------------------------------------------------------

export type VipTier = "gold" | "silver" | "bronze" | null;

/** Rank 0/1/2 → gold/silver/bronze (only when the customer has spent > 0). */
export function vipTier(rankBySpend: number, spent: number): VipTier {
  if (spent <= 0) return null;
  if (rankBySpend === 0) return "gold";
  if (rankBySpend === 1) return "silver";
  if (rankBySpend === 2) return "bronze";
  return null;
}
export const VIP_MEDAL: Record<Exclude<VipTier, null>, string> = {
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
};

// ---- contact helpers (Bangladesh) ------------------------------------------

/** Normalise a BD mobile number to international digits (8801XXXXXXXXX). */
export function intlPhone(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("880")) return d;
  if (d.startsWith("0")) return "88" + d; // 017… → 88017…
  if (d.startsWith("1")) return "880" + d; // 17… → 880…
  return d;
}
export function waLink(phone: string, text?: string): string {
  const base = `https://wa.me/${intlPhone(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
export function telLink(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}
export function smsLink(phone: string, body?: string): string {
  return body
    ? `sms:${phone.replace(/\s/g, "")}?body=${encodeURIComponent(body)}`
    : `sms:${phone.replace(/\s/g, "")}`;
}
export function mailtoLink(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return `mailto:${email}${qs ? `?${qs}` : ""}`;
}

// ---- message templates -----------------------------------------------------

export const MESSAGE_TEMPLATES = [
  {
    key: "new_products",
    label: "New products arrived!",
    subject: "New arrivals at ChinaCart 🎉",
    body: "Hi {name}, fresh wholesale stock just landed at ChinaCart. Browse the latest imports and grab them before they sell out!",
  },
  {
    key: "discount",
    label: "Special discount for you!",
    subject: "A special discount just for you 🎁",
    body: "Hi {name}, as a valued ChinaCart customer you get an exclusive discount on your next bulk order. Reply to claim it!",
  },
  {
    key: "thank_you",
    label: "Thank you for your order!",
    subject: "Thank you for your order 🙏",
    body: "Hi {name}, thank you for ordering with ChinaCart! We're preparing your shipment and will keep you posted.",
  },
  {
    key: "win_back",
    label: "We miss you — come back!",
    subject: "We miss you at ChinaCart",
    body: "Hi {name}, it's been a while! Come back to ChinaCart for the best factory-direct wholesale prices from China.",
  },
] as const;

export function fillTemplate(text: string, name: string): string {
  return text.replace(/\{name\}/g, name.split(" ")[0] || name);
}

// ---- insights --------------------------------------------------------------

export function customerInsights(customers: Customer[]) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const newThisMonth = customers.filter(
    (c) => new Date(c.joinDate).getTime() >= monthStart
  ).length;
  const returning = customers.filter((c) => c.totalOrders > 1).length;
  const dormant = customers.filter((c) => !c.active).length;

  const byDistrict = new Map<string, number>();
  for (const c of customers) {
    const d = c.city || "Unknown";
    byDistrict.set(d, (byDistrict.get(d) ?? 0) + 1);
  }
  const districts = Array.from(byDistrict.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return {
    total: customers.length,
    newThisMonth,
    returning,
    dormant,
    districts,
  };
}

/** Customer count by join month for the last 12 months (growth graph). */
export function growthSeries(customers: Customer[]) {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const counts = new Map(keys.map((k) => [k, 0]));
  for (const c of customers) {
    const k = c.joinDate.slice(0, 7);
    if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return keys.map((k) => ({
    label: MONTHS[Number(k.slice(5)) - 1],
    value: counts.get(k) ?? 0,
  }));
}
