import { PrismaClient } from "@prisma/client";
import { parseJsonArray } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  const all = await prisma.product.findMany({ select: { sku: true, images: true } });
  const withImg = all.map((p) => ({ sku: p.sku, url: parseJsonArray(p.images)[0] })).filter((x) => x.url);
  console.log("products still holding an image URL:", withImg.length);
  if (!withImg.length) process.exit(0);

  const { sku, url } = withImg[0];
  console.log("probe:", sku, url);

  const direct = await fetch(url).then((r) => ({ ok: r.ok, status: r.status, type: r.headers.get("content-type") })).catch((e) => ({ err: String(e) }));
  console.log("  direct   :", JSON.stringify(direct));

  const opt = `http://localhost:3000/_next/image?url=${encodeURIComponent(url)}&w=640&q=75`;
  const t0 = Date.now();
  const viaOpt = await fetch(opt).then((r) => ({ ok: r.ok, status: r.status, type: r.headers.get("content-type") })).catch((e) => ({ err: String(e) }));
  console.log("  optimiser:", JSON.stringify(viaOpt), `${Date.now() - t0}ms`);
  process.exit(0);
}
main();
