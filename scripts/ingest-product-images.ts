/**
 * Ingests product photographs from a drop folder into the site.
 *
 *   npx tsx scripts/ingest-product-images.ts            # dry run
 *   npx tsx scripts/ingest-product-images.ts --commit   # write files + database
 *
 * Drop folder layout — one folder per SKU, any common image format, any order:
 *
 *   import-images/
 *     3LD2203-0TK53/
 *       front.jpg
 *       side.png
 *       label.jpg
 *     HMIG3XFH/
 *       1.jpg
 *
 * For each SKU that exists in the catalogue, every image is:
 *   - re-encoded as WebP, EXIF stripped (phone photos carry GPS and device
 *     data that has no business on a public site);
 *   - resized to at most 1200px on the long edge, which is more than the
 *     largest slot on the product page renders at 2x;
 *   - written to public/products/<sku>/<n>.webp, and served by the same
 *     assets binding as the catalogue mirror — no object storage needed;
 *   - recorded in Product.images as a clean JSON array of site-relative paths.
 *
 * Filenames are sorted, so name the primary image so it sorts first
 * (`01-front.jpg`, `02-side.jpg`) — images[0] is what the product card shows.
 *
 * Why a folder and a script rather than an upload button in the admin: the
 * site runs on Cloudflare's free tier with static assets, and a Worker cannot
 * write files at runtime. Uploads would need object storage (R2), which is not
 * enabled. This path costs nothing, keeps every image in git with the product
 * data it belongs to, and runs through the same publish step as everything
 * else: `npm run catalog:publish` after this, then commit.
 *
 * Only photographs the business owns or is licensed to use belong here. The
 * catalogue previously carried 412 URLs pointing at a competing distributor's
 * photography; those were removed, and this script is not a way to put them
 * back.
 */
import { readdirSync, statSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { resolve, join, extname } from "node:path";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

const DROP = resolve(process.cwd(), "import-images");
const OUT = resolve(process.cwd(), "public/products");
const COMMIT = process.argv.includes("--commit");
const MAX_EDGE = 1200;
const QUALITY = 82;
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".heic", ".avif"]);

const prisma = new PrismaClient();

/** Folder names are SKUs; a SKU can contain characters awkward in paths. */
const skuToDir = (sku: string) => sku.replace(/[^A-Za-z0-9._-]+/g, "_");

async function main() {
  if (!existsSync(DROP)) {
    console.log(`No drop folder at ${DROP}.\nCreate it with one sub-folder per SKU and put the photos inside.`);
    return;
  }

  const skuDirs = readdirSync(DROP).filter((d) => statSync(join(DROP, d)).isDirectory());
  if (skuDirs.length === 0) {
    console.log("Drop folder is empty — nothing to ingest.");
    return;
  }

  console.log(`${skuDirs.length} SKU folder(s) in import-images/${COMMIT ? "" : "   (dry run — add --commit to write)"}\n`);

  const d1Statements: string[] = [];
  let written = 0;
  let skipped = 0;

  for (const sku of skuDirs) {
    const product = await prisma.product.findFirst({ where: { sku }, select: { id: true, sku: true, isActive: true } });
    if (!product) {
      console.log(`  ✗ ${sku}  — not in the catalogue, skipped. Import the product row first.`);
      skipped++;
      continue;
    }
    if (!product.isActive) {
      console.log(`  ✗ ${sku}  — product is inactive, skipped.`);
      skipped++;
      continue;
    }

    const files = readdirSync(join(DROP, sku))
      .filter((f) => EXT.has(extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (files.length === 0) {
      console.log(`  ✗ ${sku}  — folder has no image files, skipped.`);
      skipped++;
      continue;
    }

    const dir = skuToDir(sku);
    const outDir = join(OUT, dir);
    const paths: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const src = join(DROP, sku, files[i]);
      const name = `${i + 1}.webp`;
      const dest = join(outDir, name);

      if (COMMIT) {
        mkdirSync(outDir, { recursive: true });
        await sharp(src)
          .rotate() // honour EXIF orientation before stripping it
          .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(dest);
      }
      paths.push(`/products/${dir}/${name}`);
    }

    const json = JSON.stringify(paths);
    if (COMMIT) {
      // The array itself, not its JSON string. `images` is a Prisma Json column:
      // passing a string stores a JSON *string* whose contents happen to be an
      // array — the double-encoding that broke every image in the original
      // import. The raw SQL for production below is the plain JSON text, which
      // is the correct representation on that side.
      await prisma.product.update({ where: { id: product.id }, data: { images: paths } });
      // Same change for production. Quoted for SQL; SKUs and paths never contain
      // a single quote, but escape defensively rather than assume.
      d1Statements.push(
        `UPDATE Product SET images='${json.replace(/'/g, "''")}' WHERE sku='${sku.replace(/'/g, "''")}';`
      );
    }

    const sizes = COMMIT
      ? " · " + files.map((_, i) => (statSync(join(outDir, `${i + 1}.webp`)).size / 1024).toFixed(0) + "KB").join(" ")
      : "";
    console.log(`  ✓ ${sku}  ${files.length} image(s)${sizes}`);
    written++;
  }

  console.log(`\n${written} product(s) updated, ${skipped} skipped.`);

  if (COMMIT && d1Statements.length) {
    const sqlPath = resolve(process.cwd(), "import-images/.d1-sync.sql");
    writeFileSync(sqlPath, d1Statements.join("\n") + "\n");
    console.log(`\nProduction sync written to import-images/.d1-sync.sql — apply with:`);
    console.log(`  npx wrangler d1 execute nexumotion --remote --file=import-images/.d1-sync.sql`);
    console.log(`Then publish:  npm run catalog:publish   and commit public/products/.`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
