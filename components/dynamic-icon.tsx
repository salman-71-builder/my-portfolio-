import {
  Smartphone,
  Shirt,
  UtensilsCrossed,
  ToyBrick,
  Sparkles,
  Dumbbell,
  Wrench,
  Car,
  Briefcase,
  Luggage,
  Armchair,
  Factory,
  Laptop,
  Watch,
  Glasses,
  Gem,
  Bike,
  ShoppingBasket,
  ShoppingBag,
  Footprints,
  Lamp,
  Tablet,
  Sofa,
  Headphones,
  Flower2,
  SprayCan,
  type LucideIcon,
  Package,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Smartphone,
  Shirt,
  UtensilsCrossed,
  ToyBrick,
  Sparkles,
  Dumbbell,
  Wrench,
  Car,
  Briefcase,
  Luggage,
  Armchair,
  Factory,
  Laptop,
  Watch,
  Glasses,
  Gem,
  Bike,
  ShoppingBasket,
  ShoppingBag,
  Footprints,
  Lamp,
  Tablet,
  Sofa,
  Headphones,
  Flower2,
  SprayCan,
};

export function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? Package;
  return <Icon className={className} />;
}
