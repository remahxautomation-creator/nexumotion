import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH — two roles:
//  ADMIN:    { action: "quote", prices: {itemId: number}, adminNotes? }  → status QUOTED
//            { action: "reject" }                                        → status REJECTED
//  Customer: { action: "accept", shippingAddress }  → creates order from quoted prices
//            { action: "reject" }                   → status REJECTED
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = quote.userId === session.user.id;
  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const action = body?.action as string | undefined;

  if (action === "quote" && isAdmin) {
    if (quote.status !== "REQUESTED" && quote.status !== "QUOTED") {
      return NextResponse.json({ error: `Cannot quote a ${quote.status} request` }, { status: 409 });
    }
    const prices = (body?.prices ?? {}) as Record<string, number>;
    for (const item of quote.items) {
      const p = Number(prices[item.id]);
      if (Number.isFinite(p) && p >= 0) {
        await prisma.quoteItem.update({ where: { id: item.id }, data: { quotedPrice: p } });
      }
    }
    await prisma.quoteRequest.update({
      where: { id },
      data: { status: "QUOTED", adminNotes: (body?.adminNotes as string | undefined)?.trim() || quote.adminNotes },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    if (quote.status === "ACCEPTED") {
      return NextResponse.json({ error: "Already accepted" }, { status: 409 });
    }
    await prisma.quoteRequest.update({ where: { id }, data: { status: "REJECTED" } });
    return NextResponse.json({ ok: true });
  }

  if (action === "accept" && isOwner) {
    if (quote.status !== "QUOTED") {
      return NextResponse.json({ error: "Quote is not ready to accept" }, { status: 409 });
    }
    const addr = body?.shippingAddress;
    if (!addr?.name || !addr?.phone || !addr?.address || !addr?.city || !addr?.country) {
      return NextResponse.json({ error: "Complete shipping address required" }, { status: 400 });
    }
    if (quote.items.some((it) => it.quotedPrice === null)) {
      return NextResponse.json({ error: "Not all lines have quoted prices" }, { status: 409 });
    }

    try {
      const order = await prisma.$transaction(async (tx) => {
        let subtotal = 0;
        for (const it of quote.items) {
          const product = await tx.product.findUnique({ where: { id: it.productId } });
          if (!product || product.stockQty < it.qty) {
            throw new Error(`INSUFFICIENT_STOCK:${it.product.sku}`);
          }
          const newQty = product.stockQty - it.qty;
          await tx.product.update({
            where: { id: it.productId },
            data: {
              stockQty: newQty,
              stockStatus: newQty === 0 ? "OUT_OF_STOCK" : newQty < 10 ? "LOW_STOCK" : "IN_STOCK",
            },
          });
          subtotal += Number(it.quotedPrice) * it.qty;
        }
        const tax = Math.round(subtotal * 0.14 * 100) / 100;
        const shipping = 0; // negotiated quotes ship per agreement
        const orderNumber = `AM-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36 ** 3).toString(36).toUpperCase().padStart(3, "0")}`;

        const created = await tx.order.create({
          data: {
            orderNumber,
            userId: quote.userId,
            status: "CONFIRMED",
            subtotal, shipping, tax, total: subtotal + shipping + tax,
            currency: "USD",
            shippingAddress: addr,
            paymentStatus: "PENDING",
            notes: `From quote ${quote.id}`,
            items: {
              create: quote.items.map((it) => ({
                productId: it.productId,
                qty: it.qty,
                price: Number(it.quotedPrice),
                total: Number(it.quotedPrice) * it.qty,
              })),
            },
          },
        });
        await tx.quoteRequest.update({
          where: { id },
          data: { status: "ACCEPTED", orderId: created.id },
        });
        return created;
      });
      return NextResponse.json({ orderNumber: order.orderNumber });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.startsWith("INSUFFICIENT_STOCK:")) {
        return NextResponse.json({ error: `Insufficient stock for ${msg.split(":")[1]}` }, { status: 409 });
      }
      console.error("Quote accept failed:", e);
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
