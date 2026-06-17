/**
 * Pure furniture metadata + detection helpers.
 *
 * Kept free of any Three.js import so product cards / listings can detect
 * furniture without pulling the 3D bundle into their page chunk. The actual
 * 3D model builders live in `furniture-models.ts`.
 */

export type FurnitureType =
  | "sofa"
  | "table"
  | "chair"
  | "bed"
  | "wardrobe"
  | "shelf"
  | "desk"
  | "lamp"
  | "tvunit"
  | "generic";

export interface Dims {
  w: number;
  h: number;
  d: number;
} // metres

export const FURNITURE_DIMS: Record<FurnitureType, Dims> = {
  sofa: { w: 2.0, h: 0.85, d: 0.9 },
  table: { w: 1.4, h: 0.75, d: 0.8 },
  chair: { w: 0.5, h: 0.95, d: 0.55 },
  bed: { w: 2.0, h: 0.6, d: 1.6 },
  wardrobe: { w: 1.2, h: 2.0, d: 0.6 },
  shelf: { w: 0.9, h: 1.8, d: 0.32 },
  desk: { w: 1.3, h: 0.75, d: 0.65 },
  lamp: { w: 0.45, h: 1.5, d: 0.45 },
  tvunit: { w: 1.7, h: 0.5, d: 0.4 },
  generic: { w: 1.0, h: 1.0, d: 1.0 },
};

export interface ColorVariant {
  name: string;
  hex: string;
}

export const COLOR_VARIANTS: ColorVariant[] = [
  { name: "Walnut", hex: "#6b4a2b" },
  { name: "Charcoal", hex: "#33373d" },
  { name: "Sand", hex: "#c9b18c" },
  { name: "Navy", hex: "#1a2f5e" },
  { name: "Brick", hex: "#9c4a3c" },
];

const KEYWORDS: [RegExp, FurnitureType][] = [
  [/sofa|couch|loveseat|sectional/i, "sofa"],
  [/dining table|coffee table|table/i, "table"],
  [/desk/i, "desk"],
  [/chair|stool|seat/i, "chair"],
  [/bed|mattress/i, "bed"],
  [/wardrobe|closet|cabinet|dresser/i, "wardrobe"],
  [/shelf|shelv|bookcase|rack/i, "shelf"],
  [/tv unit|tv stand|media|console/i, "tvunit"],
  [/lamp|light|lantern/i, "lamp"],
];

export function detectFurnitureType(p: {
  name: string;
  category?: string;
  tags?: string[];
}): FurnitureType {
  const hay = `${p.name} ${(p.tags ?? []).join(" ")}`;
  for (const [re, type] of KEYWORDS) if (re.test(hay)) return type;
  if (p.category === "furniture") return "sofa";
  return "generic";
}

export function isFurnitureProduct(p: {
  category?: string;
  tags?: string[];
  name: string;
}): boolean {
  if (p.category === "furniture" || p.category === "home-decoration") return true;
  return KEYWORDS.some(([re]) => re.test(`${p.name} ${(p.tags ?? []).join(" ")}`));
}
