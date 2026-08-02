/**
 * Replace the demo catalogue with the supplied CSV.
 *
 * Run:  npx tsx scripts/import-catalog.ts            (dry run — reports only)
 *       npx tsx scripts/import-catalog.ts --commit   (writes to the database)
 *
 * WHAT IS AND IS NOT IMPORTED
 *  - Imported: manufacturer part number, manufacturer, product name, price,
 *    and the technical specification set. These are factual product data.
 *  - Not imported: the `description` column and `image_url`. The descriptions
 *    are the source retailer's own marketing copy, and the image URLs point at
 *    their servers — hotlinking those would break when they rotate assets and
 *    serves their bandwidth from your storefront. A factual short description
 *    is generated from the name and key specs instead.
 */
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { parseCsv } from "../src/lib/csv";

const CSV = "C:/Users/pc shop/Downloads/rs brands - targeted_brands (1).csv";
const COMMIT = process.argv.includes("--commit");

// Source prices are UK retail in GBP. Adjust before trusting these figures —
// see the warning printed at the end of the run.
const GBP_TO_USD = 1.27;

const prisma = new PrismaClient();

// Column positions read from the data, not the header: the header row names 11
// columns while every data row carries 18.
const C = {
  searchBrand: 0, category: 1, rsPart: 2, mpn: 3, manufacturer: 4,
  name: 5, description: 6, url: 7, imageUrl: 8, datasheet: 9,
  documents: 10, price: 11, stock: 12, origin: 13, specs: 17,
};

// Manufacturers to drop. RS PRO is the retailer's own house brand.
const EXCLUDED_MANUFACTURERS = new Set(["rs pro"]);

// Categories to drop: clothing and personal protective wearables, plus
// furniture, none of which belong in an automation parts catalogue.
const EXCLUDED_CATEGORIES = new Set([
  "Workwear", "Eye Face Protection", "Hand Protection", "Office Furniture",
]);

// Manufacturers that only make wearables/PPE — belt and braces alongside the
// category filter, since a workwear brand may appear under another category.
const WEARABLE_MANUFACTURERS = new Set([
  "portwest", "mascot workwear", "bolle safety", "unigloves", "centurion safety",
  "honeywell safety", "uvex", "ansell", "jsp", "3m safety", "delta plus",
  "scruffs", "dickies", "helly hansen", "snickers",
]);

// RS category → store category. Values not present in the store's seed are
// created (see NEW_CATEGORIES).
const CATEGORY_MAP: Record<string, string> = {
  "Plcs Hmis Industrial Computing": "PLC & Controllers",
  "Power Supplies": "Power Supplies",
  "Bench Power Supplies Sources": "Power Supplies",
  "Emi Filters Protection": "Power Supplies",
  "Key Switches Selector Switches": "Operator Devices",
  "Push Button Switches Components": "Operator Devices",
  "Automation Signalling": "Operator Devices",
  "Switch Disconnectors Components": "Motor Control",
  "Circuit Breakers": "Motor Control",
  "Contactors Auxiliary Contacts": "Motor Control",
  "Networking Wifi": "Industrial Networking",
  "Process Control": "Process Instruments",
  "Pressure Test Measurement": "Process Instruments",
  "Signal Conditioners Isolators": "Process Instruments",
  "Data Acquisition Logging": "Process Instruments",
  "Limit Position Switches": "Sensors & Switches",
  "Micro Switches Detector Switches": "Sensors & Switches",
  Sensors: "Sensors & Switches",
  "Pneumatic Valves": "Pneumatics",
  "Pneumatic Cylinders Actuators": "Pneumatics",
  "Pneumatic Sensors Switches": "Pneumatics",
  "Pneumatic Connectors Fittings Hose": "Pneumatics",
  "Pneumatic Air Preparation": "Pneumatics",
  "Vacuum Components": "Pneumatics",
  "Valves Taps": "Pneumatics",
  "Hydraulic Cylinders Pumps Power Units": "Hydraulics",
  "Electric Actuators": "Servo & Motion",
  "Linear Motion": "Servo & Motion",
  "Electric Motors": "Servo & Motion",
  "Industrial Robots": "Robotics",
  "Terminal Blocks": "Cables & Connectors",
  "Wire Terminals Splices": "Cables & Connectors",
  "Power Connectors": "Cables & Connectors",
  "Electrical Power Industrial Cables": "Cables & Connectors",
  "Mains Dc Power Connectors": "Cables & Connectors",
  "Circular Connectors": "Cables & Connectors",
  Relays: "Relays & Timers",
  "Relay Accessories": "Relays & Timers",
  "Safety Interlock Switches Components": "Safety",
  // Categories with no home in the original 20 — created on import.
  "Electrical Test Measurement": "Test & Measurement",
  "Environmental Test Measurement": "Test & Measurement",
  "Multimeters Accessories": "Test & Measurement",
  "Oscilloscopes Accessories": "Test & Measurement",
  "Power Tools": "Tools & Workshop",
  "Cable Connector Crimping Tools": "Tools & Workshop",
  "Knives Scissors Saws": "Tools & Workshop",
  "Discrete Semiconductors": "Electronic Components",
  "Fixed Resistors": "Electronic Components",
  "Optocouplers Photodetectors": "Electronic Components",
  "Memory Data Storage": "Electronic Components",
  "Arduino Shop": "Electronic Components",
  "Development Tools Single Board Computers": "Electronic Components",
  "Air Conditioning Fans": "Enclosures & Cooling",
  "Structural Systems": "Enclosures & Cooling",
};

const NEW_CATEGORIES: Record<string, string> = {
  "Test & Measurement": "Multimeters, oscilloscopes, calibrators and environmental test instruments.",
  "Tools & Workshop": "Power tools, crimping tools and workshop hand tools.",
  "Electronic Components": "Semiconductors, resistors, optocouplers and development boards.",
  "Enclosures & Cooling": "Enclosure cooling, fans and structural/framing systems.",
};

// Spec labels worth promoting to a filterable numeric value, mapped onto the
// store's existing spec keys so the category filters keep working.
const SPEC_KEY_MAP: Record<string, { key: string; numeric: boolean; unit?: string }> = {
  "IP Rating": { key: "ip_rating", numeric: false },
  "Supply Voltage": { key: "voltage", numeric: false },
  "Maximum Supply Voltage": { key: "voltage", numeric: false },
  "Coil Voltage": { key: "coil_voltage", numeric: false },
  "Current Rating": { key: "current", numeric: true, unit: "A" },
  "Switching Current": { key: "current", numeric: true, unit: "A" },
  "Output Current": { key: "current", numeric: true, unit: "A" },
  "Power Rating": { key: "power_w", numeric: true, unit: "W" },
  "Number of Poles": { key: "poles", numeric: true },
  "Number of Inputs": { key: "channels", numeric: true },
  "Number of Outputs": { key: "channels", numeric: true },
  "Contact Configuration": { key: "contacts", numeric: false },
  "Mount Type": { key: "mounting", numeric: false },
  "Terminal Type": { key: "terminal_type", numeric: false },
  "Output Type": { key: "output_type", numeric: false },
  "Product Type": { key: "product_type", numeric: false },
  Series: { key: "series", numeric: false },
  "Communication Protocol": { key: "communication", numeric: false },
  "Communication Port Type": { key: "communication", numeric: false },
  "Bore Size": { key: "bore", numeric: true, unit: "mm" },
  Stroke: { key: "stroke", numeric: true, unit: "mm" },
  "Housing Material": { key: "housing", numeric: false },
  Colour: { key: "colour", numeric: false },
  Width: { key: "width", numeric: true, unit: "mm" },
  Depth: { key: "depth", numeric: true, unit: "mm" },
  Length: { key: "length", numeric: true, unit: "mm" },
  Height: { key: "height", numeric: true, unit: "mm" },
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90);

function parsePrice(raw: string): number | null {
  const cleaned = (raw ?? "").replace(/[£,\s]/g, "").trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * GBP_TO_USD * 100) / 100;
}

function firstNumber(v: string): number | null {
  const m = String(v).match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const rows = parseCsv(readFileSync(CSV, "utf8"));
  const body = rows.slice(1).filter((r) => r.length >= 18);

  const stats = {
    total: body.length,
    skippedRsPro: 0, skippedWearable: 0, skippedCategory: 0,
    skippedNoMpn: 0, skippedNoPrice: 0, skippedUnmappedCategory: 0,
    duplicateInFile: 0, prepared: 0,
  };
  const unmapped = new Map<string, number>();

  type Prepared = {
    sku: string; name: string; manufacturer: string; storeCategory: string;
    price: number; shortDesc: string; specs: { key: string; name: string; value: string; num: number | null; unit: string | null }[];
  };
  const bySku = new Map<string, Prepared>();

  for (const r of body) {
    const manufacturer = (r[C.manufacturer] ?? "").trim();
    const rsCategory = (r[C.category] ?? "").trim();
    const mpn = (r[C.mpn] ?? "").trim();

    if (EXCLUDED_MANUFACTURERS.has(manufacturer.toLowerCase())) { stats.skippedRsPro++; continue; }
    if (WEARABLE_MANUFACTURERS.has(manufacturer.toLowerCase())) { stats.skippedWearable++; continue; }
    if (EXCLUDED_CATEGORIES.has(rsCategory)) { stats.skippedCategory++; continue; }
    if (!mpn) { stats.skippedNoMpn++; continue; }

    const storeCategory = CATEGORY_MAP[rsCategory];
    if (!storeCategory) {
      stats.skippedUnmappedCategory++;
      unmapped.set(rsCategory, (unmapped.get(rsCategory) ?? 0) + 1);
      continue;
    }

    const price = parsePrice(r[C.price] ?? "");
    if (price === null) { stats.skippedNoPrice++; continue; }

    if (bySku.has(mpn)) { stats.duplicateInFile++; continue; }

    // Specs from the JSON column
    const specs: Prepared["specs"] = [];
    try {
      const obj = JSON.parse(r[C.specs] || "{}") as Record<string, string>;
      for (const [label, rawVal] of Object.entries(obj)) {
        const value = String(rawVal ?? "").trim();
        if (!value || value.length > 300) continue;
        const mapped = SPEC_KEY_MAP[label];
        const key = mapped?.key ?? slugify(label).replace(/-/g, "_");
        if (specs.some((s) => s.key === key)) continue;
        specs.push({
          key,
          name: label,
          value,
          num: mapped?.numeric ? firstNumber(value) : null,
          unit: mapped?.unit ?? null,
        });
      }
    } catch { /* malformed spec blob — product still imports without specs */ }

    // Factual short description built from our own fields, not the source copy.
    const headline = [
      specs.find((s) => s.key === "product_type")?.value,
      specs.find((s) => s.key === "series")?.value ? `${specs.find((s) => s.key === "series")!.value} series` : null,
      specs.find((s) => s.key === "ip_rating")?.value,
    ].filter(Boolean).join(" · ");

    bySku.set(mpn, {
      sku: mpn,
      name: (r[C.name] ?? "").trim().slice(0, 200) || mpn,
      manufacturer,
      storeCategory,
      price,
      shortDesc: (headline || `${manufacturer} ${rsCategory}`).slice(0, 250),
      specs,
    });
    stats.prepared++;
  }

  // ── Report ────────────────────────────────────────────────────────────
  console.log("=== SOURCE ===");
  console.log("data rows              :", stats.total);
  console.log("skipped — RS PRO       :", stats.skippedRsPro);
  console.log("skipped — wearable mfr :", stats.skippedWearable);
  console.log("skipped — PPE/clothing/furniture category:", stats.skippedCategory);
  console.log("skipped — no part number:", stats.skippedNoMpn);
  console.log("skipped — no price     :", stats.skippedNoPrice);
  console.log("skipped — unmapped cat :", stats.skippedUnmappedCategory);
  console.log("skipped — duplicate    :", stats.duplicateInFile);
  console.log("READY TO IMPORT        :", stats.prepared);

  if (unmapped.size) {
    console.log("\nunmapped categories:");
    for (const [k, n] of [...unmapped.entries()].sort((a, b) => b[1] - a[1])) console.log("  ", n, k);
  }

  const byMfr = new Map<string, number>();
  const byCat = new Map<string, number>();
  for (const p of bySku.values()) {
    byMfr.set(p.manufacturer, (byMfr.get(p.manufacturer) ?? 0) + 1);
    byCat.set(p.storeCategory, (byCat.get(p.storeCategory) ?? 0) + 1);
  }
  console.log("\nmanufacturers:", byMfr.size);
  console.log("categories used:", [...byCat.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}(${n})`).join(", "));

  if (!COMMIT) {
    console.log("\nDRY RUN — nothing written. Re-run with --commit to apply.");
    process.exit(0);
  }

  // ── Wipe existing catalogue ───────────────────────────────────────────
  // Order/quote/project lines reference products by FK without cascade, so the
  // demo transactions built against the fake catalogue have to go first.
  console.log("\n=== CLEARING DEMO DATA ===");
  const before = {
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
    quotes: await prisma.quoteRequest.count(),
    projects: await prisma.project.count(),
  };
  console.log("existing:", JSON.stringify(before));

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quoteRequest.deleteMany();
  await prisma.projectItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.priceTier.deleteMany();
  await prisma.crossReference.deleteMany();
  await prisma.productSpec.deleteMany();
  const deleted = await prisma.product.deleteMany();
  console.log("deleted products:", deleted.count, "(plus their orders, quotes, BOM lines)");

  // ── Ensure categories and brands exist ────────────────────────────────
  const existingCats = await prisma.category.findMany();
  const catByName = new Map(existingCats.map((c) => [c.name, c]));
  let sortOrder = existingCats.length;
  for (const [name, description] of Object.entries(NEW_CATEGORIES)) {
    if (catByName.has(name)) continue;
    const created = await prisma.category.create({
      data: { name, slug: slugify(name), description, sortOrder: sortOrder++ },
    });
    catByName.set(name, created);
    console.log("created category:", name);
  }

  const existingBrands = await prisma.brand.findMany();
  const brandByName = new Map(existingBrands.map((b) => [b.name.toLowerCase(), b]));
  // Also index by slug: "Allen Bradley" and "Allen-Bradley" are different names
  // that slugify identically, so a name-only check tries to create a duplicate.
  // Matching on slug merges those variants onto the existing brand instead.
  const brandBySlug = new Map(existingBrands.map((b) => [b.slug, b]));

  let brandsCreated = 0, brandsMerged = 0;
  for (const mfr of byMfr.keys()) {
    const nameKey = mfr.toLowerCase();
    if (brandByName.has(nameKey)) continue;

    const slug = slugify(mfr);
    const sameSlug = brandBySlug.get(slug);
    if (sameSlug) {
      brandByName.set(nameKey, sameSlug);
      brandsMerged++;
      continue;
    }

    const created = await prisma.brand.create({
      data: { name: mfr, slug, country: "—", description: `${mfr} industrial products.` },
    });
    brandByName.set(nameKey, created);
    brandBySlug.set(slug, created);
    brandsCreated++;
  }
  console.log("brands created:", brandsCreated, "| merged onto existing:", brandsMerged);

  // ── Insert products ───────────────────────────────────────────────────
  console.log("\n=== IMPORTING ===");
  let imported = 0, failed = 0;
  for (const p of bySku.values()) {
    const brand = brandByName.get(p.manufacturer.toLowerCase());
    const category = catByName.get(p.storeCategory);
    if (!brand || !category) { failed++; continue; }
    try {
      await prisma.product.create({
        data: {
          sku: p.sku,
          name: p.name,
          slug: slugify(`${brand.name}-${p.sku}`),
          shortDesc: p.shortDesc,
          brandId: brand.id,
          categoryId: category.id,
          price: p.price,
          stockQty: 0,
          stockStatus: "BACKORDER",
          costPerUnit: "per unit",
          images: JSON.stringify([]),
          certifications: JSON.stringify([]),
          specs: {
            create: p.specs.map((s) => ({
              specKey: s.key, specName: s.name, value: s.value,
              valueNum: s.num, unit: s.unit,
            })),
          },
        },
      });
      imported++;
      if (imported % 200 === 0) console.log("  ...", imported);
    } catch (e) {
      failed++;
      if (failed <= 5) console.log("  failed:", p.sku, e instanceof Error ? e.message.slice(0, 90) : "");
    }
  }

  const specCount = await prisma.productSpec.count();
  console.log("\n=== DONE ===");
  console.log("products imported:", imported, "| failed:", failed);
  console.log("spec rows:", specCount);
  console.log(`
NOTE ON PRICES AND STOCK
  Prices are the source file's UK retail figures converted at ${GBP_TO_USD} GBP→USD.
  They are a retailer's sell price, not your cost, so your margin is not in them.
  Review before quoting. Stock is set to 0 / BACKORDER for every line, because
  the file carries no real stock figure for your warehouse.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
