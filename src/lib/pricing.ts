type Tier = { minQty: number; price: number | { toString(): string } };

// Returns the unit price for a quantity: the highest minQty tier that qty satisfies,
// falling back to list price.
export function unitPriceFor(listPrice: number, tiers: Tier[], qty: number): number {
  let best = listPrice;
  let bestMin = 0;
  for (const t of tiers) {
    if (qty >= t.minQty && t.minQty > bestMin) {
      best = Number(t.price);
      bestMin = t.minQty;
    }
  }
  return best;
}
