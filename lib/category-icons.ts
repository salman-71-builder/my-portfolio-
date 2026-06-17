import {
  Smartphone,
  Shirt,
  CookingPot,
  ToyBrick,
  Sparkles,
  Dumbbell,
  Wrench,
  Car,
  Briefcase,
  Luggage,
  Armchair,
  Factory,
  Package,
  type LucideIcon,
} from "lucide-react";

/** Maps the icon name stored in category data to a Lucide component. */
export const categoryIcons: Record<string, LucideIcon> = {
  Smartphone,
  Shirt,
  CookingPot,
  ToyBrick,
  Sparkles,
  Dumbbell,
  Wrench,
  Car,
  Briefcase,
  Luggage,
  Armchair,
  Factory,
};

export function getCategoryIcon(name: string): LucideIcon {
  return categoryIcons[name] ?? Package;
}
