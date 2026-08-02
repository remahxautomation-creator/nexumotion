// Minimal in-process sliding-window rate limiter.
//
// Deliberately in-memory: it needs no schema change and stores no IP addresses
// at rest. The trade-off is that it resets on deploy and does not coordinate
// across instances — fine for a single Node process, insufficient once this
// runs multi-instance. Swap the Map for Redis at that point; the call site
// does not change.

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

// Opportunistic cleanup so the Map cannot grow without bound.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}

/**
 * Returns true when the caller is over budget.
 * @param key    caller identity — prefix with the route, e.g. `inquiry:ip:1.2.3.4`
 * @param limit  allowed hits per window
 * @param windowMs window length in milliseconds
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  existing.count += 1;
  return existing.count > limit;
}

/**
 * Best-effort client IP. Trusts x-forwarded-for, which is only meaningful
 * behind a proxy you control (nginx, Vercel). Direct-to-Node it can be spoofed,
 * so this is abuse friction rather than a security boundary.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
