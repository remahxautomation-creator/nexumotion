# Product Data Enrichment

Where the catalogue is thin, and where the missing data can legitimately come
from. Run `npx tsx scripts/audit-missing-data.ts` for the current picture.

## Current state — 1,025 products

| Field | Missing | Can it be filled? |
|---|---:|---|
| `description` | 0% | **Done** — generated from specs |
| `shortDesc` | 0% | **Done** — generated on import |
| `specs` | 0% | **Done** — 14 median per product |
| `datasheetUrl` | 5% | **Done** — 977 links, served via `/datasheet/[sku]` |
| `certifications` | 48% | **Partly done** — parsed from approvals specs |
| `images` | 60% | External source needed |
| `weightKg` | 88% | External source needed |
| `stockQty` | 100% | **Yours** — no external source can tell you this |
| `comparePrice` | 100% | **Yours** — a commercial decision, not data |
| `priceTiers` | 100% | **Yours** — your volume breaks |
| `crossReferences` | 100% | External source or manual |
| `cadUrl` / `manualUrl` | 100% | External source needed |

Four of those are not data-collection problems at all. Stock, list-vs-sell
price, and volume breaks are decisions only you can make — no API supplies
them, and importing someone else's would be actively wrong.

## What was recoverable without any external source

Two fields were empty only because the importer never mapped them:

- **`certifications`** — 962 products already carried a "Standards/Approvals"
  spec. `scripts/derive-from-specs.ts` parses CE, UL, cULus, CSA, RoHS, REACH,
  UKCA, ATEX, IECEx, VDE, TÜV, EAC, CCC, KC, RCM, FM, DNV, ABS, LR and BV out
  of it. 538 products now carry marks, averaging 2.1 each. The remaining 487
  genuinely have no approvals listed in the source.
- **`description`** — composed from each product's own specifications
  (type, series, supply, current, IP rating, contacts, temperature range).
  Factual and ours. The source file's description column is the retailer's
  marketing copy and stays excluded.

Re-run either safely: both are idempotent and support `--commit`.

## Legitimate sources for the rest

### 1. Schneider Electric Product Catalogue API — best single win
<https://api-explorer.se.com/en/api/product-catalog-v2>

Official, public, OAuth-authenticated. Returns dimensions, **weight**,
packaging, technical characteristics, ETIM classification, and **documents and
media** — which is exactly the images/weight/CAD gap.

Schneider is the largest brand in this catalogue at **71 products**, so this
one integration is the highest return per unit of effort. Register for a
developer account, obtain client credentials, and enrich by part number.

### 2. Nexar API (formerly the Octopart API)
<https://nexar.com/api>

GraphQL. Component specs, datasheets, lifecycle status, stock and pricing
across distributors. **Free tier: 1,000 results/month** — enough to enrich the
electronic-component tail incrementally, and results should be cached locally
so a part is never fetched twice.

Best fit for: Vishay (16), STMicroelectronics (12), TE Connectivity (18),
Molex, Würth, Bourns, TDK, Amphenol, onsemi, Fair-Rite — roughly 100 lines.

### 3. Distributor APIs — Digi-Key and Mouser
- <https://developer.digikey.com/products/product-information-v3/partsearch/productdetails>
- <https://www.mouser.com/en/api-solutions/>

Both offer product search returning datasheets, descriptions, images and live
pricing. Free with an account. Same component coverage as Nexar, with the
bonus that if you buy from either, the data matches what you actually procure.

### 4. ETIM / BMEcat — the industry standard route
ABB, Schneider Electric, Siemens, Eaton and Rockwell have all joined ETIM.
BMEcat is the XML exchange format their data ships in. This is how distributors
receive catalogue data at scale: you ask each manufacturer's channel team for
their BMEcat/ETIM export, load it once, and refresh periodically.

Slower to set up than an API, but it is the only route that scales to a full
catalogue with images and CAD, and it comes with distribution rights attached —
which hotlinked assets do not.

### 5. TraceParts / manufacturer CAD portals
For `cadUrl`. TraceParts hosts manufacturer-published CAD for most of these
brands, and manufacturers generally *want* distributors linking to it.

## Recommended order

1. **Ask your suppliers first.** Cheapest and fastest. A brand's channel team
   will usually send a data pack — that is one email per brand, and it covers
   images and weight with rights included.
2. **Schneider API** — 71 products, official, free. Best effort/return ratio.
3. **Nexar or Mouser/Digi-Key** — the ~100 electronic-component lines.
4. **ETIM/BMEcat** — when the catalogue grows past a few thousand lines.

## On the images specifically

60% of products have no image, and of the URLs that came with the file only
38% still resolved when checked — see `scripts/check-image-liveness.ts`. Dead
entries were pruned so pages fall back cleanly instead of hanging.

Re-run the liveness check periodically; the surviving 38% will keep decaying,
because those assets belong to someone else's CDN. Manufacturer media portals
and supplier data packs are the durable fix, and they carry usage rights.
