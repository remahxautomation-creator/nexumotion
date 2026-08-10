/**
 * The one place the application talks to analytics.
 *
 * Why a layer at all, rather than gtag() calls at each site:
 *
 * 1. The app should not know which vendor is measuring it. Everything here
 *    pushes a semantic event ("a lead was generated") into dataLayer. Google
 *    Ads, GA4, Meta or nothing at all can consume it, and swapping vendors
 *    becomes a change in the tag manager rather than a change in the codebase.
 *
 * 2. Scattered gtag() calls rot. They get copied with the wrong parameter
 *    shape, silently stop matching what the reports expect, and nobody
 *    notices because analytics has no failing test. One typed module means
 *    the compiler enforces the payloads.
 *
 * 3. Conversion tracking must not be able to break the page. Every call here
 *    is wrapped: analytics is instrumentation, and a measurement failure must
 *    never take out a checkout.
 *
 * Event names follow GA4's recommended set (generate_lead, add_to_cart,
 * purchase, search, view_item) rather than invented ones, because GA4 builds
 * its standard reports off those names automatically. An event called
 * "inquiry_sent" would need manual configuration to show up anywhere useful.
 *
 * Currency is USD because that is what the catalogue stores and what the order
 * total is computed in; EGP is a presentation-layer conversion.
 */

type DataLayerEvent = Record<string, unknown> & { event: string };

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Google Ads conversion label, from Tools → Conversions in the Ads account. */
export const ADS_CONVERSION_LABEL: string | null = null;
export const ADS_ID = "AW-18380279878";

/**
 * Pushes to dataLayer, which both GTM and gtag.js read.
 *
 * Never throws. If analytics is blocked, absent, or broken, the caller carries
 * on — which matters because these fire inside checkout and form submits.
 */
function push(event: DataLayerEvent): void {
  try {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  } catch {
    // Instrumentation must not surface to the user.
  }
}

export type AnalyticsItem = {
  sku: string;
  name: string;
  brand?: string;
  category?: string;
  price?: number;
  quantity?: number;
};

const toGa4Item = (i: AnalyticsItem) => ({
  item_id: i.sku,
  item_name: i.name,
  item_brand: i.brand,
  item_category: i.category,
  price: i.price,
  quantity: i.quantity ?? 1,
});

/**
 * A sourcing request was submitted.
 *
 * This is the conversion that matters today: every catalogue line is
 * out of stock, so the inquiry form is the only thing a visitor can complete.
 * Ad spend should be judged against this event, not against page views.
 */
export function trackLead(params: {
  partNumber?: string;
  manufacturer?: string;
  quantity?: number;
  listed: boolean;
}): void {
  push({
    event: "generate_lead",
    lead_type: params.listed ? "catalogue_part" : "unlisted_part",
    part_number: params.partNumber,
    manufacturer: params.manufacturer,
    quantity: params.quantity,
    currency: "USD",
    // GA4 wants a value on generate_lead to report lead quality. Left unset
    // rather than invented: a made-up number would poison the very reports
    // this exists to feed. Set it once the average enquiry value is known.
  });

  // Google Ads counts conversions from its own event, not from dataLayer, and
  // needs the label that identifies WHICH conversion action this is. Until
  // that label is filled in above, this is deliberately inert rather than
  // firing a malformed conversion that shows up as unattributed.
  if (ADS_CONVERSION_LABEL) {
    try {
      window.gtag?.("event", "conversion", {
        send_to: `${ADS_ID}/${ADS_CONVERSION_LABEL}`,
      });
    } catch {
      /* ignore */
    }
  }
}

export function trackAddToCart(item: AnalyticsItem): void {
  push({
    event: "add_to_cart",
    currency: "USD",
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [toGa4Item(item)],
  });
}

export function trackPurchase(params: {
  orderNumber: string;
  value: number;
  tax?: number;
  shipping?: number;
  items: AnalyticsItem[];
}): void {
  push({
    event: "purchase",
    transaction_id: params.orderNumber,
    currency: "USD",
    value: params.value,
    tax: params.tax,
    shipping: params.shipping,
    items: params.items.map(toGa4Item),
  });
}

/**
 * A search was run. `results` is the point of this one: a stream of searches
 * that returned nothing is a directly actionable list of what to stock or
 * source, and it is invisible without instrumenting it.
 */
export function trackSearch(term: string, results: number): void {
  if (!term) return;
  push({
    event: "search",
    search_term: term,
    results_count: results,
    found: results > 0,
  });
}

export function trackViewItem(item: AnalyticsItem): void {
  push({
    event: "view_item",
    currency: "USD",
    value: item.price,
    items: [toGa4Item(item)],
  });
}
