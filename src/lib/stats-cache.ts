/**
 * In-process memoisation for site-wide statistics.
 *
 * Why this exists: D1 bills rows *read*, and the catalogue counters were being
 * recomputed on every request. `productSpec.count()` alone examines all 14,026
 * ProductSpec rows, and the home page ran it twice — once in page.tsx and once
 * in WhyEngineers — on top of per-category and per-brand counts. That worked out
 * at 35–45k rows for a single home-page view, and 2,531 queries across a day
 * read 56.3 million rows against a free-tier ceiling of 5 million. The site
 * returned 500 on every database-backed page as a result.
 *
 * Note what the numbers say about the cause: 2,531 queries a day is nothing.
 * This was never a traffic problem, and no amount of extra capacity would have
 * fixed it — each individual query was scanning whole tables to produce a
 * single integer.
 *
 * Why in-memory rather than KV. An earlier caching pass used KV plus D1 tag
 * lookups and was reverted because it measured slower than no cache at all
 * (8.8s vs 0.8–1.8s median): every "hit" still paid for a network round trip.
 * A Map lookup in the isolate costs nothing and cannot be slower than the query
 * it replaces. The trade is that the cache is per-isolate and vanishes when the
 * isolate is recycled — which is fine here, because the worst case is simply
 * running the query we would have run anyway.
 *
 * Only for small, public, aggregate values — counters and short curated lists.
 * Do not put per-user or per-tenant data in here: isolates are shared between
 * visitors, so anything cached is visible to everyone the isolate serves.
 */

type Entry = { value: unknown; expires: number };

const store = new Map<string, Entry>();

/**
 * Default lifetime for catalogue statistics.
 *
 * The counts move when products are imported, which is a weekly event at most,
 * so an hour of staleness is invisible to a visitor and cuts reads by orders of
 * magnitude. These numbers are displayed as approximate marketing figures
 * ("5,000+ SKUs"), never as anything transactional.
 */
export const STATS_TTL_MS = 60 * 60 * 1000;

/**
 * How long a snapshot fallback is trusted before the database is tried again.
 *
 * Short on purpose. The fallback exists to survive an outage, not to replace
 * the database, so once the outage clears the site should return to live data
 * within a minute rather than an hour.
 */
const FALLBACK_TTL_MS = 60 * 1000;

/**
 * Returns a cached value, or computes and caches it.
 *
 * Deliberately does NOT share in-flight promises between requests. Workers
 * forbid awaiting I/O started by a different request — that is the
 * "Cannot perform I/O on behalf of a different request" failure this codebase
 * already hit once with a global Prisma client. Only settled, plain values are
 * stored, so a few concurrent misses may duplicate a query. That is a far
 * cheaper problem than the one being solved.
 *
 * `fallback` is what makes a database outage survivable. Without it, a failed
 * query throws out of a server component and Next renders a 500 for the whole
 * page — which is exactly what happened when D1's daily read limit was hit: the
 * home page, brand index and about page all went down together, while the pages
 * that touch no data stayed up. With a fallback the page still renders, from
 * the committed snapshot in src/content/catalog-snapshot.json.
 *
 * If no fallback is given the error propagates, unchanged from before. Callers
 * that must not fail the page either pass one or keep their own try/catch, as
 * WhyEngineers does.
 */
export async function cachedStat<T>(
  key: string,
  compute: () => Promise<T>,
  options: { ttlMs?: number; fallback?: T } = {}
): Promise<T> {
  const { ttlMs = STATS_TTL_MS, fallback } = options;

  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;

  try {
    const value = await compute();
    store.set(key, { value, expires: Date.now() + ttlMs });
    return value;
  } catch (err) {
    if (fallback === undefined) throw err;
    console.warn(
      `[stats] "${key}" fell back to the catalogue snapshot: ${String(err).slice(0, 200)}`
    );
    // Cached briefly so an outage does not mean re-attempting a failing query on
    // every single request, while still recovering quickly once it passes.
    store.set(key, { value: fallback, expires: Date.now() + FALLBACK_TTL_MS });
    return fallback;
  }
}
