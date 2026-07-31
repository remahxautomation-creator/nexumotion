import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ products: [], crossRef: null });

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ sku: { contains: q } }, { name: { contains: q } }, { brand: { name: { contains: q } } }],
    },
    include: { brand: true },
    take: 8,
    orderBy: { name: "asc" },
  });

  // If nothing matched directly, check cross-references
  let crossRef: { competitorSku: string; count: number } | null = null;
  if (products.length === 0) {
    const refCount = await prisma.crossReference.count({ where: { competitorSku: { contains: q } } });
    if (refCount > 0) crossRef = { competitorSku: q, count: refCount };
  }

  return NextResponse.json({
    products: products.map((p) => ({
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      brand: p.brand.name,
      price: Number(p.price),
      stockStatus: p.stockStatus,
    })),
    crossRef,
  });
}
