/** Hero banner shape + built-in fallback slides (used when none are configured). */

export interface Banner {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  ctaHref: string | null;
  sortOrder: number;
  active: boolean;
}

/** Shown when the admin hasn't added any banners yet (gradient placeholders). */
export const DEFAULT_BANNERS: Banner[] = [
  {
    id: "default-1",
    imageUrl: "",
    title: "Wholesale from China, delivered to Bangladesh",
    subtitle: "10,000+ products · 500+ verified suppliers · transparent BDT pricing",
    ctaText: "Shop all products",
    ctaHref: "/products",
    sortOrder: 0,
    active: true,
  },
  {
    id: "default-2",
    imageUrl: "",
    title: "We handle customs — door-to-door delivery",
    subtitle: "No import license needed · Air & Sea freight available",
    ctaText: "See how it works",
    ctaHref: "/how-it-works",
    sortOrder: 1,
    active: true,
  },
  {
    id: "default-3",
    imageUrl: "",
    title: "Today's Deals — up to 60% off",
    subtitle: "Factory-direct prices, trusted by 50,000+ Bangladeshi businesses",
    ctaText: "Browse deals",
    ctaHref: "/products?sort=popular",
    sortOrder: 2,
    active: true,
  },
];

/** Gradient used for banners without an uploaded image (cycled by index). */
export const BANNER_GRADIENTS = [
  "from-[#1a2f5e] to-[#22407a]",
  "from-[#7a1f17] to-[#c0392b]",
  "from-[#0f3d2e] to-[#1b7a52]",
];
