/**
 * Generates the catalogue fallback snapshot from the local SQLite copy.
 *
 * Run this after any catalogue import, then commit the result:
 *
 *   npx tsx scripts/build-snapshot.ts
 *
 * Why a committed JSON file rather than a runtime fetch: the snapshot only
 * matters when the database is unreachable, so it cannot itself depend on the
 * database, on the network, or on anything that fails at the same time. Bundled
 * into the Worker it is always there.
 *
 * Only site-wide aggregates go in — counters, the category list, the curated
 * brand wall and the brand index. Roughly 40 KB. Product detail, search and
 * pricing are deliberately excluded: they are per-request reads that stay small
 * on their own, and the Worker has ~750 KB of headroom under Cloudflare's 3 MiB
 * limit once Prisma's 2.24 MB WASM engine is counted. Serving stale prices from
 * a snapshot would also be worse than showing nothing.
 */
// node:sqlite is stable at runtime on Node 22 but ships no type declarations in
// this TypeScript version, so the import is asserted rather than typed. The two
// helpers below give back the shapes the queries actually return.
// @ts-expect-error -- no type declarations for the built-in module
import { DatabaseSync } from "node:sqlite";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { featuredBrands } from "../src/content/site-content";

const DB_PATH = resolve(process.cwd(), "prisma/local.db");
const OUT_PATH = resolve(process.cwd(), "src/content/catalog-snapshot.json");

const db = new DatabaseSync(DB_PATH);
const one = <T>(sql: string): T => db.prepare(sql).get() as T;
const all = <T>(sql: string): T[] => db.prepare(sql).all() as T[];

const stats = {
  activeProductCount: one<{ c: number }>("SELECT COUNT(*) c FROM Product WHERE isActive=1").c,
  // Joined to Product so soft-deleted lines do not inflate the figure. Before
  // the catalogue was pruned nothing was inactive and the bare count was
  // accidentally right; it would now report 14,026 against a real 2,244.
  specCount: one<{ c: number }>(
    "SELECT COUNT(*) c FROM ProductSpec s JOIN Product p ON p.id=s.productId WHERE p.isActive=1"
  ).c,
  crossRefCount: one<{ c: number }>(
    "SELECT COUNT(*) c FROM CrossReference r JOIN Product p ON p.id=r.productId WHERE p.isActive=1"
  ).c,
  datasheetCount: one<{ c: number }>(
    "SELECT COUNT(*) c FROM Product WHERE isActive=1 AND datasheetUrl IS NOT NULL"
  ).c,
  brandCountAll: one<{ c: number }>("SELECT COUNT(*) c FROM Brand WHERE isActive=1").c,
  categoryCountAll: one<{ c: number }>("SELECT COUNT(*) c FROM Category WHERE isActive=1").c,
  activeBrandCount: one<{ c: number }>(
    `SELECT COUNT(*) c FROM Brand b WHERE b.isActive=1
       AND EXISTS (SELECT 1 FROM Product p WHERE p.brandId=b.id AND p.isActive=1)`
  ).c,
};

const categories = all<{ id: string; name: string; slug: string; count: number }>(
  `SELECT c.id, c.name, c.slug,
          (SELECT COUNT(*) FROM Product p WHERE p.categoryId=c.id AND p.isActive=1) AS count
     FROM Category c
    WHERE c.isActive=1
    ORDER BY c.sortOrder ASC`
).map((c) => ({ id: c.id, name: c.name, slug: c.slug, _count: { products: c.count } }));

// Same shape and ordering rule as the live query in BrandWall: only brands that
// actually have active stock, so the fallback cannot render a dead link either.
const wallSlugs = new Set(featuredBrands.map((b) => b.slug));
const brandWall = all<{ id: string; slug: string; name: string; count: number }>(
  `SELECT b.id, b.slug, b.name,
          (SELECT COUNT(*) FROM Product p WHERE p.brandId=b.id AND p.isActive=1) AS count
     FROM Brand b
    WHERE b.isActive=1
      AND EXISTS (SELECT 1 FROM Product p WHERE p.brandId=b.id AND p.isActive=1)`
)
  .filter((b) => wallSlugs.has(b.slug))
  .map((b) => ({ id: b.id, slug: b.slug, name: b.name, _count: { products: b.count } }));

const brandsListing = all<{
  id: string;
  slug: string;
  name: string;
  country: string | null;
  logo: string | null;
  count: number;
}>(
  `SELECT b.id, b.slug, b.name, b.country, b.logo,
          (SELECT COUNT(*) FROM Product p WHERE p.brandId=b.id AND p.isActive=1) AS count
     FROM Brand b
    WHERE b.isActive=1
      AND EXISTS (SELECT 1 FROM Product p WHERE p.brandId=b.id AND p.isActive=1)
    ORDER BY b.name ASC`
).map((b) => ({
  id: b.id,
  slug: b.slug,
  name: b.name,
  country: b.country,
  logo: b.logo,
  _count: { products: b.count },
}));

/**
 * Featured products, published rather than queried.
 *
 * The home page used to fetch these from D1 on every cold isolate. That meant
 * loading Prisma's WASM engine and the D1 adapter before a single byte of the
 * page could render — enough, on its own, to exceed the Worker CPU limit and
 * return Cloudflare error 1102 to the visitor. It was paying that price to
 * fetch an empty list, because nothing is currently flagged as featured.
 *
 * Carrying the rows here costs a few hundred bytes in a file the Worker
 * already has in memory, and the home page stops touching the database at all.
 * Flag a product with isFeatured and re-run `npm run catalog:publish`.
 */
const featured = all<{
  id: string; sku: string; name: string; slug: string;
  price: number; comparePrice: number | null;
  stockStatus: string; stockQty: number; images: string | null;
  brandName: string; brandSlug: string;
}>(
  `SELECT p.id, p.sku, p.name, p.slug, p.price, p.comparePrice,
          p.stockStatus, p.stockQty, p.images,
          b.name AS brandName, b.slug AS brandSlug
     FROM Product p
     JOIN Brand b ON b.id = p.brandId
    WHERE p.isFeatured = 1 AND p.isActive = 1
    ORDER BY p.name ASC
    LIMIT 8`
).map((p) => ({
  ...p,
  // The column is a JSON array; the card only ever shows the first image.
  image: (() => {
    try {
      const a = JSON.parse(p.images ?? "[]");
      return Array.isArray(a) && typeof a[0] === "string" ? (a[0] as string) : null;
    } catch {
      return null;
    }
  })(),
  images: undefined,
}));

const snapshot = {
  generatedAt: new Date().toISOString(),
  stats,
  categories,
  brandWall,
  brandsListing,
  featured,
};

writeFileSync(OUT_PATH, JSON.stringify(snapshot, null, 1));

const kb = (Buffer.byteLength(JSON.stringify(snapshot)) / 1024).toFixed(1);
console.log(`Wrote ${OUT_PATH}`);
console.log(
  `  ${kb} KB · ${categories.length} categories · ${brandWall.length} wall brands · ` +
    `${brandsListing.length} listed brands`
);
console.log(`  stats: ${JSON.stringify(stats)}`);
console.log(`  ${featured.length} featured product(s)`);
