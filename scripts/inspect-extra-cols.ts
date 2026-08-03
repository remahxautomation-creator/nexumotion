import { readFileSync } from "fs";
import { parseCsv } from "../src/lib/csv";

const rows = parseCsv(readFileSync("C:/Users/pc shop/Downloads/rs brands - targeted_brands (1).csv", "utf8"));
const body = rows.slice(1).filter((r) => r.length >= 18);

const C = { mpn: 3, mfr: 4, datasheet: 9, documents: 10, specs: 17 };

console.log("=== DATASHEET COL (9) ===");
const withDs = body.filter((r) => (r[C.datasheet] ?? "").startsWith("http"));
console.log("rows with a datasheet URL:", withDs.length, "of", body.length);
const hosts = new Map<string, number>();
for (const r of withDs) {
  try { const h = new URL(r[C.datasheet]).host; hosts.set(h, (hosts.get(h) ?? 0) + 1); } catch { /* skip */ }
}
console.log("hosts:", [...hosts.entries()].map(([h, n]) => `${h} (${n})`).join(", "));
console.log("sample:", withDs.slice(0, 2).map((r) => r[C.datasheet]).join("\n         "));

console.log("\n=== DOCUMENTS COL (10) ===");
const withDocs = body.filter((r) => (r[C.documents] ?? "").includes("http"));
console.log("rows with documents:", withDocs.length);
console.log("sample:", (withDocs[0]?.[C.documents] ?? "").slice(0, 220));

console.log("\n=== WEIGHT / MASS in specs ===");
const weightKeys = new Map<string, number>();
const dimKeys = new Map<string, number>();
for (const r of body) {
  try {
    const o = JSON.parse(r[C.specs] || "{}") as Record<string, string>;
    for (const k of Object.keys(o)) {
      if (/weight|mass/i.test(k)) weightKeys.set(k, (weightKeys.get(k) ?? 0) + 1);
      if (/width|depth|length|height|diameter/i.test(k)) dimKeys.set(k, (dimKeys.get(k) ?? 0) + 1);
    }
  } catch { /* skip */ }
}
console.log("weight-ish spec keys:", weightKeys.size ? [...weightKeys.entries()].map(([k, n]) => `${k}(${n})`).join(", ") : "NONE");
console.log("dimension keys:", [...dimKeys.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k, n]) => `${k}(${n})`).join(", "));

// A couple of concrete weight samples if any exist
for (const r of body.slice(0, 600)) {
  try {
    const o = JSON.parse(r[C.specs] || "{}") as Record<string, string>;
    const wk = Object.keys(o).find((k) => /weight|mass/i.test(k));
    if (wk) { console.log("sample weight:", r[C.mpn], "|", wk, "=", o[wk]); break; }
  } catch { /* skip */ }
}
process.exit(0);
