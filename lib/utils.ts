import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Bangladeshi Taka. */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}
