// Single source of truth for order pricing.
//
// These rules previously lived in three places — the checkout UI, the order
// API, and the quote-acceptance path (which had the VAT rate hardcoded rather
// than referencing a constant). Client and server each computing their own
// total is a correctness risk: if they drift, the customer is shown one figure
// and charged another.

export const SHIPPING_FLAT = 25;
export const FREE_SHIPPING_OVER = 1000;
export const VAT_RATE = 0.14; // Egypt VAT

export type Totals = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

/** Rounds to whole cents, avoiding float drift creeping into stored money. */
function money(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Order totals from a subtotal.
 *
 * `freeShipping` is used by the quote path, where carriage is negotiated
 * separately and so is not added on top.
 */
export function calculateTotals(subtotal: number, opts?: { freeShipping?: boolean }): Totals {
  const shipping = opts?.freeShipping || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
  const tax = money(subtotal * VAT_RATE);
  return {
    subtotal: money(subtotal),
    shipping,
    tax,
    total: money(subtotal + shipping + tax),
  };
}
