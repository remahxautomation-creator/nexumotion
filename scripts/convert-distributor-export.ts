/**
 * Turns the rs_scraper export (nexu_catalog.csv) into an import CSV for
 * scripts/import-products.ts.
 *
 *   npx tsx scripts/convert-distributor-export.ts <export.csv> <out.csv>
 *
 * What is carried over and what is deliberately left behind:
 *
 *   kept     manufacturer part number, name, brand, category (the export's
 *            `scope` column already uses the site's category names), price,
 *            datasheet link, specifications.
 *   dropped  description — it is the distributor's own marketing copy, and
 *            copying it is the same problem as copying their photographs.
 *            The product page shows the name, specs and datasheet instead.
 *   dropped  image_url — distributor photography, see ingest-product-images.ts.
 *   dropped  stock — we do not hold the distributor's stock. Everything imports
 *            as backorder, which is honest; the admin can raise stockQty for
 *            parts actually on the shelf.
 *   skipped  rows marked Obsolete. Listing a part the manufacturer has ended
 *            invites enquiries we cannot fulfil.
 *
 * Price: the export is GBP ex-VAT (or USD from the DigiKey rows). The site
 * lists USD, so GBP is converted at GBP_USD below — set it to the current rate
 * before running. These are list prices to be reviewed, not quotations.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { parseCsv } from "../src/lib/csv";

const GBP_USD = Number(process.env.GBP_USD ?? "1.28");

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error("Usage: npx tsx scripts/convert-distributor-export.ts <export.csv> <out.csv>");
  process.exit(1);
}

const table = parseCsv(readFileSync(src, "utf8").replace(/^﻿/, ""));
const header = table[0];
const rows = table.slice(1).filter((r) => r.some((c) => c.trim()))
  .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

const outHeader = ["sku", "name", "brand", "category", "price", "stockQty", "shortDesc", "datasheetUrl", "specs"];
const lines = [outHeader.join(",")];
let skipped = 0;

for (const r of rows) {
  if (r.stock_status === "Obsolete") { skipped++; continue; }

  // Some ABB rows carry two identifiers separated by a double space
  // ("1SNA645051R0400  OBOC2000-24VDC"): the order code, then the type. The
  // order code is what a buyer quotes.
  const sku = r.manufacturer_part_number.split(/\s{2,}/)[0].trim();

  const raw = r.price_gbp.replace(/,/g, "");
  let price: number;
  if (raw.startsWith("£")) price = Number(raw.slice(1)) * GBP_USD;
  else if (raw.startsWith("$")) price = Number(raw.slice(1));
  else { console.log(`  ? ${sku} price "${r.price_gbp}" — set to 0`); price = 0; }
  price = Math.round(price * 100) / 100;

  let specs: Record<string, string> = {};
  try {
    specs = JSON.parse(r.specifications || "{}");
  } catch { /* leave empty */ }
  delete specs.Brand; // redundant with the brand field
  if (r.pack_size && r.pack_size !== "1") specs["Pack Size"] = r.pack_size;
  if (r.country_of_origin) specs["Country of Origin"] = r.country_of_origin;

  const shortDesc = r.name.length > 140 ? r.name.slice(0, 137) + "…" : r.name;

  lines.push([
    sku, r.name, r.brand, r.scope, String(price), "0", shortDesc, r.pdf_sheet, JSON.stringify(specs),
  ].map(csvCell).join(","));
}

writeFileSync(out, lines.join("\n") + "\n");
console.log(`${lines.length - 1} rows written to ${out}, ${skipped} obsolete rows skipped (GBP→USD ${GBP_USD}).`);
