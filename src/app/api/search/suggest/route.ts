import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ products: [], crossRef: null });

  // Autocomplete fires per keystroke, which makes this the highest-frequency
  // database caller on the site — the exact shape of load that exhausted D1's
  // read limit. The cap is deliberately generous (a fast typist exploring the
  // catalogue stays well under it) and exists to stop a script, not a person.
  //
  // Failing open rather than erroring: an empty suggestion list degrades the
  // search box quietly, where a 429 body would render as a broken dropdown.
  if (isRateLimited(`suggest:ip:${clientIp(req)}`, 300, 60 * 60 * 1000)) {
    return NextResponse.json({ products: [], crossRef: null });
  }

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
