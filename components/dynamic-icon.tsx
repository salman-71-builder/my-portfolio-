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
