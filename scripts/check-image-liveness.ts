/**
 * Samples stored image URLs and reports how many still resolve upstream.
 * The URLs came from a third-party CDN, so some have already been rotated.
 */
import { PrismaClient } from "@prisma/client";
import { parseJsonArray } from "../src/lib/utils";

const prisma = new PrismaClient();
const SAMPLE = Number(process.argv[2] ?? 80);

async function alive(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  // `images` is a Json column, so filter in JS rather than with a string match.
  const all = await prisma.product.findMany({ select: { sku: true, images: true } });
  const products = all.filter((p) => parseJsonArray(p.images).length > 0);

  // Evenly spaced sample across the catalogue rather than the first N.
  const step = Math.max(1, Math.floor(products.length / SAMPLE));
  const sample = products.filter((_, i) => i % step === 0).slice(0, SAMPLE);

  let ok = 0, dead = 0;
  const deadSkus: string[] = [];

  await Promise.all(
    sample.map(async (p) => {
      const first = parseJsonArray(p.images)[0];
      if (!first) return;
      if (await alive(first)) ok++;
      else { dead++; if (deadSkus.length < 6) deadSkus.push(p.sku); }
    })
  );

  const total = ok + dead;
  console.log(`products with stored images : ${products.length}`);
  console.log(`sampled                     : ${total}`);
  console.log(`primary image resolves      : ${ok} (${Math.round((ok / total) * 100)}%)`);
  console.log(`primary image 404/unreachable: ${dead} (${Math.round((dead / total) * 100)}%)`);
  if (deadSkus.length) console.log(`examples of dead: ${deadSkus.join(", ")}`);
  process.exit(0);
}
main();
