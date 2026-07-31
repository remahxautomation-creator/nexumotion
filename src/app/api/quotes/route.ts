import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST { items: [{productId, qty}], notes? } → create quote request
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const items = (body?.items ?? []) as { productId?: string; qty?: number }[];
  const notes = (body?.notes as string | undefined)?.trim() || null;

  if (!Array.isArray(items) || items.length === 0 || items.length > 200) {
    return NextResponse.json({ error: "1-200 items required" }, { status: 400 });
  }
  for (const it of items) {
    if (!it.productId || !Number.isInteger(it.qty) || (it.qty ?? 0) < 1 || (it.qty ?? 0) > 100000) {
      return NextResponse.json({ error: "Invalid quote line" }, { status: 400 });
    }
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId!) }, isActive: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  for (const it of items) {
    if (!byId.has(it.productId!)) {
      return NextResponse.json({ error: "A product no longer exists" }, { status: 409 });
    }
  }

  const quote = await prisma.quoteRequest.create({
    data: {
      userId: session.user.id,
      notes,
      items: {
        create: items.map((it) => ({
          productId: it.productId!,
          qty: it.qty!,
          listPrice: Number(byId.get(it.productId!)!.price),
        })),
      },
    },
  });

  return NextResponse.json({ id: quote.id });
}
