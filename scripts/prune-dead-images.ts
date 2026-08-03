/**
 * Removes image URLs that no longer resolve upstream.
 *
 * ~55% of the URLs supplied in the CSV have already been rotated off the
 * source CDN. Leaving them in the database means every page view re-requests
 * a dead asset: the image optimiser queues the fetch, waits for the 404, and
 * the card sits blank until it gives up. Pruning them makes the placeholder
 * render immediately instead.
 *
 * Run: npx tsx scripts/prune-dead-images.ts [--commit]
 */
import { PrismaClient } from "@prisma/client";
import { parseJsonArray } from "../src/lib/utils";

const prisma = new PrismaClient();
const COMMIT = process.argv.includes("--commit");
const CONCURRENCY = 24;
const TIMEOUT_MS = 7000;

async function alive(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

/** Runs `worker` over `items` with a fixed concurrency ceiling. */
async function pool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx]);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const all = await prisma.product.findMany({ select: { id: true, sku: true, images: true } });
  const targets = all
    .map((p) => ({ ...p, urls: parseJsonArray(p.images) }))
    .filter((p) => p.urls.length > 0);

  const totalUrls = targets.reduce((n, p) => n + p.urls.length, 0);
  console.log(`products with images : ${targets.length}`);
  console.log(`image URLs to check  : ${totalUrls}`);
  console.log("checking...\n");

  // Cache by URL — the same asset can appear on more than one product.
  const seen = new Map<string, boolean>();
  const uniqueUrls = [...new Set(targets.flatMap((p) => p.urls))];

  let done = 0;
  await pool(uniqueUrls, CONCURRENCY, async (url) => {
    seen.set(url, await alive(url));
    if (++done % 250 === 0) console.log(`  checked ${done}/${uniqueUrls.length}`);
  });

  const liveUrls = [...seen.values()].filter(Boolean).length;
  console.log(`\nunique URLs      : ${uniqueUrls.length}`);
  console.log(`still resolve    : ${liveUrls} (${Math.round((liveUrls / uniqueUrls.length) * 100)}%)`);
  console.log(`dead             : ${uniqueUrls.length - liveUrls}`);

  let productsCleared = 0, productsTrimmed = 0, urlsRemoved = 0;
  for (const p of targets) {
    const kept = p.urls.filter((u) => seen.get(u));
    if (kept.length === p.urls.length) continue;
    urlsRemoved += p.urls.length - kept.length;
    if (kept.length === 0) productsCleared++;
    else productsTrimmed++;
    if (COMMIT) {
      await prisma.product.update({
        where: { id: p.id },
        data: { images: JSON.stringify(kept) },
      });
    }
  }

  console.log(`\nproducts left with no image : ${productsCleared}`);
  console.log(`products with some removed  : ${productsTrimmed}`);
  console.log(`URL entries removed         : ${urlsRemoved}`);
  console.log(`products keeping >=1 image  : ${targets.length - productsCleared}`);
  console.log(COMMIT ? "\nApplied." : "\nDRY RUN — re-run with --commit.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
