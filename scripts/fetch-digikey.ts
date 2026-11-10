/**
 * Pulls parts for the brands below from DigiKey's Product Information V4 API
 * and writes an import CSV for scripts/import-products.ts.
 *
 *   npx tsx scripts/fetch-digikey.ts --probe          # 1 request per job: is the brand on DigiKey?
 *   npx tsx scripts/fetch-digikey.ts                  # all jobs → import-data/digikey-<date>.csv
 *   npx tsx scripts/fetch-digikey.ts --only=Turck,Rittal
 *
 * Then the normal pipeline:
 *   npm run catalog:import -- import-data/digikey-<date>.csv            # dry run
 *   npm run catalog:import -- import-data/digikey-<date>.csv --commit
 *   npx wrangler d1 execute nexumotion --remote --file=import-templates/.d1-sync.sql
 *   npm run catalog:publish
 *
 * Credentials come from .env (gitignored), never from this file:
 *   DIGIKEY_CLIENT_ID=…
 *   DIGIKEY_CLIENT_SECRET=…
 * Optional: MARKUP=1.0 (price multiplier), STOCK_QTY=25, DIGIKEY_DAILY_BUDGET=900
 *
 * Auth is the two-legged client-credentials flow, so no browser login or
 * callback is involved. Tokens live ~10 minutes and are refreshed as needed.
 *
 * Read DigiKey's API Terms of Use before publishing what this fetches. Only
 * part facts are kept (see scripts/digikey/map.ts); descriptions and photos
 * are not.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { toImportRow, toCsv, type DkProduct, type ImportRow } from "./digikey/map";

try { process.loadEnvFile(".env"); } catch { /* fall back to the real environment */ }

// ── What to fetch ───────────────────────────────────────────────────────────
// brand:    our brand name, exactly as on the site (the importer rejects others)
// match:    how DigiKey spells the manufacturer
// category: our category name, exactly as on the site
// keywords: one search per keyword; each pulls up to `limit` parts
type Job = { brand: string; match: RegExp; category: string; keywords: string[]; limit: number };

const JOBS: Job[] = [
  { brand: "Turck", match: /^turck/i, category: "Sensors & Switches", keywords: ["inductive sensor", "capacitive sensor"], limit: 60 },
  { brand: "Turck", match: /^turck/i, category: "Cables & Connectors", keywords: ["cordset"], limit: 40 },
  { brand: "Banner Engineering", match: /^banner/i, category: "Sensors & Switches", keywords: ["photoelectric sensor"], limit: 60 },
  { brand: "Banner Engineering", match: /^banner/i, category: "Safety", keywords: ["light curtain"], limit: 30 },
  { brand: "Banner Engineering", match: /^banner/i, category: "Signalling Devices", keywords: ["tower light"], limit: 30 },
  { brand: "Phoenix Contact", match: /^phoenix contact/i, category: "Power Supplies", keywords: ["DIN rail power supply"], limit: 50 },
  { brand: "Phoenix Contact", match: /^phoenix contact/i, category: "Relays & Timers", keywords: ["relay module"], limit: 40 },
  { brand: "Phoenix Contact", match: /^phoenix contact/i, category: "Cables & Connectors", keywords: ["terminal block DIN rail"], limit: 50 },
  { brand: "Finder", match: /^finder/i, category: "Relays & Timers", keywords: ["relay", "timer"], limit: 60 },
  { brand: "Murrelektronik", match: /^murr/i, category: "Cables & Connectors", keywords: ["cordset M12"], limit: 50 },
  { brand: "Murrelektronik", match: /^murr/i, category: "Power Supplies", keywords: ["power supply"], limit: 30 },
  { brand: "Rittal", match: /^rittal/i, category: "Enclosures & Cooling", keywords: ["AX compact enclosure", "KX small enclosure", "TopTherm fan"], limit: 40 },
  { brand: "Werma", match: /^werma/i, category: "Signalling Devices", keywords: ["signal tower", "beacon"], limit: 50 },
  { brand: "Sanyo Denki", match: /^sanyo denki/i, category: "Servo & Motion", keywords: ["servo motor", "stepper motor"], limit: 40 },
  { brand: "SensoPart", match: /^sensopart/i, category: "Sensors & Switches", keywords: ["sensor"], limit: 40 },
  { brand: "Pizzato", match: /^pizzato/i, category: "Safety", keywords: ["safety switch"], limit: 40 },
];

// ── API ─────────────────────────────────────────────────────────────────────
const API = "https://api.digikey.com";
const CLIENT_ID = process.env.DIGIKEY_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.DIGIKEY_CLIENT_SECRET ?? "";
const MARKUP = Number(process.env.MARKUP ?? "1");
const STOCK_QTY = Number(process.env.STOCK_QTY ?? "25");
const BUDGET = Number(process.env.DIGIKEY_DAILY_BUDGET ?? "900");
const PAGE = 50; // V4 maximum per request

const PROBE = process.argv.includes("--probe");
const ONLY = (process.argv.find((a) => a.startsWith("--only="))?.slice(7) ?? "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

let token = "";
let tokenExpires = 0;
let requests = 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getToken(): Promise<string> {
  if (token && Date.now() < tokenExpires - 30_000) return token;
  const res = await fetch(`${API}/v1/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error(`Token request failed: HTTP ${res.status} ${await res.text()}`);
  const body = (await res.json()) as { access_token: string; expires_in: number };
  token = body.access_token;
  tokenExpires = Date.now() + body.expires_in * 1000;
  return token;
}

type SearchResponse = {
  Products?: DkProduct[];
  ProductsCount?: number;
  FilterOptions?: { Manufacturers?: { Id: number | string; Value: string; ProductCount?: number }[] };
};

async function keywordSearch(body: Record<string, unknown>): Promise<SearchResponse> {
  for (let attempt = 0; attempt < 4; attempt++) {
    if (requests >= BUDGET) throw new Error(`Stopped at the daily budget of ${BUDGET} requests (DIGIKEY_DAILY_BUDGET).`);
    requests++;
    const res = await fetch(`${API}/products/v4/search/keyword`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "X-DIGIKEY-Client-Id": CLIENT_ID,
        "X-DIGIKEY-Locale-Site": "US",
        "X-DIGIKEY-Locale-Language": "en",
        "X-DIGIKEY-Locale-Currency": "USD",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get("Retry-After") ?? "60");
      console.log(`  … rate limited, waiting ${wait}s`);
      await sleep(wait * 1000);
      continue;
    }
    if (res.status === 401) { token = ""; continue; }
    if (!res.ok) throw new Error(`Search failed: HTTP ${res.status} ${await res.text()}`);
    const remaining = res.headers.get("X-RateLimit-Remaining");
    if (remaining && Number(remaining) < 20) console.log(`  ! only ${remaining} requests left today`);
    await sleep(600); // stay well under the per-minute burst limit
    return (await res.json()) as SearchResponse;
  }
  throw new Error("Search failed after retries.");
}

/** Finds DigiKey's id for the manufacturer so later pages contain only that brand. */
async function findManufacturer(job: Job, keyword: string) {
  const first = await keywordSearch({ Keywords: `${job.brand} ${keyword}`, Limit: 1, Offset: 0 });
  const mfr = first.FilterOptions?.Manufacturers?.find((m) => job.match.test(m.Value));
  return { mfr, total: first.ProductsCount ?? 0 };
}

async function runJob(job: Job, seen: Set<string>): Promise<ImportRow[]> {
  const rows: ImportRow[] = [];
  for (const keyword of job.keywords) {
    const { mfr, total } = await findManufacturer(job, keyword);
    if (!mfr) {
      console.log(`  ✗ ${job.brand} / "${keyword}": no DigiKey manufacturer matching ${job.match} (${total} loose hits)`);
      continue;
    }
    console.log(`  ✓ ${job.brand} / "${keyword}": "${mfr.Value}" id ${mfr.Id}${mfr.ProductCount ? `, ${mfr.ProductCount} parts` : ""}`);
    if (PROBE) continue;

    let added = 0;
    for (let offset = 0; added < job.limit && offset < 500; offset += PAGE) {
      const page = await keywordSearch({
        Keywords: keyword,
        Limit: PAGE,
        Offset: offset,
        FilterOptionsRequest: { ManufacturerFilter: [{ Id: mfr.Id }] },
      });
      const products = page.Products ?? [];
      for (const p of products) {
        if (added >= job.limit) break;
        // Belt and braces: never trust the filter alone for the brand name.
        if (p.Manufacturer?.Name && !job.match.test(p.Manufacturer.Name)) continue;
        const row = toImportRow(p, { brand: job.brand, category: job.category, stockQty: STOCK_QTY, markup: MARKUP });
        if (!row || seen.has(row.sku)) continue;
        seen.add(row.sku);
        rows.push(row);
        added++;
      }
      if (products.length < PAGE) break;
    }
    console.log(`      ${added} parts → ${job.category}`);
  }
  return rows;
}

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("Set DIGIKEY_CLIENT_ID and DIGIKEY_CLIENT_SECRET in .env first.");
    process.exit(1);
  }
  const jobs = ONLY.length ? JOBS.filter((j) => ONLY.includes(j.brand.toLowerCase())) : JOBS;
  console.log(`${PROBE ? "Probing" : "Fetching"} ${jobs.length} job(s)${MARKUP !== 1 ? `, markup ×${MARKUP}` : ""}\n`);

  const seen = new Set<string>();
  const rows: ImportRow[] = [];
  try {
    for (const job of jobs) rows.push(...(await runJob(job, seen)));
  } catch (e) {
    // Keep what was fetched so far; a rerun with --only can fill the rest.
    console.error(`\n${(e as Error).message}`);
  }

  console.log(`\n${requests} API request(s) used.`);
  if (PROBE) return;
  if (!rows.length) { console.log("Nothing fetched, no file written."); return; }

  mkdirSync(resolve(process.cwd(), "import-data"), { recursive: true });
  const out = `import-data/digikey-${new Date().toISOString().slice(0, 10)}.csv`;
  writeFileSync(resolve(process.cwd(), out), toCsv(rows));
  const zero = rows.filter((r) => r.price === "0").length;
  console.log(`${rows.length} parts written to ${out}${zero ? ` (${zero} without a DigiKey price, imported at 0)` : ""}`);
  console.log(`Next: npm run catalog:import -- ${out}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
