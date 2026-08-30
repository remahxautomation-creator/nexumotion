import { test } from "node:test";
import assert from "node:assert/strict";
import { isRateLimited } from "../src/lib/rate-limit";

// Written because the audit added this to the sign-in and registration paths,
// and nothing tested it. A limiter that silently never trips is worse than no
// limiter, because it looks like protection.
//
// Keys are unique per test: the store is module-level, so tests would
// otherwise leak into one another.

test("allows up to the limit, then blocks", () => {
  const key = `t1:${Math.random()}`;
  for (let i = 0; i < 5; i++) {
    assert.equal(isRateLimited(key, 5, 60_000), false, `hit ${i + 1} should pass`);
  }
  assert.equal(isRateLimited(key, 5, 60_000), true, "6th hit must be blocked");
});

test("keys are independent — one caller cannot lock out another", () => {
  const a = `t2a:${Math.random()}`;
  const b = `t2b:${Math.random()}`;
  for (let i = 0; i < 5; i++) isRateLimited(a, 5, 60_000);
  assert.equal(isRateLimited(a, 5, 60_000), true, "a is over budget");
  assert.equal(isRateLimited(b, 5, 60_000), false, "b is unaffected");
});

test("the window expires and the caller is allowed again", async () => {
  const key = `t3:${Math.random()}`;
  assert.equal(isRateLimited(key, 1, 50), false);
  assert.equal(isRateLimited(key, 1, 50), true, "blocked inside the window");
  await new Promise((r) => setTimeout(r, 70));
  assert.equal(isRateLimited(key, 1, 50), false, "allowed once the window passes");
});

test("a limit of zero blocks everything", () => {
  // Guards against an off-by-one where the first hit slips through a disabled
  // endpoint.
  const key = `t4:${Math.random()}`;
  assert.equal(isRateLimited(key, 0, 60_000), true);
});
