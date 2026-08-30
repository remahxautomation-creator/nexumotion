import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * Caching for the Next data cache.
 *
 * Every catalogue page is `force-dynamic` and queried the database on every
 * request. For a catalogue that changes weekly at most, that meant each
 * visitor — and each scanner — paying for a fresh round trip. On the previous
 * provider it also metered compute by the second and eventually exhausted the
 * allowance, taking the site down.
 *
 * Two layers, because they solve different problems:
 *
 *   KV        — the durable store, shared by every isolate worldwide. A value
 *               written by one request is available to all the others.
 *   Regional  — Cloudflare's Cache API in front of KV, so a repeat read in the
 *               same region never leaves the colo. "long-lived" suits data
 *               that is stable for hours; "short-lived" would re-check KV far
 *               more often than this catalogue justifies.
 *
 * The tag cache points at the existing catalogue database rather than a second
 * one. It only needs a couple of small bookkeeping tables, and a separate D1
 * instance would be another thing to provision and keep in step.
 *
 * Pages stay dynamic. The queries behind them are wrapped in unstable_cache
 * (see lib/cached.ts), so the caching happens at the data layer and the build
 * still needs no database — which is what forced `force-dynamic` originally.
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "long-lived" }),
  tagCache: d1NextTagCache,
});
