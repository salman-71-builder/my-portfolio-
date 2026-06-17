export interface Supplier {
  id: string;
  name: string;
  location: string;
  rating: number;
  yearsActive: number;
  responseRate: number; // percentage
  verified: boolean;
  logo: string;
}

export const suppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Shenzhen TechWorld Co., Ltd",
    location: "Shenzhen, Guangdong",
    rating: 4.9,
    yearsActive: 12,
    responseRate: 98,
    verified: true,
    logo: "https://placehold.co/120x60/CC0000/FFFFFF?text=TechWorld",
  },
  {
    id: "sup-2",
    name: "Guangzhou Fashion Hub",
    location: "Guangzhou, Guangdong",
    rating: 4.7,
    yearsActive: 9,
    responseRate: 95,
    verified: true,
    logo: "https://placehold.co/120x60/CC0000/FFFFFF?text=FashionHub",
  },
  {
    id: "sup-3",
    name: "Yiwu Home Essentials",
    location: "Yiwu, Zhejiang",
    rating: 4.8,
    yearsActive: 15,
    responseRate: 99,
    verified: true,
    logo: "https://placehold.co/120x60/FFD700/000000?text=Yiwu+Home",
  },
  {
    id: "sup-4",
    name: "Dongguan PlayFactory",
    location: "Dongguan, Guangdong",
    rating: 4.6,
    yearsActive: 7,
    responseRate: 92,
    verified: true,
    logo: "https://placehold.co/120x60/CC0000/FFFFFF?text=PlayFactory",
  },
  {
    id: "sup-5",
    name: "Hangzhou Beauty Source",
    location: "Hangzhou, Zhejiang",
    rating: 4.8,
    yearsActive: 10,
    responseRate: 97,
    verified: true,
    logo: "https://placehold.co/120x60/FFD700/000000?text=BeautySource",
  },
  {
    id: "sup-6",
    name: "Ningbo Industrial Group",
    location: "Ningbo, Zhejiang",
    rating: 4.5,
    yearsActive: 18,
    responseRate: 90,
    verified: true,
    logo: "https://placehold.co/120x60/CC0000/FFFFFF?text=Ningbo+Ind",
  },
  {
    id: "sup-7",
    name: "Foshan Furniture Works",
    location: "Foshan, Guangdong",
    rating: 4.7,
    yearsActive: 14,
    responseRate: 94,
    verified: true,
    logo: "https://placehold.co/120x60/FFD700/000000?text=Foshan",
  },
  {
    id: "sup-8",
    name: "Wenzhou Auto Components",
    location: "Wenzhou, Zhejiang",
    rating: 4.4,
    yearsActive: 11,
    responseRate: 88,
    verified: true,
    logo: "https://placehold.co/120x60/CC0000/FFFFFF?text=Wenzhou+Auto",
  },
];

export function getSupplierById(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}
