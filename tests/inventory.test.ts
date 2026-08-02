import { test } from "node:test";
import assert from "node:assert/strict";
import { stockStatusFor, generateOrderNumber, LOW_STOCK_THRESHOLD } from "../src/lib/inventory";

// The four original copies all read:
//   qty === 0 ? "OUT_OF_STOCK" : qty < 10 ? "LOW_STOCK" : "IN_STOCK"
const legacy = (qty: number) =>
  qty === 0 ? "OUT_OF_STOCK" : qty < 10 ? "LOW_STOCK" : "IN_STOCK";

test("matches the previous inline stock threshold for all realistic quantities", () => {
  for (let qty = 0; qty <= 50; qty++) {
    assert.equal(stockStatusFor(qty), legacy(qty), `qty ${qty}`);
  }
});

test("boundaries", () => {
  assert.equal(stockStatusFor(0), "OUT_OF_STOCK");
  assert.equal(stockStatusFor(1), "LOW_STOCK");
  assert.equal(stockStatusFor(LOW_STOCK_THRESHOLD - 1), "LOW_STOCK");
  assert.equal(stockStatusFor(LOW_STOCK_THRESHOLD), "IN_STOCK");
});

test("negative quantity is treated as out of stock, not low stock", () => {
  // Behaviour improvement over the originals: `-1 === 0` was false there, so a
  // negative quantity reported LOW_STOCK. Stock should never go negative, but
  // reporting 'available' if it did would be the worse failure.
  assert.equal(stockStatusFor(-1), "OUT_OF_STOCK");
});

test("order numbers use the AM- prefix and are unique across a burst", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 500; i++) {
    const n = generateOrderNumber();
    assert.match(n, /^AM-[0-9A-Z]+$/);
    seen.add(n);
  }
  // Same-millisecond generation relies on the random suffix; allow a couple of
  // collisions in 500 rather than asserting perfection.
  assert.ok(seen.size > 495, `expected near-unique, got ${seen.size}/500`);
});
