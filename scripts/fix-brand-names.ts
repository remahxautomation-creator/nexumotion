/**
 * The source CSV lost some non-ASCII characters in manufacturer names, leaving
 * a literal "?" (e.g. "EMERSON ? ASCO", which should be an en-dash). Repair the
 * visible damage. Run with --commit to apply.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const COMMIT = process.argv.includes("--commit");

async function main() {
  const damaged = await prisma.brand.findMany({
    where: { name: { contains: "?" } },
    include: { _count: { select: { products: true } } },
  });

  console.log("brands containing '?':", damaged.length);
  for (const b of damaged) {
    // " ? " between words was an en-dash; a trailing/leading "?" is dropped.
    const fixed = b.name
      .replace(/\s*\?\s*/g, " – ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^–\s*|\s*–$/g, "")
      .trim();
    console.log(`  "${b.name}" -> "${fixed}"  (${b._count.products} products)`);
    if (COMMIT && fixed && fixed !== b.name) {
      await prisma.brand.update({ where: { id: b.id }, data: { name: fixed } });
    }
  }

  // Same damage can appear in product names.
  const badProducts = await prisma.product.findMany({
    where: { name: { contains: "?" } },
    select: { id: true, name: true },
  });
  console.log("\nproducts containing '?':", badProducts.length);
  let fixedCount = 0;
  for (const p of badProducts) {
    const fixed = p.name.replace(/\s+\?\s+/g, " – ").replace(/\s+/g, " ").trim();
    if (fixed === p.name) continue;
    if (COMMIT) await prisma.product.update({ where: { id: p.id }, data: { name: fixed } });
    fixedCount++;
  }
  console.log("product names repaired:", fixedCount);

  console.log(COMMIT ? "\nApplied." : "\nDRY RUN — re-run with --commit.");
  process.exit(0);
}
main();
