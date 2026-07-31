import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};

  if (body?.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    data.price = price;
  }
  if (body?.stockQty !== undefined) {
    const qty = Number(body.stockQty);
    if (!Number.isInteger(qty) || qty < 0) {
      return NextResponse.json({ error: "Invalid stock quantity" }, { status: 400 });
    }
    data.stockQty = qty;
    data.stockStatus = qty === 0 ? "OUT_OF_STOCK" : qty < 10 ? "LOW_STOCK" : "IN_STOCK";
  }
  if (typeof body?.isActive === "boolean") data.isActive = body.isActive;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const product = await prisma.product.update({ where: { id }, data }).catch(() => null);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
