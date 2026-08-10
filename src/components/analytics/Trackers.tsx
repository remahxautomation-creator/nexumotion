"use client";

import { useEffect, useRef } from "react";
import { trackSearch, trackPurchase, type AnalyticsItem } from "@/lib/analytics";

/**
 * Fire-on-mount trackers for server-rendered pages.
 *
 * Search results and the order confirmation are server components, so they
 * cannot call the analytics module directly. These render nothing and exist
 * only to emit the event once the page reaches the browser.
 */

/**
 * Emits `search` with the result count.
 *
 * The guard matters: React re-runs effects on every dependency change, and in
 * development Strict Mode mounts twice. Without it, one search would report as
 * two and the "no results" list — the thing worth acting on — would be
 * inflated.
 */
export function SearchTracker({ term, results }: { term: string; results: number }) {
  const fired = useRef<string | null>(null);

  useEffect(() => {
    const key = `${term}:${results}`;
    if (fired.current === key) return;
    fired.current = key;
    trackSearch(term, results);
  }, [term, results]);

  return null;
}

/**
 * Emits `purchase` on the order confirmation page.
 *
 * A refresh re-fires it, which is unavoidable when the confirmation is a
 * plain URL. GA4 and Google Ads both de-duplicate on transaction_id, so the
 * order is counted once — this is why the order number is passed rather than
 * a generated id.
 */
export function PurchaseTracker(props: {
  orderNumber: string;
  value: number;
  tax?: number;
  shipping?: number;
  items: AnalyticsItem[];
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackPurchase(props);
    // Deliberately mount-only: the order is immutable once placed, so
    // re-running on prop identity changes would only ever double-count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
