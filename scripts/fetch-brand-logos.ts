/**
 * Downloads manufacturer logos from Wikimedia Commons into public/brands/.
 *
 * Written as a script rather than dropping binaries into the repo by hand so
 * the provenance of every file is recorded: each logo below names the exact
 * Commons file it came from, and the whole set can be re-fetched or audited.
 *
 * On the legal footing: these are trademarks, not our property. Displaying a
 * manufacturer's mark to indicate that we stock their products is nominative
 * use and does not require permission — unlike presenting a company as a
 * customer, which is why the client wall uses names only. If a manufacturer
 * provides a distributor brand pack, prefer their file: it is authoritative
 * and carries their usage terms.
 *
 * Norgren is deliberately absent — Commons has no logo for it, and the brand
 * wall falls back to a wordmark for any brand without a file.
 *
 * Run: npx tsx scripts/fetch-brand-logos.ts [--commit]
 */
import { mkdirSync, writeFileSync, existsSync } from "fs";

const COMMIT = process.argv.includes("--commit");
const OUT_DIR = "public/brands";

// Wikimedia asks for a descriptive User-Agent identifying the caller.
const UA = "NexuMotion-logo-fetch/1.0 (https://nexumotion.com; technical@nexumotion.com)";

/** slug in the catalogue -> exact Commons file title. */
const LOGOS: Array<{ slug: string; file: string }> = [
  { slug: "siemens", file: "File:Siemens-logo.svg" },
  { slug: "abb", file: "File:ABB logo.svg" },
  { slug: "schneider-electric", file: "File:Schneider Electric 2007.svg" },
  { slug: "danfoss", file: "File:Danfoss-Logo.svg" },
  { slug: "omron", file: "File:OMRON Logo.svg" },
  { slug: "burkert", file: "File:Burkert logo.svg" },
  { slug: "sick", file: "File:Logo SICK AG 2009.svg" },
  // The "Logo Pilz GmbH & Co. KG.svg" version is 144 KB — ten times the rest —
  // because it carries a large embedded raster. This one is the plain vector.
  { slug: "pilz", file: "File:Pilz GmbH.svg" },
  { slug: "allen-bradley", file: "File:Allen-Bradley logo.svg" },
  { slug: "weidm-ller", file: "File:Logo Weidmüller.svg" },
  { slug: "ebm-papst", file: "File:Ebmpapst.svg" },
  { slug: "ifm-electronic", file: "File:Ifm electronic logo.svg" },
  { slug: "festo", file: "File:Festo logo.svg" },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch with one retry on 429.
 *
 * The first run of this script tripped Wikimedia's rate limit part-way
 * through, which is a poor way to treat a free service. Requests are paced
 * and a refusal is backed off rather than hammered.
 */
async function politeFetch(url: string): Promise<Response> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (res.status !== 429) return res;
  await sleep(3000);
  return fetch(url, { headers: { "User-Agent": UA } });
}

async function directUrl(title: string): Promise<string | null> {
  const api =
    "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|size|mime" +
    `&titles=${encodeURIComponent(title)}&format=json`;
  const res = await politeFetch(api);
  if (!res.ok) return null;
  const json = (await res.json()) as {
    query?: { pages?: Record<string, { imageinfo?: Array<{ url: string; mime: string }> }> };
  };
  const pages = json.query?.pages ?? {};
  for (const key of Object.keys(pages)) {
    const info = pages[key].imageinfo?.[0];
    if (info?.url) return info.url;
  }
  return null;
}

async function main() {
  if (COMMIT && !existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0;
  let failed = 0;

  for (const { slug, file } of LOGOS) {
    await sleep(400); // pace the requests; this is a free service
    const url = await directUrl(file);
    if (!url) {
      console.log(`  ${slug.padEnd(20)} FAILED to resolve ${file}`);
      failed++;
      continue;
    }

    const res = await politeFetch(url);
    if (!res.ok) {
      console.log(`  ${slug.padEnd(20)} HTTP ${res.status} fetching the file`);
      failed++;
      continue;
    }

    const body = await res.text();

    // Confirm it is really SVG before writing. A redirect or error page saved
    // as .svg would render as a broken image with no obvious cause.
    if (!/^\s*(<\?xml|<svg)/i.test(body)) {
      console.log(`  ${slug.padEnd(20)} NOT SVG (starts "${body.slice(0, 24).replace(/\s+/g, " ")}")`);
      failed++;
      continue;
    }

    const kb = (Buffer.byteLength(body) / 1024).toFixed(1);
    console.log(`  ${slug.padEnd(20)} ${String(kb).padStart(7)} KB   ${file}`);
    if (COMMIT) writeFileSync(`${OUT_DIR}/${slug}.svg`, body, "utf8");
    ok++;
  }

  console.log(`\nresolved ${ok}, failed ${failed}, of ${LOGOS.length}`);
  console.log(COMMIT ? `Written to ${OUT_DIR}/` : "DRY RUN — re-run with --commit.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(String(e).slice(0, 400));
    process.exit(1);
  });
