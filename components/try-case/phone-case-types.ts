/**
 * Pure metadata + detection for phone-case try-on (no TF.js/Three import,
 * so product listings can use the detector without the heavy AR bundle).
 */

export interface PhoneModel {
  id: string;
  name: string;
  aspect: number; // height / width of the phone body
}

// Popular models (incl. ones common in Bangladesh). `aspect` drives mockup/label.
export const PHONE_MODELS: PhoneModel[] = [
  { id: "iphone15", name: "iPhone 15 / 15 Pro", aspect: 2.16 },
  { id: "iphone14", name: "iPhone 14 / 13", aspect: 2.16 },
  { id: "iphone12", name: "iPhone 12 / 11", aspect: 2.17 },
  { id: "galaxy-s24", name: "Samsung Galaxy S24 / S23", aspect: 2.2 },
  { id: "galaxy-s22", name: "Samsung Galaxy S22", aspect: 2.15 },
  { id: "xiaomi", name: "Xiaomi / Redmi", aspect: 2.23 },
  { id: "oppo", name: "Oppo", aspect: 2.2 },
  { id: "vivo", name: "Vivo", aspect: 2.2 },
  { id: "realme", name: "Realme", aspect: 2.22 },
  { id: "other", name: "Other Android", aspect: 2.2 },
];

export interface CaseDesign {
  id: string;
  name: string;
  material: "silicone" | "glossy" | "clear" | "leather" | "rugged";
  protection: number; // 1–5 drop-protection rating
}

export const CASE_DESIGNS: CaseDesign[] = [
  { id: "silicone", name: "Soft Silicone", material: "silicone", protection: 3 },
  { id: "glossy", name: "Glossy Hard", material: "glossy", protection: 2 },
  { id: "clear", name: "Clear Transparent", material: "clear", protection: 2 },
  { id: "leather", name: "Premium Leather", material: "leather", protection: 3 },
  { id: "rugged", name: "Rugged Armor", material: "rugged", protection: 5 },
];

export const CASE_COLORS: { name: string; hex: string }[] = [
  { name: "Midnight", hex: "#1c1c22" },
  { name: "Brick Red", hex: "#c0392b" },
  { name: "Navy", hex: "#1a2f5e" },
  { name: "Gold", hex: "#c9a227" },
  { name: "Forest", hex: "#1f5e3a" },
  { name: "Lavender", hex: "#9b8cce" },
];

export function isPhoneCaseProduct(p: {
  category?: string;
  tags?: string[];
  name: string;
}): boolean {
  const hay = `${p.name} ${(p.tags ?? []).join(" ")}`;
  return /case|cover|bumper|protector/i.test(hay) ||
    (p.category === "mobile-accessories" && /phone|mobile/i.test(hay));
}
