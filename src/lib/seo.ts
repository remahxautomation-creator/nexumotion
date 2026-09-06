import type { Metadata } from "next";

/**
 * `robots` directives for pages that must never appear in search results.
 *
 * Three separate reasons, all served by the same flag:
 *
 *   Privacy   — /orders/[orderNumber] is reachable by URL with the buyer's
 *               email as the access check (`?e=`). If such a link ever leaks
 *               through a referrer header, a shared screenshot or a forwarded
 *               message, an indexed copy would publish a customer's order and
 *               their address. Nothing here should ever be in an index.
 *   Useless   — a login form or an empty cart ranks for nothing and helps
 *               nobody who finds it.
 *   Crawl budget — 1,312 real URLs compete for attention. Thin, duplicated
 *               account and checkout pages spend crawl on pages that can never
 *               earn a visit.
 *
 * `nocache` and `noimageindex` are included because `noindex` alone still
 * permits a cached copy and image indexing on some engines.
 */
export const noIndex: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
};

/** Convenience for pages whose only metadata is a title plus noindex. */
export function privatePage(title: string): Metadata {
  return { title, robots: noIndex };
}
