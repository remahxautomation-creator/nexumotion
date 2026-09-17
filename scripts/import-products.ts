/**
 * Adds or updates products from a category CSV.
 *
 *   npx tsx scripts/import-products.ts import-templates/drives-vfds.csv           # dry run
 *   npx tsx scripts/import-products.ts import-templates/drives-vfds.csv --commit  # write
 *
 * Uses the per-category templates in import-templates/ — fill one in and point
 * this at it. The header row defines the columns; `_index.csv` lists them all.
 *
 *   Required:  sku, name, brand, category, price
 *   Optional:  stockQty, shortDesc, description, comparePrice, weightKg,
 *              datasheetUrl, manualUrl, cadUrl, certifications (semicolon list),
 *              replacementFor
 *   Specs:     any column named  spec:<key> (<unit>)  or  spec:<key>
 *              e.g. spec:power_kw (kW), spec:ip_rating — the key becomes the
 *              spec's filter key and the header text its display name.
 *   specs:     optional JSON object column {"Display name": "value"} — for
 *              feeds whose spec set varies per product.
 *
 * Brand and category are matched by name and must already exist and be
 * active. A row naming an unknown brand is rejected rather than creating one
 * silently — a typo would otherwise fork "Schneider Electric" into two brands.
 *
 * Upserts on SKU: an existing product is updated in place (specs replaced),
 * a new one is created. Nothing is deleted here; retirement is a separate,
 * deliberate action.
 *
 * Images are not in the CSV. They come from photographs, so they go through
 * scripts/ingest-product-images.ts, matched on SKU. Run that after this.
 *
 * With --commit, writes the local database and emits SQL for production to
 * import-templates/.d1-sync.sql. The site is published from the local database
 * by `npm run catalog:publish`; production D1 is the write side (orders,
 * quotes, admin), so both must agree.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { parseCsv } from "../src/lib/csv";

const CSV_PATH = process.argv[2];
const COMMIT = process.argv.includes("--commit");

if (!CSV_PATH) {
  console.error("Usage: npx tsx scripts/import-products.ts <file.csv> [--commit]");
  process.exit(1);
}

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const q = (v: string | null | undefined) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

type Row = Record<string, string>;

function stockStatusFor(qty: number): string {
  if (qty <= 0) return "BACKORDER";
  if (qty <= 5) return "LOW_STOCK";
  return "IN_STOCK";
}

async function main() {
  const text = readFileSync(resolve(process.cwd(), CSV_PATH), "utf8");
  const table = parseCsv(text);
  if (table.length < 2) {
    console.log("CSV has a header but no data rows.");
    return;
  }

  const header = table[0].map((h) => h.trim());
  const rows: Row[] = table
    .slice(1)
    .filter((r) => r.some((c) => c.trim()))
    // Template rows are placeholders like <manufacturer-part-number>; skip them.
    .filter((r) => !/^<.*>$/.test((r[0] ?? "").trim()))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));

  const specCols = header.filter((h) => h.startsWith("spec:"));
  const specMeta = specCols.map((h) => {
    const m = h.match(/^spec:([^(]+?)\s*(?:\(([^)]*)\))?\s*$/);
    const key = (m?.[1] ?? h.slice(5)).trim();
    return { col: h, key, unit: m?.[2]?.trim() || null, name: key.replace(/_/g, " ") };
  });

  console.log(
    `${rows.length} row(s) · ${specMeta.length} spec column(s)${COMMIT ? "" : "   (dry run — add --commit to write)"}\n`
  );

  const brands = await prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true } });
  const categories = await prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true } });
  const brandByName = new Map(brands.map((b) => [b.name.toLowerCase(), b]));
  const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));

  const sql: string[] = [];
  let created = 0, updated = 0, rejected = 0;

  for (const r of rows) {
    const sku = r.sku;
    const problems: string[] = [];
    if (!sku) problems.push("missing sku");
    if (!r.name) problems.push("missing name");
    const brand = brandByName.get((r.brand ?? "").toLowerCase());
    if (!brand) problems.push(`unknown or inactive brand "${r.brand}"`);
    const category = catByName.get((r.category ?? "").toLowerCase());
    if (!category) problems.push(`unknown or inactive category "${r.category}"`);
    const price = Number(r.price);
    if (!Number.isFinite(price) || price < 0) problems.push(`bad price "${r.price}"`);
    // Optional `specs` column: a JSON object of {"Display name": "value"} for
    // feeds whose spec set varies per product (a converter from a distributor
    // export, say) and would need hundreds of spec: columns otherwise.
    let jsonSpecs: Record<string, unknown> = {};
    if (r.specs) {
      try {
        jsonSpecs = JSON.parse(r.specs);
      } catch {
        problems.push("specs column is not valid JSON");
      }
    }

    if (problems.length) {
      console.log(`  ✗ ${sku || "(no sku)"}  — ${problems.join("; ")}`);
      rejected++;
      continue;
    }

    const stockQty = Math.max(0, Math.floor(Number(r.stockQty) || 0));
    const comparePrice = r.comparePrice ? Number(r.comparePrice) : null;
    const weightKg = r.weightKg ? Number(r.weightKg) : null;
    const certifications = r.certifications
      ? r.certifications.split(";").map((c) => c.trim()).filter(Boolean)
      : [];
    const specs = specMeta
      .map((m) => ({ specKey: m.key, specName: m.name, value: r[m.col], unit: m.unit }))
      .filter((s) => s.value);
    for (const [name, value] of Object.entries(jsonSpecs)) {
      const v = String(value ?? "").trim();
      if (!v) continue;
      specs.push({ specKey: slugify(name).replace(/-/g, "_"), specName: name, value: v, unit: null });
    }

    const data = {
      name: r.name,
      slug: slugify(`${r.brand}-${sku}`),
      description: r.description || null,
      shortDesc: r.shortDesc || null,
      brandId: brand!.id,
      categoryId: category!.id,
      price,
      comparePrice,
      stockQty,
      stockStatus: stockStatusFor(stockQty),
      weightKg,
      datasheetUrl: r.datasheetUrl || null,
      manualUrl: r.manualUrl || null,
      cadUrl: r.cadUrl || null,
      // Json column: pass the array, not a string (see ingest-product-images.ts).
      certifications,
      replacementFor: r.replacementFor || null,
      isActive: true,
    };

    // Match on SKU first, then on slug: "G2R-1-T DC24" and "G2R-1-T-DC24" are
    // the same part written two ways by two distributors, and both slugify to
    // the same URL. Updating the existing row keeps the URL and its spec
    // history rather than failing on the unique slug.
    const existing =
      (await prisma.product.findUnique({ where: { sku }, select: { id: true } })) ??
      (await prisma.product.findUnique({ where: { slug: data.slug }, select: { id: true } }));

    if (COMMIT) {
      const product = existing
        ? await prisma.product.update({ where: { id: existing.id }, data })
        : await prisma.product.create({ data: { sku, ...data, images: [] } });
      await prisma.productSpec.deleteMany({ where: { productId: product.id } });
      if (specs.length) {
        await prisma.productSpec.createMany({
          data: specs.map((s) => ({ ...s, productId: product.id, valueNum: Number.isFinite(Number(s.value)) ? Number(s.value) : null })),
        });
      }

      // Production mirror of the same change. Product ids are cuids generated
      // locally, so the same id is used on both sides and specs can reference it.
      const id = product.id;
      const cols: Record<string, string> = {
        id: q(id), sku: q(sku), name: q(data.name), slug: q(data.slug),
        description: q(data.description), shortDesc: q(data.shortDesc),
        brandId: q(data.brandId), categoryId: q(data.categoryId),
        price: String(price), comparePrice: comparePrice == null ? "NULL" : String(comparePrice),
        stockQty: String(stockQty), stockStatus: q(data.stockStatus),
        weightKg: weightKg == null ? "NULL" : String(weightKg),
        images: q("[]"), datasheetUrl: q(data.datasheetUrl), manualUrl: q(data.manualUrl), cadUrl: q(data.cadUrl),
        certifications: q(JSON.stringify(certifications)), replacementFor: q(data.replacementFor),
        isActive: "1", isFeatured: "0", isDiscontinued: "0",
        createdAt: "CURRENT_TIMESTAMP", updatedAt: "CURRENT_TIMESTAMP",
      };
      // Always an upsert on id. A plain UPDATE would silently touch zero rows
      // if a previous local run was never synced to production — the import
      // would look complete locally and be missing on the site.
      const sets = Object.entries(cols).filter(([k]) => !["id", "sku", "images", "createdAt", "isFeatured", "isDiscontinued"].includes(k))
        .map(([k]) => `${k}=excluded.${k}`).join(", ");
      sql.push(
        `INSERT INTO Product (${Object.keys(cols).join(",")}) VALUES (${Object.values(cols).join(",")}) ` +
          `ON CONFLICT(id) DO UPDATE SET ${sets};`
      );
      sql.push(`DELETE FROM ProductSpec WHERE productId=${q(id)};`);
      for (const s of specs) {
        const num = Number.isFinite(Number(s.value)) ? String(Number(s.value)) : "NULL";
        sql.push(
          `INSERT INTO ProductSpec (id,productId,specKey,specName,value,valueNum,unit) VALUES (` +
            `${q(`${id}-${s.specKey}`)},${q(id)},${q(s.specKey)},${q(s.specName)},${q(s.value)},${num},${q(s.unit)});`
        );
      }
    }

    console.log(`  ${existing ? "↻" : "+"} ${sku}  ${r.name.slice(0, 50)}  · ${specs.length} spec(s)`);
    existing ? updated++ : created++;
  }

  console.log(`\n${created} created, ${updated} updated, ${rejected} rejected.`);

  if (COMMIT && sql.length) {
    const out = resolve(process.cwd(), "import-templates/.d1-sync.sql");
    writeFileSync(out, sql.join("\n") + "\n");
    console.log(`\nProduction sync written to import-templates/.d1-sync.sql — apply with:`);
    console.log(`  npx wrangler d1 execute nexumotion --remote --file=import-templates/.d1-sync.sql`);
    console.log(`Then add photos (scripts/ingest-product-images.ts) and publish: npm run catalog:publish`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
