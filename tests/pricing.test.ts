import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateTotals,
  calculateShipping,
  SHIPPING_BASE,
  SHIPPING_PER_KG,
  SHIPPING_MIN,
  FREE_SHIPPING_OVER,
  FREE_SHIPPING_MAX_KG,
  VAT_RATE,
} from "../src/lib/pricing";

// These previously pinned the flat-rate behaviour (shipping = subtotal >= 1000
// ? 0 : 25) and stopped compiling when carriage became weight-based, since
// SHIPPING_FLAT no longer exists. Rewritten against the current rule rather
// than deleted: this is the money path, and the free-shipping weight cap in
// particular is the sort of thing that can quietly stop applying.

test("carriage is a base charge plus weight", () => {
  assert.equal(calculateShipping(0, 0), SHIPPING_BASE);
  assert.equal(calculateShipping(10, 0), SHIPPING_BASE + 10 * SHIPPING_PER_KG);
  assert.equal(calculateShipping(2.5, 0), SHIPPING_BASE + 2.5 * SHIPPING_PER_KG);
});

test("carriage never falls below the minimum", () => {
  assert.ok(calculateShipping(0, 0) >= SHIPPING_MIN);
});

test("free shipping applies on value up to the weight cap", () => {
  assert.equal(calculateShipping(1, FREE_SHIPPING_OVER), 0);
  assert.equal(calculateShipping(FREE_SHIPPING_MAX_KG, FREE_SHIPPING_OVER), 0);
});

test("free shipping does NOT apply to freight-weight orders", () => {
  // Why the cap exists: a heavy consignment must not ship free merely because
  // it cleared the value threshold.
  assert.ok(
    calculateShipping(FREE_SHIPPING_MAX_KG + 0.01, FREE_SHIPPING_OVER) > 0,
    "over the weight cap should still be charged"
  );
  assert.equal(calculateShipping(200, 50_000), SHIPPING_BASE + 200 * SHIPPING_PER_KG);
});

test("VAT is charged on the subtotal only, not on carriage", () => {
  const t = calculateTotals(335);
  assert.equal(t.tax, Math.round(335 * VAT_RATE * 100) / 100);
  assert.equal(t.total, Math.round((t.subtotal + t.shipping + t.tax) * 100) / 100);
});

test("freeShipping option suppresses carriage (quote acceptance path)", () => {
  const t = calculateTotals(500, { freeShipping: true });
  assert.equal(t.shipping, 0);
  assert.equal(t.total, 500 + t.tax);
});

test("money values are rounded to cents, not left as float noise", () => {
  const t = calculateTotals(0.1 + 0.2); // 0.30000000000000004
  assert.equal(t.subtotal, 0.3);
  assert.ok(Number.isFinite(t.total));
  assert.equal(t.total, Math.round(t.total * 100) / 100);
});

test("zero subtotal still charges carriage and no tax", () => {
  const t = calculateTotals(0);
  assert.equal(t.tax, 0);
  assert.equal(t.shipping, SHIPPING_BASE);
  assert.equal(t.total, SHIPPING_BASE);
});
