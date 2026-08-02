import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const SHIPPING_FLAT = 25;
const FREE_SHIPPING_OVER = 1000;
const VAT_RATE = 0.14; // Egypt VAT

type LineInput = { productId: string; qty: number };

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const items = (body?.items ?? []) as LineInput[];
  const email = (body?.email as string | undefined)?.toLowerCase().trim();
  const shippingAddress = body?.shippingAddress;
  const notes = (body?.notes as string | undefined)?.trim() || null;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (
    !shippingAddress?.name || !shippingAddress?.phone ||
    !shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.country
  ) {
    return NextResponse.json({ error: "Complete shipping address required" }, { status: 400 });
  }
  for (const line of items) {
    if (!line.productId || !Number.isInteger(line.qty) || line.qty < 1 || line.qty > 10000) {
      return NextResponse.json({ error: "Invalid line item" }, { status: 400 });
    }
  }

  // Resolve user: session user, or guest user by email.
  const session = await auth();
  let userId = session?.user?.id;
  let orderEmail = session?.user?.email;
  if (!userId) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required for guest checkout" }, { status: 400 });
    }

    // An unauthenticated caller must not be able to attach an order to somebody
    // else's registered account. Previously this upserted on email alone, so
    // anyone who knew an address could push orders into that person's history.
    // A registered account (one with a password) now has to sign in instead.
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.password) {
      return NextResponse.json(
        { error: "An account exists for this email. Please sign in to place this order." },
        { status: 409 }
      );
    }

    const guest =
      existing ??
      (await prisma.user.create({
        data: { email, name: shippingAddress.name, role: "GUEST", country: shippingAddress.country },
      }));
    userId = guest.id;
    orderEmail = email;
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Load products at server prices
      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.productId) }, isActive: true },
      });
      const byId = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItems: { productId: string; qty: number; price: number; total: number }[] = [];

      for (const line of items) {
        const p = byId.get(line.productId);
        if (!p) throw new Error("PRODUCT_NOT_FOUND");
        if (p.stockStatus === "OUT_OF_STOCK" || p.stockQty < line.qty) {
          throw new Error(`INSUFFICIENT_STOCK:${p.sku}:${p.stockQty}`);
        }
        const price = Number(p.price);
        const total = price * line.qty;
        subtotal += total;
        orderItems.push({ productId: p.id, qty: line.qty, price, total });
      }

      // Decrement stock
      for (const line of items) {
        const p = byId.get(line.productId)!;
        const newQty = p.stockQty - line.qty;
        await tx.product.update({
          where: { id: p.id },
          data: {
            stockQty: newQty,
            stockStatus: newQty === 0 ? "OUT_OF_STOCK" : newQty < 10 ? "LOW_STOCK" : "IN_STOCK",
          },
        });
      }

      const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
      const tax = Math.round(subtotal * VAT_RATE * 100) / 100;
      const total = subtotal + shipping + tax;
      const orderNumber = `AM-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36 ** 3).toString(36).toUpperCase().padStart(3, "0")}`;

      return tx.order.create({
        data: {
          orderNumber,
          userId: userId!,
          status: "PENDING",
          subtotal, shipping, tax, total,
          currency: "USD",
          shippingAddress,
          paymentStatus: "PENDING",
          notes,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      email: orderEmail,
      total: Number(order.total),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "A product in your cart no longer exists" }, { status: 409 });
    }
    if (msg.startsWith("INSUFFICIENT_STOCK:")) {
      const [, sku, avail] = msg.split(":");
      return NextResponse.json(
        { error: `Insufficient stock for ${sku} — only ${avail} available` },
        { status: 409 }
      );
    }
    console.error("Order creation failed:", e);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
