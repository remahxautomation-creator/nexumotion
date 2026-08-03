/** Reports which product fields are unpopulated, and where the gaps concentrate. */
import { PrismaClient } from "@prisma/client";
import { parseJsonArray } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { specs: true, crossReferences: true, priceTiers: true } },
    },
  });
  const n = products.length;
  const pct = (x: number) => `${x} (${Math.round((x / n) * 100)}%)`;

  const missing = {
    description: products.filter((p) => !p.description).length,
    shortDesc: products.filter((p) => !p.shortDesc).length,
    images: products.filter((p) => parseJsonArray(p.images).length === 0).length,
    datasheetUrl: products.filter((p) => !p.datasheetUrl).length,
    cadUrl: products.filter((p) => !p.cadUrl).length,
    manualUrl: products.filter((p) => !p.manualUrl).length,
    weightKg: products.filter((p) => p.weightKg === null).length,
    certifications: products.filter((p) => parseJsonArray(p.certifications).length === 0).length,
    comparePrice: products.filter((p) => p.comparePrice === null).length,
    stockQty: products.filter((p) => p.stockQty === 0).length,
    specs: products.filter((p) => p._count.specs === 0).length,
    crossReferences: products.filter((p) => p._count.crossReferences === 0).length,
    priceTiers: products.filter((p) => p._count.priceTiers === 0).length,
  };

  console.log(`=== FIELD COMPLETENESS — ${n} products ===\n`);
  console.log("field              missing");
  for (const [k, v] of Object.entries(missing).sort((a, b) => b[1] - a[1])) {
    console.log(k.padEnd(18), pct(v));
  }

  // Spec depth: a product with 3 specs is far less filterable than one with 15.
  const depths = products.map((p) => p._count.specs).sort((a, b) => a - b);
  const median = depths[Math.floor(depths.length / 2)];
  console.log(`\nspecs per product  : min ${depths[0]} | median ${median} | max ${depths[depths.length - 1]}`);
  console.log("products with <5 specs:", pct(products.filter((p) => p._count.specs < 5).length));

  // Which categories are worst served for images?
  const byCat = new Map<string, { total: number; noImg: number; noWeight: number }>();
  for (const p of products) {
    const c = p.category.name;
    const e = byCat.get(c) ?? { total: 0, noImg: 0, noWeight: 0 };
    e.total++;
    if (parseJsonArray(p.images).length === 0) e.noImg++;
    if (p.weightKg === null) e.noWeight++;
    byCat.set(c, e);
  }
  console.log("\n=== GAPS BY CATEGORY (no image / no weight) ===");
  for (const [c, e] of [...byCat.entries()].sort((a, b) => b[1].total - a[1].total)) {
    console.log(
      c.padEnd(24),
      `n=${String(e.total).padStart(4)}`,
      `noImage ${String(Math.round((e.noImg / e.total) * 100)).padStart(3)}%`,
      `noWeight ${String(Math.round((e.noWeight / e.total) * 100)).padStart(3)}%`
    );
  }

  // Manufacturers by volume — enrichment effort should follow these.
  const byBrand = new Map<string, number>();
  for (const p of products) byBrand.set(p.brand.name, (byBrand.get(p.brand.name) ?? 0) + 1);
  const top = [...byBrand.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  const covered = top.reduce((s, [, c]) => s + c, 0);
  console.log(`\n=== TOP 15 MANUFACTURERS (${covered} of ${n} products = ${Math.round((covered / n) * 100)}%) ===`);
  for (const [b, c] of top) console.log(String(c).padStart(4), b);

  process.exit(0);
}
main();
