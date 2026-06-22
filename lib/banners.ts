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

/** Soft warm gradient for banners without an uploaded image (cycled by index).
 *  These are light → the carousel renders dark navy text over them. */
export const BANNER_GRADIENTS = [
  "from-[#f8d7d0] to-[#fff3ee]",
  "from-[#fff3ee] to-[#fbe2d8]",
  "from-[#fde4dc] to-[#f6d0c6]",
];
