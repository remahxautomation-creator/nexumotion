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
