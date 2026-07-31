# Catalog Sourcing — how product data gets into AutoParts MENA

## Why we don't scrape manufacturer sites

The obvious move — point a crawler at 50 manufacturer catalogs and harvest 100 parts each —
doesn't survive contact with the actual terms. What I checked:

| Check | Finding |
|---|---|
| Siemens Industry Mall `robots.txt` | Permits catalog crawling; blocks `/admin`, `/*Search*`, `/teddatasheet`, `/Legal` |
| **Siemens Terms of Use** | Explicitly prohibits "any automated scraping, reproduction, or extraction of content, information, or data from the Siemens Website" — and separately prohibits use "for the purpose of … building competitive products" |
| Schneider Electric `se.com` | Returns **HTTP 403** to automated requests — bot access blocked at the edge |

`robots.txt` is a crawler-politeness signal; the **Terms of Use are the binding document**,
and they say no. Three separate problems stack up:

1. **Contract** — scraping breaches the ToS you accept by using the site.
2. **Copyright** — product descriptions, photos, datasheets and CAD files are the
   manufacturer's copyrighted work. Republishing them on a commercial storefront is
   infringement, independent of how the data was obtained.
3. **Database rights** — in the EU/UK (where most of these vendors are domiciled) the
   catalog *compilation* itself carries protection against systematic extraction.

There's also a practical problem: scraped data has no authorized pricing, no real stock
figure, and no warranty chain. Selling from it creates liability the moment a customer
orders a part you can't supply at the price shown.

**What is safe to use:** manufacturer *names*, *countries*, *websites*, and *product-line
names* (SINAMICS, PowerFlex, MELSEC). Those are facts and trademarks-in-nominative-use,
not copyrighted expression. That is exactly what `prisma/seed-data/brand-intel.ts` records.

---

## How distributors actually get catalog data

In rough order of how fast you can start:

### 1. Ask your suppliers (fastest, free)
Every brand you're an authorized or sub-distributor for will hand you a product data
export — it's in their interest that you list their parts. Ask the rep for:
"product master data export with specifications, in CSV or BMEcat."

Send them the matching file from `import-templates/` (see below) and the filled version
imports directly.

### 2. Authorized distributor agreements (the real unlock)
Becoming an authorized distributor gets you: official data feeds, authorized pricing,
stock visibility, warranty backing, and permission to use their product imagery. For the
Tier-1 brands in Egypt this usually runs through the regional master distributor rather
than the manufacturer directly.

### 3. Industry data pools (paid, standardized)
- **ETIM** — the electrical/automation classification standard; most European vendors
  publish ETIM-classified data
- **BMEcat** — the XML catalog exchange format these feeds arrive in
- **IDEA / IDW** (electrical industry data warehouse), **Nexus**, **Tradecloud**
- **Octopart / Z2Data** — better for electronic components than heavy automation

### 4. Manufacturer APIs and open downloads
Some vendors publish machine-readable data deliberately — CAD portals, EPLAN macro
downloads, ETIM exports. That's licensed distribution, and it's fine to consume. This is
brand-by-brand; check the partner portal before assuming.

### 5. Your own BOMs and quotes
You already have the highest-value catalog data in your quote history and past BOMs:
real part numbers your customers actually ask for. Seed the catalog from demand rather
than from the manufacturer's full 40,000-SKU list — the top few hundred movers cover most
revenue.

---

## Import templates

`npx tsx prisma/generate-import-templates.ts` writes one CSV per category into
`import-templates/`, with the base columns plus that category's parametric spec columns:

```
sku,name,brand,category,price,stockQty,shortDesc,spec:power_kw (kW),spec:voltage,…
```

Send the relevant file to each supplier. Filled files import at
**`/admin/products/import`** (existing SKUs update, new SKUs are created, and every row
reports back created / updated / error).

> Note: the importer currently ingests the **base columns**. The `spec:*` columns are in
> the templates so suppliers capture the data in one pass — wiring them through to
> `ProductSpec` rows is a small, well-defined next step.

---

## Brand priority for catalog build-out

`prisma/seed-data/brand-intel.ts` ranks all 50 brands by demand in the Egypt → MENA →
Africa corridor, with the categories each actually competes in. Build the catalog in tier
order — Tier 1 first:

**Tier 1 (8)** — Siemens, ABB, Schneider Electric, Allen-Bradley, Delta, Omron,
Mitsubishi Electric, Danfoss

**Tier 2 (20)** — Honeywell, Emerson, Yokogawa, Endress+Hauser, IFM, SICK,
Pepperl+Fuchs, Phoenix Contact, WAGO, Pilz, Festo, SMC, Bosch Rexroth, SEW-Eurodrive,
Yaskawa, INVT, Inovance, LS Electric, Weintek, Autonics

**Tier 3 (22)** — the remainder: specialists and price-tier challengers.

Sources: Mordor Intelligence MEA Industrial Automation and VFD market reports (MEA
automation market USD 5.28bn in 2025 → USD 7.44bn by 2030, 7.1% CAGR), The Insight
Partners MEA PLC market, and Egyptian distributor/partner listings.
