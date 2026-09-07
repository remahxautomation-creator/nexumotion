/**
 * Checks stored datasheet links and, optionally, clears the dead ones.
 *
 *   npx tsx scripts/check-datasheet-liveness.ts            # report on a sample
 *   npx tsx scripts/check-datasheet-liveness.ts --all      # check every URL
 *   npx tsx scripts/check-datasheet-liveness.ts --all --fix  # clear dead links
 *
 * Why this exists. 977 products link to datasheets on a third party's CDN, and
 * the home page counts them as a feature ("977 datasheets"). Nothing was
 * watching whether those links still resolve, so the failure mode was silent:
 * the count keeps claiming a number, the product page keeps offering a
 * download, and the customer gets somebody else's 404. Rotting slowly and
 * invisibly is worse than breaking loudly.
 *
 * Re-hosting the PDFs would remove the dependency altogether, but that needs
 * object storage (R2 is not enabled on the account) and means hosting ~1.4 GB
 * of documents we did not author. Verifying what we link to is the honest
 * version of the same goal, and costs nothing.
 *
 * `--fix` nulls `datasheetUrl` for dead links rather than deleting the product.
 * The product page already renders "datasheet (on request)" when the field is
 * empty, which is true and gives the customer a way forward — where a broken
 * download is just a dead end.
 *
 * Deliberately paced. These requests go to someone else's servers, so they run
 * a few at a time with a pause between batches rather than firing 956 at once.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ALL = process.argv.includes("--all");
const FIX = process.argv.includes("--fix");
const SAMPLE = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 60);

const CONCURRENCY = 6;
const PAUSE_MS = 400;
const TIMEOUT_MS = 12_000;

async function status(url: string): Promise<number | "error"> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    // HEAD first — a datasheet can be several megabytes and we only need the
    // status. Some CDNs reject HEAD, so fall back to a ranged GET that asks for
    // the first byte rather than downloading the whole document.
    let res = await fetch(url, { method: "HEAD", signal: ctrl.signal, redirect: "follow" });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        signal: ctrl.signal,
        redirect: "follow",
      });
    }
    clearTimeout(t);
    return res.status;
  } catch {
    return "error";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const rows = await prisma.product.findMany({
    where: { isActive: true, NOT: { datasheetUrl: null } },
    select: { sku: true, datasheetUrl: true },
  });

  const withUrl = rows.filter((r) => (r.datasheetUrl ?? "").startsWith("http"));

  // One check per distinct URL — products share datasheets, so checking per
  // product would repeat the same request many times over.
  const byUrl = new Map<string, string[]>();
  for (const r of withUrl) {
    const u = r.datasheetUrl!;
    const list = byUrl.get(u);
    if (list) list.push(r.sku);
    else byUrl.set(u, [r.sku]);
  }

  let urls = [...byUrl.keys()];
  if (!ALL) urls = urls.sort(() => Math.random() - 0.5).slice(0, SAMPLE);

  console.log(
    `${withUrl.length} products · ${byUrl.size} distinct URLs · checking ${urls.length}` +
      `${ALL ? " (all)" : ` (sample of ${SAMPLE})`}${FIX ? " · will clear dead links" : ""}\n`
  );

  const dead: string[] = [];
  const codes = new Map<string | number, number>();

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(status));

    results.forEach((code, n) => {
      codes.set(code, (codes.get(code) ?? 0) + 1);
      const ok = typeof code === "number" && code >= 200 && code < 400;
      if (!ok) dead.push(batch[n]);
    });

    process.stdout.write(`\r  checked ${Math.min(i + CONCURRENCY, urls.length)}/${urls.length}`);
    if (i + CONCURRENCY < urls.length) await sleep(PAUSE_MS);
  }
  process.stdout.write("\n\n");

  console.log("status codes:");
  for (const [code, n] of [...codes.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(code).padStart(6)}  ${n}`);
  }

  const affected = dead.reduce((n, u) => n + (byUrl.get(u)?.length ?? 0), 0);
  console.log(
    `\n${dead.length} of ${urls.length} URLs dead` +
      (dead.length ? ` — affecting ${affected} product${affected === 1 ? "" : "s"}` : "")
  );
  for (const u of dead.slice(0, 10)) console.log(`  ${u}  (${byUrl.get(u)?.length} products)`);
  if (dead.length > 10) console.log(`  … and ${dead.length - 10} more`);

  if (!FIX || dead.length === 0) {
    if (dead.length && !FIX) console.log("\nRe-run with --fix to clear these.");
    await prisma.$disconnect();
    return;
  }

  const skus = dead.flatMap((u) => byUrl.get(u) ?? []);
  const res = await prisma.product.updateMany({
    where: { sku: { in: skus } },
    data: { datasheetUrl: null },
  });
  console.log(`\ncleared datasheetUrl on ${res.count} products.`);
  console.log("Now re-run: npx tsx scripts/build-mirror.ts && npx tsx scripts/build-snapshot.ts");

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
