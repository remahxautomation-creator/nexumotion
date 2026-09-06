/**
 * Generates the offline catalogue mirror served through the assets binding.
 *
 *   npx tsx scripts/build-mirror.ts
 *
 * Run after any catalogue import, then commit the output. Together with
 * build-snapshot.ts this is what lets the site keep working when D1 is
 * unreachable — the snapshot covers aggregates, this covers the catalogue.
 *
 * Why assets rather than the bundle. The Worker script has ~750 KB of headroom
 * under Cloudflare's 3 MiB limit once Prisma's 2.24 MB WASM engine is counted,
 * and this data is ~1.2 MB. Bundling it would break deploys outright. Files in
 * public/ are uploaded to the assets binding instead, which has no such limit
 * and costs the Worker script nothing.
 *
 * Three files, not one, because they are needed at different times: listing
 * pages (search, brand, category) need only the first, and product detail pulls
 * the other two. Splitting them means a search never downloads 520 KB of specs
 * it will not read.
 *
 * Keys are single letters. On 1,025 products the field names cost more than the
 * values do — full names push listing.json from 313 KB to over 500 KB — and
 * nothing reads this file by hand. src/lib/catalog-mirror.ts maps them back to
 * real names at the boundary, so the shorthand never leaks into page code.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
// @ts-expect-error -- node:sqlite ships no type declarations in this TS version
import { DatabaseSync } from "node:sqlite";

const DB_PATH = resolve(process.cwd(), "prisma/local.db");
const OUT_DIR = resolve(process.cwd(), "public/catalog");

const db = new DatabaseSync(DB_PATH);
const all = <T>(sql: string): T[] => db.prepare(sql).all() as T[];

/** First image only. The cards render one; the rest is dead weight here. */
function firstImage(images: string | null): string | null {
  if (!images) return null;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? (parsed[0] ?? null) : null;
  } catch {
    return null;
  }
}

mkdirSync(OUT_DIR, { recursive: true });

// ── Brands and categories, by slug ──────────────────────────────────────────
const brands = all<{
  id: string;
  slug: string;
  name: string;
  country: string | null;
  description: string | null;
}>(`SELECT id, slug, name, country, description FROM Brand WHERE isActive=1`);

const categories = all<{ id: string; slug: string; name: string; description: string | null }>(
  `SELECT id, slug, name, description FROM Category WHERE isActive=1 ORDER BY sortOrder ASC`
);

// ── Listing rows: exactly what ProductCard renders, plus search fields ───────
const products = all<{
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  price: number;
  comparePrice: number | null;
  stockStatus: string;
  stockQty: number;
  brandId: string;
  categoryId: string | null;
  images: string | null;
}>(
  `SELECT id, sku, name, slug, shortDesc, price, comparePrice, stockStatus, stockQty,
          brandId, categoryId, images
     FROM Product
    WHERE isActive=1
    ORDER BY name ASC`
).map((p) => ({
  i: p.id,
  s: p.sku,
  n: p.name,
  g: p.slug,
  d: p.shortDesc,
  p: p.price,
  cp: p.comparePrice,
  ss: p.stockStatus,
  q: p.stockQty,
  b: p.brandId,
  c: p.categoryId,
  m: firstImage(p.images),
}));

// ── Cross-references, so competitor-SKU search still resolves offline ────────
const crossRefs = all<{ competitorSku: string; productId: string }>(
  `SELECT competitorSku, productId FROM CrossReference`
).map((r) => ({ k: r.competitorSku, i: r.productId }));

// ── Detail-only fields, fetched only by the product page ────────────────────
const detail = all<{
  id: string;
  description: string | null;
  datasheetUrl: string | null;
  weightKg: number | null;
  certifications: string | null;
  images: string | null;
  isDiscontinued: number;
  replacementFor: string | null;
}>(
  `SELECT id, description, datasheetUrl, weightKg, certifications, images,
          isDiscontinued, replacementFor
     FROM Product WHERE isActive=1`
).reduce<Record<string, unknown>>((acc, p) => {
  acc[p.id] = {
    desc: p.description,
    ds: p.datasheetUrl,
    w: p.weightKg,
    cert: p.certifications,
    imgs: p.images,
    disc: p.isDiscontinued === 1,
    repl: p.replacementFor,
  };
  return acc;
}, {});

// ── Specs, grouped by product ───────────────────────────────────────────────
const specs = all<{
  productId: string;
  specKey: string;
  specName: string | null;
  value: string | null;
  unit: string | null;
}>(`SELECT productId, specKey, specName, value, unit FROM ProductSpec`).reduce<
  Record<string, Array<[string, string | null, string | null, string | null]>>
>((acc, s) => {
  (acc[s.productId] ||= []).push([s.specKey, s.specName, s.value, s.unit]);
  return acc;
}, {});

// ── Filter definitions and a value index, per category ──────────────────────
//
// Two things the listing path needs but the raw spec dump cannot cheaply give:
// the filter controls a category offers, and which products match a chosen
// value. Precomputing both here keeps filtering off the database entirely —
// previously a filtered category view was the one catalogue page still issuing
// a 14,026-row spec join per request.
//
// Only filterable, visible templates are included, and only values that at
// least one product actually has, so the UI cannot offer a filter that returns
// nothing.
const templates = all<{
  categoryId: string;
  key: string;
  name: string;
  unit: string | null;
  dataType: string;
  options: string | null;
  sortOrder: number;
}>(
  `SELECT categoryId, key, name, unit, dataType, options, sortOrder
     FROM SpecTemplate
    WHERE isFilterable=1 AND isVisible=1
    ORDER BY sortOrder ASC`
);

const specRows = all<{ productId: string; specKey: string; value: string | null }>(
  `SELECT productId, specKey, value FROM ProductSpec WHERE value IS NOT NULL AND value <> ''`
);

const productCategory = new Map<string, string | null>(
  all<{ id: string; categoryId: string | null }>(
    `SELECT id, categoryId FROM Product WHERE isActive=1`
  ).map((p) => [p.id, p.categoryId])
);

// categoryId -> specKey -> value -> [productId]
const specIndex: Record<string, Record<string, Record<string, string[]>>> = {};
for (const r of specRows) {
  const catId = productCategory.get(r.productId);
  if (!catId || !r.value) continue;
  ((specIndex[catId] ||= {})[r.specKey] ||= {})[r.value] ||= [];
  specIndex[catId][r.specKey][r.value].push(r.productId);
}

const filtersByCategory: Record<
  string,
  Array<{ key: string; name: string; unit: string | null; dataType: string; options: string[] }>
> = {};
for (const tpl of templates) {
  const present = specIndex[tpl.categoryId]?.[tpl.key];
  if (!present) continue;
  const options = Object.keys(present).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (options.length === 0) continue;
  (filtersByCategory[tpl.categoryId] ||= []).push({
    key: tpl.key,
    name: tpl.name,
    unit: tpl.unit,
    dataType: tpl.dataType,
    options,
  });
}

const generatedAt = new Date().toISOString();

const files: Array<[string, unknown]> = [
  ["listing.json", { generatedAt, brands, categories, products, crossRefs, filtersByCategory }],
  ["spec-index.json", { generatedAt, specIndex }],
  ["detail.json", { generatedAt, detail }],
  ["specs.json", { generatedAt, specs }],
];

for (const [name, payload] of files) {
  const json = JSON.stringify(payload);
  writeFileSync(resolve(OUT_DIR, name), json);
  console.log(`  ${name.padEnd(13)} ${(Buffer.byteLength(json) / 1024).toFixed(0).padStart(4)} KB`);
}

console.log(
  `\nMirror written to public/catalog · ${products.length} products · ` +
    `${brands.length} brands · ${categories.length} categories · ${crossRefs.length} cross-refs`
);
