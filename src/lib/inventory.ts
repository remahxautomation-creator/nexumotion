// Stock and order-number helpers.
//
// Both of these were previously copy-pasted: the stock threshold in four
// places (order creation, quote acceptance, admin single edit, admin bulk
// import) and the order-number format in two. Changing the low-stock
// threshold or the reference format meant finding every copy.

export const LOW_STOCK_THRESHOLD = 10;

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

/** Derives stock status from quantity on hand. */
export function stockStatusFor(qty: number): StockStatus {
  if (qty <= 0) return "OUT_OF_STOCK";
  if (qty < LOW_STOCK_THRESHOLD) return "LOW_STOCK";
  return "IN_STOCK";
}

/**
 * Whether a line can go in the cart, or has to become an inquiry instead.
 *
 * Both conditions matter and neither is redundant:
 *
 *   stockQty > 0        — order creation decrements this inside a transaction,
 *                         so a line with nothing on hand cannot be fulfilled
 *                         whatever its label says.
 *   status is sellable  — BACKORDER means we do not hold it; the customer
 *                         needs a lead time and a price before committing,
 *                         which is a conversation, not a checkout.
 *
 * This replaces a scattered `stockStatus === "OUT_OF_STOCK"` test that only
 * caught one of the four statuses. Every catalogue row currently sits at
 * BACKORDER with stockQty 0, so that test disabled nothing and the entire
 * catalogue was addable to cart with no stock behind any of it.
 */
export function isPurchasable(p: { stockStatus: string; stockQty?: number | null }): boolean {
  if ((p.stockQty ?? 0) <= 0) return false;
  return p.stockStatus === "IN_STOCK" || p.stockStatus === "LOW_STOCK";
}

/**
 * Customer-facing order reference, e.g. AM-MSBJ3WV7K9C.
 * Timestamp in base36 plus 3 random base36 chars — short enough to read over
 * the phone, and collision-resistant enough for this volume.
 */
export function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 36 ** 3)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `AM-${stamp}${rand}`;
}
