export interface Category {
  name: string;
  slug: string;
  icon: string; // lucide-react icon name
  productCount: number;
  image: string;
  description: string;
}

export const categories: Category[] = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: "Smartphone",
    productCount: 1840,
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
    description: "Gadgets, accessories & consumer electronics direct from Shenzhen.",
  },
  {
    name: "Fashion & Clothing",
    slug: "fashion-clothing",
    icon: "Shirt",
    productCount: 2310,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
    description: "Apparel, footwear & accessories for every season.",
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    icon: "CookingPot",
    productCount: 1560,
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80",
    description: "Cookware, storage & smart home essentials.",
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    icon: "ToyBrick",
    productCount: 980,
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&q=80",
    description: "Educational toys, RC models & board games.",
  },
  {
    name: "Beauty & Health",
    slug: "beauty-health",
    icon: "Sparkles",
    productCount: 1230,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
    description: "Cosmetics, skincare & wellness products.",
  },
  {
    name: "Sports & Outdoor",
    slug: "sports-outdoor",
    icon: "Dumbbell",
    productCount: 870,
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80",
    description: "Fitness gear, camping & outdoor equipment.",
  },
  {
    name: "Tools & Hardware",
    slug: "tools-hardware",
    icon: "Wrench",
    productCount: 740,
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80",
    description: "Power tools, hand tools & hardware supplies.",
  },
  {
    name: "Auto Parts",
    slug: "auto-parts",
    icon: "Car",
    productCount: 650,
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
    description: "Spare parts, accessories & car electronics.",
  },
  {
    name: "Office Supplies",
    slug: "office-supplies",
    icon: "Briefcase",
    productCount: 520,
    image: "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=600&q=80",
    description: "Stationery, printing & office equipment.",
  },
  {
    name: "Bags & Luggage",
    slug: "bags-luggage",
    icon: "Luggage",
    productCount: 610,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    description: "Backpacks, handbags & travel luggage.",
  },
  {
    name: "Furniture",
    slug: "furniture",
    icon: "Armchair",
    productCount: 430,
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&q=80",
    description: "Office & home furniture in bulk.",
  },
  {
    name: "Industrial Goods",
    slug: "industrial-goods",
    icon: "Factory",
    productCount: 390,
    image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&q=80",
    description: "Machinery, equipment & industrial supplies.",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
