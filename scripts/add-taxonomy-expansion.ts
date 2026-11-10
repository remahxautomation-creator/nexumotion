/**
 * Adds the November 2026 expansion brands and categories (with their spec
 * templates) from prisma/seed-data/expansion-2026-11.ts.
 *
 *   npx tsx scripts/add-taxonomy-expansion.ts            # dry run: writes the SQL only
 *   npx tsx scripts/add-taxonomy-expansion.ts --commit   # also applies it to the local DB
 *   npx wrangler d1 execute nexumotion --remote --file=prisma/taxonomy-expansion.sql
 *
 * The SQL is the single source for both places, so the local database and D1
 * cannot drift. Inserts are guarded by NOT EXISTS and the updates only flip
 * isActive back on, so the file is safe to apply twice and safe against rows
 * created by hand in the admin.
 *
 * Rows soft-deleted by the 2026-09-15 pruning (commit c240ef4) are reactivated,
 * not duplicated: "Enclosures & Cooling", "Operator Devices", and the base
 * brands in expansionReactivateBrands. Their old products stay inactive.
 *
 * Only this expansion set is written. Running seed-taxonomy.ts against
 * production would also recreate the base categories that were deliberately
 * left out of the live catalogue.
 *
 * New brands and categories stay invisible on the site until they have
 * products: the published snapshot lists only brands and categories with at
 * least one active product (scripts/build-snapshot.ts).
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  expansionBrands,
  expansionBrandIntel,
  expansionCategories,
  expansionReactivateBrands,
  expansionReactivateCategories,
} from "../prisma/seed-data/expansion-2026-11";
import { brands as baseBrands } from "../prisma/seed-data/brands";
import { categories as baseCategories, type CategorySeed } from "../prisma/seed-data/categories";

const COMMIT = process.argv.includes("--commit");
const OUT = resolve(process.cwd(), "prisma/taxonomy-expansion.sql");

const q = (v: string | null | undefined) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type BrandRow = { name: string; country: string; description: string };

/** Expansion brands, plus base brands that the pruning may have soft-deleted. */
function brandSet(): BrandRow[] {
  const extra = expansionReactivateBrands.map((name) => {
    const b = baseBrands.find((x) => x.name === name);
    if (!b) throw new Error(`expansionReactivateBrands: "${name}" is not in brands.ts`);
    return b;
  });
  return [...expansionBrands, ...extra];
}

function categorySet(): CategorySeed[] {
  const extra = expansionReactivateCategories.map((name) => {
    const c = baseCategories.find((x) => x.name === name);
    if (!c) throw new Error(`expansionReactivateCategories: "${name}" is not in categories.ts`);
    return c;
  });
  return [...expansionCategories, ...extra];
}

export function buildSql(): string[] {
  const sql: string[] = [];
  const intel = new Map(expansionBrandIntel.map((b) => [b.name, b]));

  for (const b of brandSet()) {
    const slug = slugify(b.name);
    const website = intel.get(b.name)?.website ?? null;
    const match = `(lower(name)=lower(${q(b.name)}) OR slug=${q(slug)})`;
    sql.push(
      `INSERT INTO Brand (id,name,slug,country,description,website,isActive) ` +
        `SELECT ${q(`brand-${slug}`)},${q(b.name)},${q(slug)},${q(b.country)},${q(b.description)},${q(website)},1 ` +
        `WHERE NOT EXISTS (SELECT 1 FROM Brand WHERE ${match});`
    );
    // Soft-deleted by the September pruning: bring it back rather than fork it.
    sql.push(`UPDATE Brand SET isActive=1 WHERE ${match} AND isActive=0;`);
  }

  for (const c of categorySet()) {
    const slug = slugify(c.name);
    const match = `(lower(name)=lower(${q(c.name)}) OR slug=${q(slug)})`;
    const catId = `(SELECT id FROM Category WHERE ${match} ORDER BY isActive DESC LIMIT 1)`;
    sql.push(
      `INSERT INTO Category (id,name,slug,description,sortOrder,isActive) ` +
        `SELECT ${q(`cat-${slug}`)},${q(c.name)},${q(slug)},${q(c.description)},` +
        `(SELECT COALESCE(MAX(sortOrder),0)+1 FROM Category),1 ` +
        `WHERE NOT EXISTS (SELECT 1 FROM Category WHERE ${match});`
    );
    sql.push(
      `UPDATE Category SET isActive=1, description=${q(c.description)} ` +
        `WHERE id=${catId} AND (isActive=0 OR description IS NOT ${q(c.description)});`
    );
    c.specs.forEach((s, j) => {
      sql.push(
        `INSERT INTO SpecTemplate (id,categoryId,name,key,unit,dataType,sortOrder,isFilterable,isVisible,options) ` +
          `SELECT ${q(`spec-${slug}-${s.key}`)},${catId},${q(s.name)},${q(s.key)},${q(s.unit)},` +
          `${q(s.dataType ?? "TEXT")},${j},1,1,${q(JSON.stringify(s.options ?? []))} ` +
          `WHERE ${catId} IS NOT NULL AND NOT EXISTS ` +
          `(SELECT 1 FROM SpecTemplate WHERE categoryId=${catId} AND key=${q(s.key)});`
      );
    });
  }
  return sql;
}

async function main() {
  const sql = buildSql();
  writeFileSync(OUT, sql.join("\n") + "\n");
  const cats = categorySet();
  const specCount = cats.reduce((n, c) => n + c.specs.length, 0);
  console.log(`${brandSet().length} brands, ${cats.length} categories, ${specCount} spec templates (created or reactivated)`);
  console.log(`SQL written to prisma/taxonomy-expansion.sql (${sql.length} statements)`);

  if (!COMMIT) {
    console.log("\nDRY RUN — local database untouched. Re-run with --commit to apply locally.");
    return;
  }

  const prisma = new PrismaClient();
  try {
    let changed = 0;
    for (const stmt of sql) changed += await prisma.$executeRawUnsafe(stmt);
    console.log(`\nApplied locally: ${changed} row(s) inserted or reactivated (0 means it was already applied).`);
  } finally {
    await prisma.$disconnect();
  }
  console.log("Production: npx wrangler d1 execute nexumotion --remote --file=prisma/taxonomy-expansion.sql");
}

if (process.argv[1]?.endsWith("add-taxonomy-expansion.ts")) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
