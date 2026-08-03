// Single source of truth for order pricing.
//
// These rules previously lived in three places — the checkout UI, the order
// API, and the quote-acceptance path (which had the VAT rate hardcoded rather
// than referencing a constant). Client and server each computing their own
// total is a correctness risk: if they drift, the customer is shown one figure
// and charged another.

export const VAT_RATE = 0.14; // Egypt VAT

// ── Currency ───────────────────────────────────────────────────────────────
// Prices are stored in USD. EGP is a display conversion only — nothing is
// stored in EGP, so changing this rate never rewrites historical orders.
// Review it against the market rate; it is not fetched live.
export const EGP_PER_USD = 48.5;
export const CURRENCY_RATE_REVIEWED = "2026-08";

export function usdToEgp(usd: number): number {
  return Math.round(usd * EGP_PER_USD);
}

// ── Shipping ───────────────────────────────────────────────────────────────
// Charged on billable weight: a base handling fee plus a per-kg rate, so a
// pallet of contactors no longer ships for the same price as one relay.
//
// Only ~13% of catalogue lines carry a real weight, so anything without one
// falls back to a per-category estimate (see DEFAULT_CATEGORY_WEIGHT_KG).
// Those estimates are for quoting only — confirm against the actual carrier
// rate before shipping a heavy order.
export const SHIPPING_BASE = 12;          // handling, per order
export const SHIPPING_PER_KG = 4.5;       // USD per billable kg
export const SHIPPING_MIN = 12;           // never charge less than this
export const FREE_SHIPPING_OVER = 1000;   // subtotal threshold, USD
export const FREE_SHIPPING_MAX_KG = 25;   // ...but not for freight-weight orders

/** Fallback shipping weight per category slug, in kg per unit. */
export const DEFAULT_CATEGORY_WEIGHT_KG: Record<string, number> = {
  "plc-controllers": 0.6,
  "i-o-modules": 0.3,
  "drives-vfds": 4.0,
  "hmi-visualization": 1.2,
  "servo-motion": 5.0,
  "motor-control": 0.5,
  "sensors-switches": 0.15,
  safety: 0.4,
  "power-supplies": 0.8,
  "industrial-networking": 0.5,
  "relays-timers": 0.15,
  pneumatics: 0.5,
  hydraulics: 3.0,
  "process-instruments": 1.0,
  "dcs-scada": 2.0,
  robotics: 15.0,
  "cables-connectors": 0.25,
  "operator-devices": 0.1,
  encoders: 0.4,
  "temperature-controllers": 0.3,
  "test-measurement": 1.0,
  "tools-workshop": 1.5,
  "electronic-components": 0.05,
  "enclosures-cooling": 3.0,
};

export const FALLBACK_WEIGHT_KG = 0.5;

/** Per-unit shipping weight, preferring the real figure over the estimate. */
export function unitWeightKg(weightKg: number | null | undefined, categorySlug?: string): number {
  if (typeof weightKg === "number" && weightKg > 0) return weightKg;
  return (categorySlug && DEFAULT_CATEGORY_WEIGHT_KG[categorySlug]) || FALLBACK_WEIGHT_KG;
}

export type ShipmentLine = { qty: number; weightKg?: number | null; categorySlug?: string };

/** Total billable weight for a set of order lines. */
export function totalWeightKg(lines: ShipmentLine[]): number {
  const kg = lines.reduce((sum, l) => sum + unitWeightKg(l.weightKg, l.categorySlug) * l.qty, 0);
  return Math.round(kg * 1000) / 1000;
}

export function calculateShipping(weightKg: number, subtotal: number): number {
  // Free shipping still applies on value, but not to freight-weight orders —
  // otherwise a 200 kg consignment ships free on a $1,000 subtotal.
  if (subtotal >= FREE_SHIPPING_OVER && weightKg <= FREE_SHIPPING_MAX_KG) return 0;
  const charge = SHIPPING_BASE + weightKg * SHIPPING_PER_KG;
  return money(Math.max(charge, SHIPPING_MIN));
}

export type Totals = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  weightKg: number;
  /** Display-only conversion; nothing is stored in EGP. */
  totalEgp: number;
};

/** Rounds to whole cents, avoiding float drift creeping into stored money. */
function money(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Order totals from a subtotal and the lines being shipped.
 *
 * `freeShipping` is used by the quote path, where carriage is negotiated
 * separately and so is not added on top.
 */
export function calculateTotals(
  subtotal: number,
  opts?: { freeShipping?: boolean; lines?: ShipmentLine[] }
): Totals {
  const weightKg = opts?.lines ? totalWeightKg(opts.lines) : 0;
  const shipping = opts?.freeShipping ? 0 : calculateShipping(weightKg, subtotal);
  const tax = money(subtotal * VAT_RATE);
  const total = money(subtotal + shipping + tax);
  return {
    subtotal: money(subtotal),
    shipping,
    tax,
    total,
    weightKg,
    totalEgp: usdToEgp(total),
  };
}
