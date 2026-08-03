/**
 * Backfills two fields the first import skipped:
 *  - datasheetUrl, from the CSV's datasheet column
 *  - weightKg, parsed from the "Weight" spec where the source carries one
 *
 * Weight is only present on ~13% of lines. The rest keep weightKg = null and
 * fall back to the per-category estimate in lib/pricing.ts at checkout.
 *
 * Run: npx tsx scripts/backfill-datasheets-weights.ts [--commit]
 */
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { parseCsv } from "../src/lib/csv";

const CSV = "C:/Users/pc shop/Downloads/rs brands - targeted_brands (1).csv";
const COMMIT = process.argv.includes("--commit");
const prisma = new PrismaClient();

const C = { mpn: 3, datasheet: 9, specs: 17 };

/** "165g" | "1.2 kg" | "450 g" → kilograms */
function parseWeightKg(raw: string): number | null {
  const s = String(raw).trim().toLowerCase();
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*(kg|kgs|g|grams?|lb|lbs)?/);
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = m[2] ?? "g";
  const kg =
    unit.startsWith("kg") ? n :
    unit.startsWith("lb") ? n * 0.4536 :
    n / 1000; // grams
  if (kg <= 0 || kg > 2000) return null; // implausible → ignore
  return Math.round(kg * 1000) / 1000;
}

async function main() {
  const rows = parseCsv(readFileSync(CSV, "utf8")).slice(1).filter((r) => r.length >= 18);

  const bySku = new Map<string, { datasheet: string | null; weightKg: number | null }>();
  for (const r of rows) {
    const sku = (r[C.mpn] ?? "").trim();
    if (!sku || bySku.has(sku)) continue;

    const ds = (r[C.datasheet] ?? "").trim();
    const datasheet = ds.startsWith("https://") ? ds : null;

    let weightKg: number | null = null;
    try {
      const specs = JSON.parse(r[C.specs] || "{}") as Record<string, string>;
      const key = Object.keys(specs).find((k) => k.toLowerCase() === "weight");
      if (key) weightKg = parseWeightKg(specs[key]);
    } catch { /* ignore malformed spec blob */ }

    bySku.set(sku, { datasheet, weightKg });
  }

  const products = await prisma.product.findMany({ select: { id: true, sku: true } });
  let dsSet = 0, wSet = 0, missed = 0;

  for (const p of products) {
    const src = bySku.get(p.sku);
    if (!src) { missed++; continue; }
    const data: { datasheetUrl?: string; weightKg?: number } = {};
    if (src.datasheet) { data.datasheetUrl = src.datasheet; dsSet++; }
    if (src.weightKg !== null) { data.weightKg = src.weightKg; wSet++; }
    if (Object.keys(data).length === 0) continue;
    if (COMMIT) await prisma.product.update({ where: { id: p.id }, data });
  }

  console.log("catalogue products     :", products.length);
  console.log("datasheet URL available:", dsSet);
  console.log("real weight available  :", wSet, `(${Math.round((wSet / products.length) * 100)}%)`);
  console.log("no CSV row matched     :", missed);
  console.log(COMMIT ? "\nApplied." : "\nDRY RUN — re-run with --commit.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
