import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { EGP_PER_USD } from "./pricing";

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

/**
 * EGP figure for display alongside the USD price. Always formatted with Latin
 * digits so the number reads identically in both site languages — a price is a
 * figure, not prose.
 */
export function formatEgp(usd: number | string) {
  const egp = Math.round(Number(usd) * EGP_PER_USD);
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(egp)} EGP`;
}

export function formatWeight(kg: number) {
  return kg < 1 ? `${Math.round(kg * 1000)} g` : `${kg.toFixed(kg < 10 ? 1 : 0)} kg`;
}

// `labelKey` feeds the i18n dictionary; `label` stays as an English fallback for
// contexts without a translator (emails, exports, logs).
export const STOCK_LABELS: Record<
  string,
  { label: string; labelKey: "stock.inStock" | "stock.lowStock" | "stock.outOfStock" | "stock.backorder"; className: string }
> = {
  IN_STOCK: { label: "In Stock", labelKey: "stock.inStock", className: "bg-emerald-100 text-emerald-800" },
  LOW_STOCK: { label: "Low Stock", labelKey: "stock.lowStock", className: "bg-amber-100 text-amber-800" },
  OUT_OF_STOCK: { label: "Out of Stock", labelKey: "stock.outOfStock", className: "bg-red-100 text-red-800" },
  BACKORDER: { label: "Backorder", labelKey: "stock.backorder", className: "bg-blue-100 text-blue-800" },
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
