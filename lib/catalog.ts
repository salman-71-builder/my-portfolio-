import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";
import { estimateWeight, detectShipClass } from "@/lib/shipping";
import {
  products as localProducts,
  getProductById as localGetProductById,
} from "@/data/products";
import { categories as localCategories } from "@/data/categories";

/**
 * Data-source abstraction layer.
 *
 * Currently backed by the free, no-key DummyJSON API (https://dummyjson.com).
 * Everything the UI needs goes through the functions in this file, mapped into
 * our internal `Product` / `Category` shapes. To switch to CJ Dropshipping
 * later, only this file needs to change — swap `BASE_URL`, the fetch paths and
 * the `mapProduct` / `mapCategory` functions; the rest of the app is untouched.
 *
 * If the API is unreachable (e.g. the host isn't allow-listed for outbound
 * egress) we transparently fall back to the bundled sample data so the site
 * keeps working.
 */

const BASE_URL = "https://dummyjson.com";
const USD_TO_BDT = 120; // DummyJSON prices are USD; we display BDT.
const REVALIDATE_SECONDS = 600;

// ---------------------------------------------------------------------------
// Raw DummyJSON types (only the fields we use)
// ---------------------------------------------------------------------------

interface DJProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: { width: number; height: number; depth: number };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  reviews?: unknown[];
  images?: string[];
  thumbnail?: string;
}

interface DJCategory {
  slug: string;
  name: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

async function djFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`DummyJSON ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, string> = {
  beauty: "Sparkles",
  fragrances: "SprayCan",
  furniture: "Sofa",
  groceries: "ShoppingBasket",
  "home-decoration": "Lamp",
  "kitchen-accessories": "UtensilsCrossed",
  laptops: "Laptop",
  "mens-shirts": "Shirt",
  "mens-shoes": "Footprints",
  "mens-watches": "Watch",
  "mobile-accessories": "Headphones",
  motorcycle: "Bike",
  "skin-care": "Flower2",
  smartphones: "Smartphone",
  "sports-accessories": "Dumbbell",
  sunglasses: "Glasses",
  tablets: "Tablet",
  tops: "Shirt",
  vehicle: "Car",
  "womens-bags": "ShoppingBag",
  "womens-dresses": "Shirt",
  "womens-jewellery": "Gem",
  "womens-shoes": "Footprints",
  "womens-watches": "Watch",
};

function iconForCategory(slug: string): string {
  return CATEGORY_ICONS[slug] ?? "Package";
}

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function mapProduct(raw: DJProduct): Product {
  const base = Math.round(raw.price * USD_TO_BDT);
  const discount = Math.round(raw.discountPercentage ?? 0);
  const priceMax = Math.max(base, 1);
  const priceMin = Math.max(1, Math.round(base * (1 - Math.max(discount, 8) / 100)));
  const rating = Number((raw.rating ?? 4.5).toFixed(1));
  // Deterministic, real-looking review count.
  const reviews = 80 + ((raw.id * 137) % 1850);
  const dims = raw.dimensions;

  const specs = [
    raw.brand ? { label: "Brand", value: raw.brand } : null,
    raw.sku ? { label: "SKU", value: raw.sku } : null,
    raw.weight ? { label: "Weight", value: `${raw.weight} kg` } : null,
    dims
      ? {
          label: "Dimensions",
          value: `${dims.width} × ${dims.height} × ${dims.depth} cm`,
        }
      : null,
    raw.warrantyInformation
      ? { label: "Warranty", value: raw.warrantyInformation }
      : null,
    raw.shippingInformation
      ? { label: "Shipping", value: raw.shippingInformation }
      : null,
    raw.returnPolicy
      ? { label: "Return Policy", value: raw.returnPolicy }
      : null,
    raw.availabilityStatus
      ? { label: "Availability", value: raw.availabilityStatus }
      : null,
    { label: "Place of Origin", value: "China" },
  ].filter(Boolean) as { label: string; value: string }[];

  const images =
    raw.images && raw.images.length > 0
      ? raw.images
      : raw.thumbnail
        ? [raw.thumbnail]
        : [];

  return {
    id: String(raw.id),
    name: raw.title,
    category: raw.category,
    images,
    priceMin,
    priceMax,
    moq: raw.minimumOrderQuantity ?? 10,
    rating,
    reviews,
    supplierId: `sup-${(raw.id % 6) + 1}`,
    isHot: rating >= 4.6,
    isNew: raw.id > 180,
    discount,
    shippingDays: `${5 + (raw.id % 5)}-${11 + (raw.id % 7)} days`,
    description: raw.description,
    specs,
    tags: raw.tags ?? [],
    weight: estimateWeight(raw.category, raw.title),
    shipClass: detectShipClass(raw.category, raw.title, raw.tags ?? []),
  };
}

// ---------------------------------------------------------------------------
// Public API (used throughout the app)
// ---------------------------------------------------------------------------

let allProductsCache: Product[] | null = null;

/** All products, mapped to our shape. Cached in-process; falls back to sample data. */
export async function getAllProducts(): Promise<Product[]> {
  if (allProductsCache) return allProductsCache;
  try {
    const data = await djFetch<{ products: DJProduct[] }>("/products?limit=0");
    const mapped = data.products.map(mapProduct).filter((p) => p.images.length);
    allProductsCache = mapped;
    return mapped;
  } catch {
    return localProducts;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const raw = await djFetch<DJProduct>(`/products/${encodeURIComponent(id)}`);
    return mapProduct(raw);
  } catch {
    return localGetProductById(id) ?? null;
  }
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  try {
    const data = await djFetch<{ products: DJProduct[] }>(
      `/products/category/${encodeURIComponent(slug)}?limit=0`
    );
    return data.products.map(mapProduct).filter((p) => p.images.length);
  } catch {
    return localProducts.filter((p) => p.category === slug);
  }
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const inCategory = await getProductsByCategory(product.category);
  return inCategory.filter((p) => p.id !== product.id).slice(0, limit);
}

/** Smart search across name, category, tags and description. */
export async function searchProducts(query: string): Promise<Product[]> {
  const all = await getAllProducts();
  const q = query.trim().toLowerCase();
  if (!q) return all;
  const terms = q.split(/\s+/);
  return all
    .map((p) => {
      const haystack =
        `${p.name} ${p.category} ${p.tags.join(" ")} ${p.description}`.toLowerCase();
      const score = terms.reduce(
        (acc, t) => acc + (haystack.includes(t) ? 1 : 0),
        0
      );
      return { p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.p);
}

export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  const all = await getAllProducts();
  return [...all].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export async function getNewProducts(limit = 8): Promise<Product[]> {
  const all = await getAllProducts();
  const fresh = all.filter((p) => p.isNew);
  return (fresh.length >= limit ? fresh : all).slice(0, limit);
}

export async function getFlashDeals(limit = 6): Promise<Product[]> {
  const all = await getAllProducts();
  return [...all]
    .filter((p) => p.discount >= 12)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, limit);
}

let categoriesCache: Category[] | null = null;

export async function getCategories(): Promise<Category[]> {
  if (categoriesCache) return categoriesCache;
  try {
    const [cats, all] = await Promise.all([
      djFetch<DJCategory[]>("/products/categories"),
      getAllProducts(),
    ]);

    const counts = new Map<string, number>();
    const images = new Map<string, string>();
    for (const p of all) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
      if (!images.has(p.category) && p.images[0])
        images.set(p.category, p.images[0]);
    }

    const mapped = cats.map((c, i) => ({
      id: i + 1,
      name: c.name,
      slug: c.slug,
      icon: iconForCategory(c.slug),
      productCount: counts.get(c.slug) ?? 0,
      image:
        images.get(c.slug) ??
        `https://picsum.photos/seed/${c.slug}/600/400`,
      description: `Wholesale ${c.name.toLowerCase()} sourced directly from China at factory prices.`,
    }));
    categoriesCache = mapped;
    return mapped;
  } catch {
    return localCategories;
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | undefined> {
  const cats = await getCategories();
  const found = cats.find((c) => c.slug === slug);
  if (found) return found;
  // Synthesize a label so breadcrumbs/titles still read well.
  return {
    id: 0,
    name: titleCaseSlug(slug),
    slug,
    icon: iconForCategory(slug),
    productCount: 0,
    image: `https://picsum.photos/seed/${slug}/600/400`,
    description: "",
  };
}
