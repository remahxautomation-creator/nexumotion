import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateTotals,
  SHIPPING_FLAT,
  FREE_SHIPPING_OVER,
  VAT_RATE,
} from "../src/lib/pricing";

// Characterisation tests: these pin the CURRENT behaviour of the three
// previously-duplicated pricing implementations, so extracting them into one
// module is verifiable rather than assumed.
//
// The originals computed:
//   shipping = subtotal >= 1000 ? 0 : 25
//   tax      = Math.round(subtotal * 0.14 * 100) / 100
//   total    = subtotal + shipping + tax

const legacy = (subtotal: number) => {
  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
  const tax = Math.round(subtotal * VAT_RATE * 100) / 100;
  return { shipping, tax, total: subtotal + shipping + tax };
};

test("matches the previous inline calculation across a range of subtotals", () => {
  for (const subtotal of [0, 1, 9.99, 100, 335, 407, 999.99, 1000, 1000.01, 19494, 250000]) {
    const now = calculateTotals(subtotal);
    const before = legacy(subtotal);
    assert.equal(now.shipping, before.shipping, `shipping @ ${subtotal}`);
    assert.equal(now.tax, before.tax, `tax @ ${subtotal}`);
    assert.equal(now.total, Math.round(before.total * 100) / 100, `total @ ${subtotal}`);
  }
});

test("flat shipping below the free threshold", () => {
  assert.equal(calculateTotals(999.99).shipping, SHIPPING_FLAT);
});

test("free shipping at and above the threshold", () => {
  assert.equal(calculateTotals(FREE_SHIPPING_OVER).shipping, 0);
  assert.equal(calculateTotals(FREE_SHIPPING_OVER + 0.01).shipping, 0);
});

test("known real order: 335 subtotal reproduces the 407 total seen in the app", () => {
  const t = calculateTotals(335);
  assert.equal(t.shipping, 25);
  assert.equal(t.tax, 46.9);
  assert.equal(t.total, 406.9);
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

test("zero subtotal still charges shipping and no tax", () => {
  const t = calculateTotals(0);
  assert.equal(t.tax, 0);
  assert.equal(t.shipping, SHIPPING_FLAT);
  assert.equal(t.total, SHIPPING_FLAT);
});
