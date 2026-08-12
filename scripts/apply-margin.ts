/**
 * Applies a selling margin over the imported supplier prices.
 *
 * Every price in the catalogue is currently RS Components' UK retail figure,
 * imported verbatim. Selling at that number means selling at zero margin, and
 * in most cases below cost once shipping and customs are counted — so the
 * catalogue is not sellable until this has been run.
 *
 * The original figure is preserved in `comparePrice` before the first markup,
 * so this can be re-run with a different margin without compounding. Running
 * it twice at 40% must not produce 96%.
 *
 * Run:
 *   npx tsx scripts/apply-margin.ts --margin 40                 (dry run)
 *   npx tsx scripts/apply-margin.ts --margin 40 --commit
 *   npx tsx scripts/apply-margin.ts --margin 40 --category drives-vfds --commit
 *   npx tsx scripts/apply-margin.ts --reset --commit            (back to source)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const arg = (name: string): string | null => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] ?? null : null;
};
const COMMIT = process.argv.includes("--commit");
const RESET = process.argv.includes("--reset");
const CATEGORY = arg("category");
const MARGIN = Number(arg("margin"));

const money = (n: number) => Math.round(n * 100) / 100;

async function main() {
  if (!RESET && (!Number.isFinite(MARGIN) || MARGIN <= 0 || MARGIN > 500)) {
    console.error("Usage: --margin <percent 1-500> [--category <slug>] [--commit]");
    console.error("   or: --reset [--commit]   to restore the original supplier prices");
    process.exit(1);
  }

  const where = {
    isActive: true,
    ...(CATEGORY ? { category: { slug: CATEGORY } } : {}),
  };

  const products = await prisma.product.findMany({
    where,
    select: { id: true, sku: true, price: true, comparePrice: true },
  });

  if (!products.length) {
    console.error(CATEGORY ? `No active products in category "${CATEGORY}".` : "No active products.");
    process.exit(1);
  }

  console.log(`scope     : ${CATEGORY ? `category ${CATEGORY}` : "whole catalogue"}`);
  console.log(`products  : ${products.length}`);

  let changed = 0;
  const samples: string[] = [];

  for (const p of products) {
    // The supplier price is comparePrice once a margin has been applied;
    // before that it is still in price. This is what makes re-running safe.
    const base = Number(p.comparePrice ?? p.price);
    if (!Number.isFinite(base) || base <= 0) continue;

    const next = RESET ? money(base) : money(base * (1 + MARGIN / 100));
    if (next === Number(p.price) && (RESET ? p.comparePrice === null : true)) continue;

    changed++;
    if (samples.length < 5) {
      samples.push(`  ${p.sku.padEnd(24)} ${base.toFixed(2)} → ${next.toFixed(2)}`);
    }

    if (COMMIT) {
      await prisma.product.update({
        where: { id: p.id },
        data: RESET
          ? { price: next, comparePrice: null }
          : { price: next, comparePrice: base },
      });
    }
  }

  console.log(RESET ? "action    : restore supplier prices" : `margin    : +${MARGIN}%`);
  console.log(`to change : ${changed}`);
  if (samples.length) {
    console.log("\nsample:");
    console.log(samples.join("\n"));
  }
  console.log(COMMIT ? "\nApplied." : "\nDRY RUN — re-run with --commit.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(String(e).slice(0, 400));
    process.exit(1);
  });
