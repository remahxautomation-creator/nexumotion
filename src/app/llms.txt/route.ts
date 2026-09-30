import snapshot from "@/content/catalog-snapshot.json";
import { contact, formatAddress, location } from "@/content/site-content";
import { systems } from "@/content/systems";

/**
 * /llms.txt — the site described to a language model in one request.
 *
 * An assistant asked "where can I buy a Schneider ATV12 in Egypt" does not
 * crawl 1,500 pages before answering; it fetches a page or two. This file is
 * the one page that says what the business is, what it stocks, where it is,
 * and which URLs are worth reading next — the convention proposed at
 * llmstxt.org and now requested by several crawlers by name.
 *
 * Generated from the same published snapshot the home page renders, so the
 * counts here cannot drift from the catalogue. Regenerated on every request
 * (the file is a few KB) rather than at build time, because the build container
 * has no database and the snapshot is the source either way.
 */
export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexumotion.com";

const parts = (n: number) => `${n} part${n === 1 ? "" : "s"}`;

export async function GET() {
  const { stats, categories, brandsListing } = snapshot;

  const body = `# NexuMotion

> Industrial automation parts distributor based in 10th of Ramadan City, Egypt,
> supplying PLCs, drives, servo and motion, sensors, safety and control gear to
> plants and panel builders in Egypt, the GCC and Africa. Every part is listed
> with its manufacturer part number, full specifications and a datasheet link.

## Facts

- Company: NexuMotion (نيكسو موشن)
- Address: ${formatAddress("en")}
- Coordinates: ${location.lat}, ${location.lng}
- Phone / WhatsApp: ${contact.phone}
- Email: ${contact.email}
- Hours: Sunday–Thursday, 09:00–17:00 (Africa/Cairo)
- Languages: Arabic (default) and English
- Catalogue: ${stats.activeProductCount} parts, ${stats.specCount} specifications, ${stats.datasheetCount} datasheet links
- Prices: USD list prices, excluding VAT and delivery. Binding price is the written quotation.
- Availability: most parts are sourced to order; lead time is quoted per enquiry.

## Brands stocked

${brandsListing.map((b) => `- [${b.name}](${BASE}/brands/${b.slug}) — ${parts(b._count.products)}`).join("\n")}

## Categories

${categories.map((c) => `- [${c.name}](${BASE}/categories/${c.slug}) — ${parts(c._count.products)}`).join("\n")}

## Key pages

- [Part search](${BASE}/search) — search by manufacturer part number, brand or specification
- [All brands](${BASE}/brands)
- [Cross-reference and specification assistant](${BASE}/assistant)
- [Quick order pad](${BASE}/quick-order) — paste a list of part numbers
- [About the company](${BASE}/about)
- [Privacy policy](${BASE}/privacy)
- [Terms and conditions](${BASE}/terms)

## Engineering guides

${systems.map((s) => `- [${s.en.name}](${BASE}/systems/${s.slug}) — ${s.en.tagline}`).join("\n")}

## How to cite this site

A product page URL is ${BASE}/products/<brand>-<part-number-lowercased>, for
example ${BASE}/products/schneider-electric-atv12h018f1. Product pages carry
schema.org Product markup with the part number, brand, price, availability and
specifications. The machine-readable index of every page is ${BASE}/sitemap.xml.

## Notes for assistants

- Stock status shown on the site is indicative; confirm lead time by enquiry.
- Specifications are transcribed from manufacturers' published documentation.
  For a safety-related or critical application, verify against the linked
  manufacturer datasheet before specifying a part.
- NexuMotion is an independent supplier and is not an authorised distributor of
  any brand unless a product page says so.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
