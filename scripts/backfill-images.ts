/**
 * Backfills Product.images from the CSV's image_url column.
 *
 * The column holds one or more URLs separated by " | ". They are stored as-is
 * and rendered through next/image, which proxies and caches them via this
 * server — so the source host never appears in a customer-facing URL, and
 * repeat views do not hit their CDN.
 *
 * This is still not a substitute for owning the assets: the originals live on
 * the supplier's servers and will 404 if rotated. Manufacturer media portals
 * supply distributor-licensed product photography, which is the durable fix.
 *
 * Run: npx tsx scripts/backfill-images.ts [--commit]
 */
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { parseCsv } from "../src/lib/csv";

const CSV = "C:/Users/pc shop/Downloads/rs brands - targeted_brands (1).csv";
const COMMIT = process.argv.includes("--commit");
const prisma = new PrismaClient();

const C = { mpn: 3, imageUrl: 8 };
const MAX_PER_PRODUCT = 4;

async function main() {
  const rows = parseCsv(readFileSync(CSV, "utf8")).slice(1).filter((r) => r.length >= 18);

  const bySku = new Map<string, string[]>();
  for (const r of rows) {
    const sku = (r[C.mpn] ?? "").trim();
    if (!sku || bySku.has(sku)) continue;

    const urls = (r[C.imageUrl] ?? "")
      .split("|")
      .map((u) => u.trim())
      .filter((u) => /^https:\/\/\S+\.(jpg|jpeg|png|webp)$/i.test(u))
      .slice(0, MAX_PER_PRODUCT);

    if (urls.length) bySku.set(sku, urls);
  }

  const products = await prisma.product.findMany({ select: { id: true, sku: true } });
  let withImages = 0, imageTotal = 0;

  for (const p of products) {
    const urls = bySku.get(p.sku);
    if (!urls?.length) continue;
    withImages++;
    imageTotal += urls.length;
    if (COMMIT) {
      await prisma.product.update({
        where: { id: p.id },
        data: { images: JSON.stringify(urls) },
      });
    }
  }

  const hosts = new Map<string, number>();
  for (const urls of bySku.values()) {
    for (const u of urls) {
      try { const h = new URL(u).host; hosts.set(h, (hosts.get(h) ?? 0) + 1); } catch { /* skip */ }
    }
  }

  console.log("catalogue products :", products.length);
  console.log("with >=1 image     :", withImages, `(${Math.round((withImages / products.length) * 100)}%)`);
  console.log("total image URLs   :", imageTotal);
  console.log("hosts              :", [...hosts.entries()].map(([h, n]) => `${h} (${n})`).join(", "));
  console.log(COMMIT ? "\nApplied." : "\nDRY RUN — re-run with --commit.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
