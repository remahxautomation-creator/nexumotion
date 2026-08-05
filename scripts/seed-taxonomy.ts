/**
 * Seeds the catalogue taxonomy — the 20 base categories with their filterable
 * spec templates, and the 50 researched brands.
 *
 * prisma/seed.ts does this too, but it also generates 485 demo products, which
 * is exactly what the real import replaces. This is the taxonomy half on its
 * own, so a fresh database can be prepared before importing real parts.
 *
 * Idempotent: existing categories and brands are left alone.
 *
 * Run: npx tsx scripts/seed-taxonomy.ts [--commit]
 */
import { PrismaClient } from "@prisma/client";
import { categories } from "../prisma/seed-data/categories";
import { brands } from "../prisma/seed-data/brands";

const prisma = new PrismaClient();
const COMMIT = process.argv.includes("--commit");

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  const existingCats = await prisma.category.findMany({ select: { name: true } });
  const haveCat = new Set(existingCats.map((c) => c.name));

  let catsCreated = 0, templatesCreated = 0;
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    if (haveCat.has(c.name)) continue;
    catsCreated++;
    if (!COMMIT) { templatesCreated += c.specs.length; continue; }

    const created = await prisma.category.create({
      data: { name: c.name, slug: slugify(c.name), description: c.description, sortOrder: i },
    });
    for (let j = 0; j < c.specs.length; j++) {
      const s = c.specs[j];
      await prisma.specTemplate.create({
        data: {
          categoryId: created.id,
          name: s.name,
          key: s.key,
          unit: s.unit ?? null,
          dataType: s.dataType ?? "TEXT",
          sortOrder: j,
          options: JSON.stringify(s.options ?? []),
        },
      });
      templatesCreated++;
    }
  }

  const existingBrands = await prisma.brand.findMany({ select: { name: true, slug: true } });
  const haveBrandName = new Set(existingBrands.map((b) => b.name.toLowerCase()));
  const haveBrandSlug = new Set(existingBrands.map((b) => b.slug));

  let brandsCreated = 0;
  for (const b of brands) {
    if (haveBrandName.has(b.name.toLowerCase())) continue;
    const slug = slugify(b.name);
    if (haveBrandSlug.has(slug)) continue; // e.g. "Allen Bradley" vs "Allen-Bradley"
    brandsCreated++;
    haveBrandName.add(b.name.toLowerCase());
    haveBrandSlug.add(slug);
    if (!COMMIT) continue;
    await prisma.brand.create({
      data: { name: b.name, slug, country: b.country, description: b.description },
    });
  }

  console.log("categories created :", catsCreated, `(of ${categories.length} defined)`);
  console.log("spec templates     :", templatesCreated);
  console.log("brands created     :", brandsCreated, `(of ${brands.length} defined)`);
  console.log(COMMIT ? "\nApplied." : "\nDRY RUN — re-run with --commit.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
