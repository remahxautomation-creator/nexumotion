import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const sku = req.nextUrl.searchParams.get("sku")?.trim();
  if (!sku) return NextResponse.json({ error: "sku required" }, { status: 400 });

  // Used by the quick-order pad, which resolves one SKU per pasted line, so a
  // legitimate 100-line BOM is 100 calls. The cap allows several large pastes
  // an hour and still stops an enumeration sweep of the catalogue.
  if (isRateLimited(`lookup:ip:${clientIp(req)}`, 600, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many lookups. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  const product =
    (await prisma.product.findUnique({ where: { sku }, include: { brand: true } })) ??
    (await prisma.product.findFirst({ where: { sku: { contains: sku } }, include: { brand: true } }));

  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    brand: product.brand.name,
    price: Number(product.price),
  });
}
