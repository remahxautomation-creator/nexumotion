/**
 * Collects part facts for brands DigiKey does not carry (Turck, Pizzato) from
 * the public brand listings on automationdistribution.com, and writes an import
 * CSV for scripts/import-products.ts.
 *
 *   npx tsx scripts/fetch-automationdistribution.ts                 # all brands
 *   npx tsx scripts/fetch-automationdistribution.ts --only=Pizzato
 *   MARKUP=1.35 MAX_PAGES=6 npx tsx scripts/fetch-automationdistribution.ts
 *
 * Checked 2026-11-10: robots.txt allows brand and product pages for all agents
 * (it disallows only cart, account, search and similar), and the site publishes
 * no terms of use restricting access. Re-check both before each run.
 *
 * Politeness: listing pages only (about 29 parts per request), one request at a
 * time with DELAY_MS between them, an honest User-Agent, and a hard page cap.
 *
 * What is kept: manufacturer part number and the list price. Facts only.
 * What is dropped: the store's product titles (marketing copy), photos and any
 * description. The name is composed from brand, part type and part number,
 * the same rule as scripts/digikey/map.ts. The part type comes from keyword
 * rules below; a part that matches no rule is skipped rather than guessed.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { toCsv, type ImportRow } from "./digikey/map";

const BASE = "https://automationdistribution.com";
const UA = "NexuMotion-catalogue/1.0 (+https://nexumotion.com)";
const MARKUP = Number(process.env.MARKUP ?? "1");
const MAX_PAGES = Number(process.env.MAX_PAGES ?? "6");
const DELAY_MS = Number(process.env.DELAY_MS ?? "4000");
const STOCK_QTY = process.env.STOCK_QTY ?? "25";
const ONLY = (process.argv.find((a) => a.startsWith("--only="))?.slice(7) ?? "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

/** First matching rule wins: [title pattern, part type for the name, our category]. */
type Rule = [RegExp, string, string];
/**
 * "model-first": the title is brand, part number, then words (Pizzato).
 * "type-word": the title is brand, model in title case, a type word, then the
 * maker's ID (Turck: "TURCK Bi3-Eg08Fe-An6X-H1341 Inductive 4614711"). The
 * model is everything before the matched type word, upper-cased back.
 */
type Job = { brand: string; path: string; titles: "model-first" | "type-word"; rules: Rule[] };

const JOBS: Job[] = [
  {
    brand: "Pizzato", path: "/pizzato/", titles: "model-first",
    rules: [
      [/safety switch|interlock|hinge|safety module|safety relay/i, "Safety Switch", "Safety"],
      [/position switch|limit switch|micro ?switch/i, "Position Switch", "Sensors & Switches"],
      [/push ?button|selector|pilot light|indicator|emergency stop|e-stop/i, "Operator Device", "Operator Devices"],
    ],
  },
  {
    brand: "Turck", path: "/brands/Turck.html", titles: "type-word",
    // Type words as the store writes them. Bulk cable and data carriers have
    // no rule, so they are skipped.
    rules: [
      [/\bInductive\b/, "Inductive Sensor", "Sensors & Switches"],
      [/\bCapacitive\b/, "Capacitive Sensor", "Sensors & Switches"],
      [/\bPhotoelectric\b/, "Photoelectric Sensor", "Sensors & Switches"],
      [/\bMagnetic\b/, "Magnetic Sensor", "Sensors & Switches"],
      [/\bRelays\b/, "Interface Relay", "Relays & Timers"],
      [/\bCordsets\b/, "Cordset", "Cables & Connectors"],
      [/\bSplitters\b/, "Splitter", "Cables & Connectors"],
      [/\bReceptacles\b/, "Receptacle", "Cables & Connectors"],
      [/\b(I\/O|Block I\/O|Fieldbus Modules)\b/, "I/O Module", "I/O Modules"],
    ],
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let requests = 0;

async function get(url: string): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    requests++;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" } });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status} (not retried)`);
      return await res.text();
    } catch (e) {
      const msg = (e as Error).message;
      if (attempt >= 3 || msg.includes("not retried")) throw new Error(`${url}: ${msg}`);
      await sleep(DELAY_MS * 3 * attempt);
    }
  }
}

const decode = (s: string) =>
  s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();

/**
 * The store's titles start with the brand, then the part number, then words:
 * "Pizzato FM 531-K50R24 Position switch". The part number is every token up to
 * the first one with a lower-case letter.
 */
export function partNumberFrom(title: string, brand: string): string {
  const rest = title.replace(new RegExp(`^${brand}\\s+`, "i"), "");
  const tokens: string[] = [];
  for (const t of rest.split(" ")) {
    if (/[a-z]/.test(t) || t === "-") break;
    tokens.push(t);
  }
  return tokens.join(" ").trim();
}

/** Model for "type-word" titles; empty when it looks like a cable spec rather than a part number. */
export function modelBefore(title: string, brand: string, typeWord: RegExp): string {
  const rest = title.replace(new RegExp(`^${brand}\\s+`, "i"), "");
  const at = rest.search(typeWord);
  const model = (at > 0 ? rest.slice(0, at) : "").trim().toUpperCase();
  return /\d/.test(model) && !model.includes(",") ? model : "";
}

function parseListing(html: string): { title: string; price: number }[] {
  return [...html.matchAll(/<article[\s\S]*?<\/article>/g)].map(([card]) => ({
    title: decode(card.match(/class="card-title"[^>]*>([\s\S]*?)<(?:div|\/h)/)?.[1] ?? ""),
    price: Number((card.match(/data-product-price[^>]*>([^<]*)/)?.[1] ?? "").replace(/[^0-9.]/g, "")),
  })).filter((c) => c.title);
}

async function runJob(job: Job, seen: Set<string>): Promise<ImportRow[]> {
  const rows: ImportRow[] = [];
  let skipped = 0;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const html = await get(`${BASE}${job.path}?sort=bestselling&page=${page}`);
    const cards = parseListing(html);
    for (const { title, price } of cards) {
      const rule = job.rules.find(([re]) => re.test(title));
      const sku = job.titles === "type-word"
        ? (rule ? modelBefore(title, job.brand, rule[0]) : "")
        : partNumberFrom(title, job.brand);
      if (!sku || sku.length < 3 || !rule || !(price > 0) || seen.has(sku)) { skipped++; continue; }
      seen.add(sku);
      const name = `${job.brand} ${rule[1]} ${sku}`;
      rows.push({
        sku, name, brand: job.brand, category: rule[2],
        price: (Math.round(price * MARKUP * 100) / 100).toFixed(2),
        stockQty: STOCK_QTY, shortDesc: name, datasheetUrl: "", specs: "{}",
      });
    }
    console.log(`  ${job.brand} page ${page}: ${cards.length} listed`);
    if (cards.length === 0) break;
    await sleep(DELAY_MS);
  }
  console.log(`      ${rows.length} parts kept, ${skipped} skipped (no part number, no type match, no price or duplicate)`);
  return rows;
}

async function main() {
  const jobs = ONLY.length ? JOBS.filter((j) => ONLY.includes(j.brand.toLowerCase())) : JOBS;
  console.log(`Fetching ${jobs.length} brand(s), up to ${MAX_PAGES} page(s) each${MARKUP !== 1 ? `, markup ×${MARKUP}` : ""}\n`);

  const seen = new Set<string>();
  const rows: ImportRow[] = [];
  try {
    for (const job of jobs) rows.push(...(await runJob(job, seen)));
  } catch (e) {
    // Keep what was fetched so far; a rerun with --only can fill the rest.
    console.error(`\n${(e as Error).message}`);
  }

  console.log(`\n${requests} request(s) made.`);
  if (!rows.length) { console.log("Nothing fetched, no file written."); return; }

  mkdirSync(resolve(process.cwd(), "import-data"), { recursive: true });
  const out = `import-data/autodist-${new Date().toISOString().slice(0, 10)}.csv`;
  writeFileSync(resolve(process.cwd(), out), toCsv(rows));
  console.log(`${rows.length} parts written to ${out}`);
  console.log(`Next: npm run catalog:import -- ${out}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
