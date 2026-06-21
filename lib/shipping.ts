/**
 * Shipping rates + product classification for the bulk calculator.
 * Pure module (no db imports) so it runs on server and client.
 *
 * Two methods — AIR (fast, pricier) and SHIP (sea, cheaper, slower). Air rate
 * depends on the product's shipping class:
 *   - Category A  (general goods)        — flat per-kg
 *   - Category B  (restricted/sensitive) — flat per-kg
 *   - Category C  (special item types)   — fixed per-kg by item type
 * Ship rates mirror the same classes at a lower placeholder (admin-editable).
 */

import type { Product } from "@/data/products";

export type ShipMethod = "air" | "ship";
export type ShippingCategory = "A" | "B" | "C";

/** Category-C special item types with their AIR per-kg rate (per spec). */
export const C_ITEMS = [
  { key: "clothing", label: "Clothing / Garments", air: 800 },
  { key: "food", label: "Food products", air: 1220 },
  { key: "knife", label: "Kitchen knife", air: 1200 },
  { key: "cosmetics", label: "Liquid / Cosmetics", air: 1180 },
  { key: "powerbank", label: "Battery / Power bank", air: 1350 },
  { key: "hijab", label: "Hijab / Orna (scarf)", air: 800 },
  { key: "powder", label: "Powder-type items", air: 1220 },
  { key: "sunglasses", label: "Sunglasses", air: 3500 },
  { key: "cccamera", label: "CC Camera", air: 1500 },
  { key: "smartwatch", label: "Smart watch", air: 1220 },
  { key: "watch", label: "Normal watch", air: 1150 },
  { key: "bluetooth", label: "Bluetooth headphone", air: 1220 },
] as const;

export type CItemKey = (typeof C_ITEMS)[number]["key"];
/** A product's shipping class: "A", "B", or a Category-C item key. */
export type ShipClass = "A" | "B" | CItemKey;

export const AIR_CATEGORY_RATE = { A: 780, B: 1180 } as const;
/** Ship (sea) is cheaper — placeholder ratio of air, admin-editable later. */
export const SHIP_RATIO = 0.4;

export const DELIVERY_TIME: Record<ShipMethod, string> = {
  air: "7–15 days",
  ship: "30–45 days",
};
export const METHOD_LABEL: Record<ShipMethod, string> = {
  air: "By Air ✈️",
  ship: "By Ship 🚢",
};

export type ShippingRates = Record<string, number>;

/** rate key e.g. "air_A", "ship_B", "air_sunglasses". */
export function rateKey(method: ShipMethod, cls: ShipClass): string {
  return `${method}_${cls}`;
}

/** Canonical default rate table (air per spec, ship = air × SHIP_RATIO). */
export const DEFAULT_RATES: ShippingRates = (() => {
  const r: ShippingRates = {};
  r.air_A = AIR_CATEGORY_RATE.A;
  r.air_B = AIR_CATEGORY_RATE.B;
  r.ship_A = Math.round(AIR_CATEGORY_RATE.A * SHIP_RATIO);
  r.ship_B = Math.round(AIR_CATEGORY_RATE.B * SHIP_RATIO);
  for (const it of C_ITEMS) {
    r[`air_${it.key}`] = it.air;
    r[`ship_${it.key}`] = Math.round(it.air * SHIP_RATIO);
  }
  return r;
})();

/** Editable rate metadata for the admin panel (label + group + key). */
export const RATE_FIELDS: { key: string; label: string; group: string }[] = [
  { key: "air_A", label: "Category A", group: "Air — Categories" },
  { key: "air_B", label: "Category B", group: "Air — Categories" },
  { key: "ship_A", label: "Category A", group: "Ship — Categories" },
  { key: "ship_B", label: "Category B", group: "Ship — Categories" },
  ...C_ITEMS.map((it) => ({ key: `air_${it.key}`, label: it.label, group: "Air — Category C (item-wise)" })),
  ...C_ITEMS.map((it) => ({ key: `ship_${it.key}`, label: it.label, group: "Ship — Category C (item-wise)" })),
];

export function categoryOf(cls: ShipClass): ShippingCategory {
  if (cls === "A") return "A";
  if (cls === "B") return "B";
  return "C";
}

export function shipClassLabel(cls: ShipClass): string {
  if (cls === "A") return "Category A (general goods)";
  if (cls === "B") return "Category B (restricted)";
  return C_ITEMS.find((c) => c.key === cls)?.label ?? cls;
}

// ---- auto-detection --------------------------------------------------------

function has(text: string, ...words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

/** Infer a product's shipping class from its category, name and tags. */
export function detectShipClass(
  category: string,
  name: string,
  tags: string[] = []
): ShipClass {
  const t = `${category} ${name} ${tags.join(" ")}`.toLowerCase();

  // Category C — specific item types (most specific first)
  if (has(t, "sunglass", "shades", "eyewear")) return "sunglasses";
  if (has(t, "smartwatch", "smart watch", "fitness band", "smart band")) return "smartwatch";
  if (has(t, "power bank", "powerbank")) return "powerbank";
  if (has(t, "cctv", "cc camera", "security camera", "surveillance", "ip camera")) return "cccamera";
  if (has(t, "bluetooth", "earbud", "headphone", "earphone", "headset", "tws", "airpod")) return "bluetooth";
  if (has(t, "watch") && !has(t, "watchband")) return "watch";
  if (has(t, "knife", "cleaver")) return "knife";
  if (has(t, "hijab", "orna", "scarf", "borka", "burka", "niqab")) return "hijab";
  if (has(t, "powder", "protein", "flour", "supplement")) return "powder";
  if (has(t, "cosmetic", "lipstick", "serum", "lotion", "perfume", "fragrance", "cream", "liquid", "skincare", "skin care", "beauty", "makeup", "shampoo")) return "cosmetics";
  if (has(t, "food", "grocery", "groceries", "snack", "spice", "tea ", "coffee", "honey", "chocolate")) return "food";
  if (has(t, "shirt", "t-shirt", "tshirt", "dress", "garment", "hoodie", "jacket", "saree", "panjabi", "kurti", "trouser", "jeans", "pant", "tops", "clothing", "apparel", "blouse")) return "clothing";

  // Category B — restricted / sensitive
  if (has(t, "battery", "magnet", "laser", "chemical", "seed", "live plant", "network", "router", "switch", "copy", "replica", "duplicate")) return "B";

  // Default — Category A (general goods)
  return "A";
}

/** Estimate per-unit weight (kg) from category / name keywords. */
export function estimateWeight(category: string, name: string): number {
  const t = `${category} ${name}`.toLowerCase();
  if (has(t, "phone case", "phone cover", "case")) return 0.05;
  if (has(t, "sunglass", "jewel", "jewellery", "ring", "necklace", "earring")) return 0.1;
  if (has(t, "smartwatch", "smart watch", "watch")) return 0.15;
  if (has(t, "earbud", "headphone", "earphone", "headset", "tws")) return 0.3;
  if (has(t, "shoe", "sneaker", "boot", "footwear")) return 0.8;
  if (has(t, "bag", "backpack", "handbag")) return 0.5;
  if (has(t, "furniture", "sofa", "chair", "table", "desk", "bed")) return 12;
  if (has(t, "shirt", "dress", "cloth", "garment", "tshirt", "t-shirt", "hijab", "scarf", "tops", "hoodie")) return 0.3;
  if (has(t, "kitchen", "knife", "cookware", "utensil", "pan", "pot")) return 0.5;
  if (has(t, "laptop", "tablet")) return 1.5;
  if (has(t, "phone", "smartphone", "electronic", "camera", "speaker", "power bank", "powerbank")) return 0.3;
  // category-level fallbacks
  if (category.includes("furniture")) return 12;
  if (category.includes("fashion") || category.includes("cloth")) return 0.3;
  if (category.includes("kitchen") || category.includes("home")) return 0.5;
  if (category.includes("sports") || category.includes("tools")) return 1;
  return 0.4;
}

// ---- resolvers (use explicit product field, else auto-detect) --------------

export function resolveWeight(product: Product): number {
  return product.weight ?? estimateWeight(product.category, product.name);
}
export function resolveShipClass(product: Product): ShipClass {
  return (product.shipClass as ShipClass) ?? detectShipClass(product.category, product.name, product.tags);
}

// ---- calculation -----------------------------------------------------------

export function getRate(
  rates: ShippingRates,
  method: ShipMethod,
  cls: ShipClass
): number {
  return rates[rateKey(method, cls)] ?? rates[rateKey(method, "A")] ?? 0;
}

export interface ShippingQuote {
  method: ShipMethod;
  cls: ShipClass;
  category: ShippingCategory;
  ratePerKg: number;
  totalWeight: number;
  cost: number;
  deliveryTime: string;
}

export function calcShipping(
  rates: ShippingRates,
  method: ShipMethod,
  cls: ShipClass,
  totalWeightKg: number
): ShippingQuote {
  const ratePerKg = getRate(rates, method, cls);
  return {
    method,
    cls,
    category: categoryOf(cls),
    ratePerKg,
    totalWeight: totalWeightKg,
    cost: Math.round(ratePerKg * totalWeightKg),
    deliveryTime: DELIVERY_TIME[method],
  };
}
