export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string; // lucide icon name
  productCount: number;
  image: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    icon: "Smartphone",
    productCount: 1840,
    image: "https://picsum.photos/seed/electronics/600/400",
    description: "Phones, gadgets, components & accessories sourced at factory prices.",
  },
  {
    id: 2,
    name: "Fashion & Clothing",
    slug: "fashion-clothing",
    icon: "Shirt",
    productCount: 2310,
    image: "https://picsum.photos/seed/fashion/600/400",
    description: "Apparel, footwear & accessories for wholesale resale.",
  },
  {
    id: 3,
    name: "Home & Kitchen",
    slug: "home-kitchen",
    icon: "UtensilsCrossed",
    productCount: 1520,
    image: "https://picsum.photos/seed/home/600/400",
    description: "Cookware, storage, decor & everyday home essentials.",
  },
  {
    id: 4,
    name: "Toys & Games",
    slug: "toys-games",
    icon: "ToyBrick",
    productCount: 760,
    image: "https://picsum.photos/seed/toys/600/400",
    description: "Educational, electronic & outdoor toys in bulk.",
  },
  {
    id: 5,
    name: "Beauty & Health",
    slug: "beauty-health",
    icon: "Sparkles",
    productCount: 980,
    image: "https://picsum.photos/seed/beauty/600/400",
    description: "Cosmetics, skincare, wellness & personal care products.",
  },
  {
    id: 6,
    name: "Sports & Outdoor",
    slug: "sports-outdoor",
    icon: "Dumbbell",
    productCount: 640,
    image: "https://picsum.photos/seed/sports/600/400",
    description: "Fitness gear, camping & outdoor equipment.",
  },
  {
    id: 7,
    name: "Tools & Hardware",
    slug: "tools-hardware",
    icon: "Wrench",
    productCount: 1120,
    image: "https://picsum.photos/seed/tools/600/400",
    description: "Power tools, hand tools & hardware supplies.",
  },
  {
    id: 8,
    name: "Auto Parts",
    slug: "auto-parts",
    icon: "Car",
    productCount: 870,
    image: "https://picsum.photos/seed/auto/600/400",
    description: "Replacement parts & accessories for all vehicles.",
  },
  {
    id: 9,
    name: "Office Supplies",
    slug: "office-supplies",
    icon: "Briefcase",
    productCount: 540,
    image: "https://picsum.photos/seed/office/600/400",
    description: "Stationery, equipment & workspace essentials.",
  },
  {
    id: 10,
    name: "Bags & Luggage",
    slug: "bags-luggage",
    icon: "Luggage",
    productCount: 690,
    image: "https://picsum.photos/seed/bags/600/400",
    description: "Backpacks, handbags, travel cases & more.",
  },
  {
    id: 11,
    name: "Furniture",
    slug: "furniture",
    icon: "Armchair",
    productCount: 410,
    image: "https://picsum.photos/seed/furniture/600/400",
    description: "Home & office furniture at wholesale rates.",
  },
  {
    id: 12,
    name: "Industrial Goods",
    slug: "industrial-goods",
    icon: "Factory",
    productCount: 1260,
    image: "https://picsum.photos/seed/industrial/600/400",
    description: "Machinery, equipment & industrial supplies.",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
