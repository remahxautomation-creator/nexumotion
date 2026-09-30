/**
 * Pushes the site's URLs to IndexNow.
 *
 *   npm run seo:indexnow            # everything in the sitemap
 *   npm run seo:indexnow -- <url>…  # just these
 *
 * IndexNow is the shared submission endpoint for Bing, Yandex, Seznam and
 * Naver. Bing matters here beyond its own traffic: it is the index ChatGPT
 * search queries, and Copilot's. A new product page otherwise waits for a
 * crawl it may not get for weeks — 1,500 pages on a domain with no history is
 * exactly the case crawlers deprioritise. Submitting says "these exist, now".
 *
 * Google does not participate; it gets the same URLs through Search Console
 * and the sitemap, which is already submitted.
 *
 * The key is a file served from public/ whose name is the key itself. That
 * file is the proof of ownership, so it must stay in git and stay deployed.
 */
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const HOST = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexumotion.com").replace(/\/$/, "");
const host = new URL(HOST).host;

const key = readdirSync(resolve(process.cwd(), "public"))
  .map((f) => f.match(/^([0-9a-f]{32})\.txt$/)?.[1])
  .find(Boolean);

if (!key) {
  console.error("No IndexNow key file in public/ (expected <32-hex>.txt). Create one first.");
  process.exit(1);
}

async function sitemapUrls(): Promise<string[]> {
  const xml = await fetch(`${HOST}/sitemap.xml`).then((r) => r.text());
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const fromArgs = process.argv.slice(2).filter((a) => a.startsWith("http"));
  const urlList = fromArgs.length ? fromArgs : await sitemapUrls();
  if (!urlList.length) {
    console.log("No URLs to submit.");
    return;
  }

  // The endpoint caps a batch at 10,000; chunked anyway so a partial failure
  // is visible rather than silently losing the tail.
  const CHUNK = 5000;
  for (let i = 0; i < urlList.length; i += CHUNK) {
    const batch = urlList.slice(i, i + CHUNK);
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation: `${HOST}/${key}.txt`, urlList: batch }),
    });
    // 200 accepted, 202 accepted but key still being validated — both are fine.
    console.log(`${batch.length} URL(s) → ${res.status} ${res.statusText}`);
    if (res.status >= 400) console.log(await res.text());
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
