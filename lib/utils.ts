import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("BDT", "৳")
    .trim();
}

export function formatPriceRange(min: number, max: number): string {
  return `${formatBDT(min)} – ${formatBDT(max)}`;
}
