/**
 * Adds the November 2026 expansion brands and categories (with their spec
 * templates) from prisma/seed-data/expansion-2026-11.ts.
 *
 *   npx tsx scripts/add-taxonomy-expansion.ts            # dry run: writes the SQL only
 *   npx tsx scripts/add-taxonomy-expansion.ts --commit   # also applies it to the local DB
 *   npx wrangler d1 execute nexumotion --remote --file=prisma/taxonomy-expansion.sql
 *
 * The SQL is the single source for both places, so the local database and D1
 * cannot drift. Every statement is guarded by NOT EXISTS, which makes the file
 * safe to apply twice and safe against rows created by hand in the admin.
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
} from "../prisma/seed-data/expansion-2026-11";

const COMMIT = process.argv.includes("--commit");
const OUT = resolve(process.cwd(), "prisma/taxonomy-expansion.sql");

const q = (v: string | null | undefined) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function buildSql(): string[] {
  const sql: string[] = [];
  const intel = new Map(expansionBrandIntel.map((b) => [b.name, b]));

  for (const b of expansionBrands) {
    const slug = slugify(b.name);
    const website = intel.get(b.name)?.website ?? null;
    sql.push(
      `INSERT INTO Brand (id,name,slug,country,description,website,isActive) ` +
        `SELECT ${q(`brand-${slug}`)},${q(b.name)},${q(slug)},${q(b.country)},${q(b.description)},${q(website)},1 ` +
        `WHERE NOT EXISTS (SELECT 1 FROM Brand WHERE lower(name)=lower(${q(b.name)}) OR slug=${q(slug)});`
    );
  }

  for (const c of expansionCategories) {
    const slug = slugify(c.name);
    sql.push(
      `INSERT INTO Category (id,name,slug,description,sortOrder,isActive) ` +
        `SELECT ${q(`cat-${slug}`)},${q(c.name)},${q(slug)},${q(c.description)},` +
        `(SELECT COALESCE(MAX(sortOrder),0)+1 FROM Category),1 ` +
        `WHERE NOT EXISTS (SELECT 1 FROM Category WHERE lower(name)=lower(${q(c.name)}) OR slug=${q(slug)});`
    );
    c.specs.forEach((s, j) => {
      // Resolve by slug, not by our generated id: if the category already
      // existed under another id, its templates still land on it.
      const catId = `(SELECT id FROM Category WHERE slug=${q(slug)})`;
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
  const specCount = expansionCategories.reduce((n, c) => n + c.specs.length, 0);
  console.log(`${expansionBrands.length} brands, ${expansionCategories.length} categories, ${specCount} spec templates`);
  console.log(`SQL written to prisma/taxonomy-expansion.sql (${sql.length} statements)`);

  if (!COMMIT) {
    console.log("\nDRY RUN — local database untouched. Re-run with --commit to apply locally.");
    return;
  }

  const prisma = new PrismaClient();
  try {
    let changed = 0;
    for (const stmt of sql) changed += await prisma.$executeRawUnsafe(stmt);
    console.log(`\nApplied locally: ${changed} row(s) inserted (0 means it was already applied).`);
  } finally {
    await prisma.$disconnect();
  }
  console.log("Production: npx wrangler d1 execute nexumotion --remote --file=prisma/taxonomy-expansion.sql");
}

if (process.argv[1]?.endsWith("add-taxonomy-expansion.ts")) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
