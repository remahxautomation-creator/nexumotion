import { readFileSync } from "fs";
import { parseCsv } from "../src/lib/csv";

const path = "C:/Users/pc shop/Downloads/rs brands - targeted_brands (1).csv";
const rows = parseCsv(readFileSync(path, "utf8"));

console.log("total rows (incl header):", rows.length);
console.log("header cols:", rows[0].length);
console.log("header:", JSON.stringify(rows[0]));
console.log("data row col counts:", [...new Set(rows.slice(1).map((r) => r.length))].sort());

// Column indexes are inferred from the data, because the header row is short —
// it names 11 columns while the data carries 18.
const IDX = {
  brand: 0, category: 1, rsPart: 2, mpn: 3, manufacturer: 4,
  name: 5, description: 6, url: 7, imageUrl: 8, datasheet: 9,
  documents: 10, priceGbp: 11, stock: 12, origin: 13, specs: 17,
};

const body = rows.slice(1).filter((r) => r.length > 12);
console.log("\nusable data rows:", body.length);

const tally = (i: number) => {
  const m = new Map<string, number>();
  for (const r of body) {
    const v = (r[i] ?? "").trim() || "(blank)";
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

console.log("\n=== MANUFACTURERS (col 4) ===");
for (const [k, n] of tally(IDX.manufacturer)) console.log(String(n).padStart(5), k);

console.log("\n=== CATEGORIES (col 1) ===");
for (const [k, n] of tally(IDX.category)) console.log(String(n).padStart(5), k);

// Duplicates by manufacturer part number
const seen = new Map<string, number>();
for (const r of body) {
  const mpn = (r[IDX.mpn] ?? "").trim();
  if (mpn) seen.set(mpn, (seen.get(mpn) ?? 0) + 1);
}
const dupes = [...seen.entries()].filter(([, n]) => n > 1);
console.log("\nunique MPNs:", seen.size, "| MPNs appearing >1x:", dupes.length);
console.log("blank MPN rows:", body.filter((r) => !(r[IDX.mpn] ?? "").trim()).length);

console.log("\n=== sample price values ===");
console.log(body.slice(0, 5).map((r) => r[IDX.priceGbp]).join(" | "));

console.log("\n=== sample specs JSON keys ===");
const specKeys = new Map<string, number>();
for (const r of body.slice(0, 400)) {
  try {
    const o = JSON.parse(r[IDX.specs] || "{}");
    for (const k of Object.keys(o)) specKeys.set(k, (specKeys.get(k) ?? 0) + 1);
  } catch { /* ignore */ }
}
console.log([...specKeys.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)
  .map(([k, n]) => `${k} (${n})`).join(", "));

process.exit(0);
