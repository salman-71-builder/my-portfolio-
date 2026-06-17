export interface Supplier {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  yearsActive: number;
  responseRate: string;
  verified: boolean;
  logo: string;
}

export const suppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Shenzhen TechWave Co.",
    location: "Shenzhen, Guangdong",
    rating: 4.9,
    reviews: 3120,
    yearsActive: 9,
    responseRate: "98%",
    verified: true,
    logo: "https://picsum.photos/seed/sup1/120/120",
  },
  {
    id: "sup-2",
    name: "Guangzhou Fashion Hub",
    location: "Guangzhou, Guangdong",
    rating: 4.7,
    reviews: 2280,
    yearsActive: 7,
    responseRate: "95%",
    verified: true,
    logo: "https://picsum.photos/seed/sup2/120/120",
  },
  {
    id: "sup-3",
    name: "Yiwu Home Living",
    location: "Yiwu, Zhejiang",
    rating: 4.8,
    reviews: 1890,
    yearsActive: 11,
    responseRate: "97%",
    verified: true,
    logo: "https://picsum.photos/seed/sup3/120/120",
  },
  {
    id: "sup-4",
    name: "Ningbo Tools Group",
    location: "Ningbo, Zhejiang",
    rating: 4.6,
    reviews: 1450,
    yearsActive: 13,
    responseRate: "93%",
    verified: true,
    logo: "https://picsum.photos/seed/sup4/120/120",
  },
  {
    id: "sup-5",
    name: "Dongguan Beauty World",
    location: "Dongguan, Guangdong",
    rating: 4.8,
    reviews: 2010,
    yearsActive: 6,
    responseRate: "96%",
    verified: true,
    logo: "https://picsum.photos/seed/sup5/120/120",
  },
  {
    id: "sup-6",
    name: "Hangzhou Auto Parts",
    location: "Hangzhou, Zhejiang",
    rating: 4.5,
    reviews: 980,
    yearsActive: 8,
    responseRate: "91%",
    verified: true,
    logo: "https://picsum.photos/seed/sup6/120/120",
  },
];

export function getSupplierById(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}
