import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateTotals } from "@/lib/pricing";

/**
 * Totals for the current cart, computed server-side.
 *
 * Shipping now depends on weight, which lives in the database — not in the
 * cart. Rather than copying weights into localStorage (where they would go
 * stale and could be edited), the checkout asks the server for the figures it
 * will actually charge. Same code path as order creation, so the quoted total
 * and the charged total cannot drift.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const items = (body?.items ?? []) as { productId?: string; qty?: number }[];

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (items.length > 200) {
    return NextResponse.json({ error: "Too many lines" }, { status: 400 });
  }

  const ids = items.map((i) => i.productId).filter((v): v is string => typeof v === "string");
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    select: { id: true, price: true, weightKg: true, category: { select: { slug: true } } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const lines: { qty: number; weightKg?: number | null; categorySlug?: string }[] = [];

  for (const item of items) {
    const p = item.productId ? byId.get(item.productId) : undefined;
    const qty = Number(item.qty);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 10000) continue;
    subtotal += Number(p.price) * qty;
    lines.push({
      qty,
      weightKg: p.weightKg ? Number(p.weightKg) : null,
      categorySlug: p.category.slug,
    });
  }

  if (lines.length === 0) {
    return NextResponse.json({ error: "No valid lines" }, { status: 400 });
  }

  return NextResponse.json(calculateTotals(subtotal, { lines }));
}
