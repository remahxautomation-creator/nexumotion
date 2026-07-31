import { PrismaClient } from "@prisma/client";
import { brandIntel } from "./seed-data/brand-intel";

const prisma = new PrismaClient();

async function main() {
  let updated = 0;
  const missing: string[] = [];

  for (const b of brandIntel) {
    const brand = await prisma.brand.findFirst({ where: { name: b.name } });
    if (!brand) {
      missing.push(b.name);
      continue;
    }
    await prisma.brand.update({
      where: { id: brand.id },
      data: {
        website: b.website,
        description: `${brand.description ?? ""}\n\nRegional demand: Tier ${b.tier}. ${b.note}`.trim(),
      },
    });
    updated++;
  }

  console.log(`Updated ${updated} brands with website + regional demand intel.`);
  if (missing.length) console.log(`Not matched in DB (skipped): ${missing.join(", ")}`);

  // Report the brand x category coverage matrix
  const byTier: Record<number, string[]> = { 1: [], 2: [], 3: [] };
  for (const b of brandIntel) byTier[b.tier].push(b.name);
  for (const tier of [1, 2, 3]) {
    console.log(`\nTier ${tier} (${byTier[tier].length}): ${byTier[tier].join(", ")}`);
  }

  const catCount = new Map<string, number>();
  for (const b of brandIntel) {
    for (const c of b.focus) catCount.set(c, (catCount.get(c) ?? 0) + 1);
  }
  console.log("\nBrands competing per category:");
  for (const [cat, n] of [...catCount.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(2)} — ${cat}`);
  }

  process.exit(0);
}

main();
