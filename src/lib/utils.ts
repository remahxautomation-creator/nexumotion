import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export const STOCK_LABELS: Record<string, { label: string; className: string }> = {
  IN_STOCK: { label: "In Stock", className: "bg-emerald-100 text-emerald-800" },
  LOW_STOCK: { label: "Low Stock", className: "bg-amber-100 text-amber-800" },
  OUT_OF_STOCK: { label: "Out of Stock", className: "bg-red-100 text-red-800" },
  BACKORDER: { label: "Backorder", className: "bg-blue-100 text-blue-800" },
};

export function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
