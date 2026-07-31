import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const sku = req.nextUrl.searchParams.get("sku")?.trim();
  if (!sku) return NextResponse.json({ error: "sku required" }, { status: 400 });

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
