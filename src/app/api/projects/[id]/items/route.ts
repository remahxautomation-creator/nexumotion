import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function ownedProject(id: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  return project && project.userId === userId ? project : null;
}

// Bulk import: body = { lines: [{ sku, qty }] }  (used by CSV import and quick-add)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await params;
  if (!(await ownedProject(id, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const lines = (body?.lines ?? []) as { sku?: string; qty?: number }[];
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 500) {
    return NextResponse.json({ error: "1-500 lines required" }, { status: 400 });
  }

  const results: { sku: string; status: "added" | "not_found" | "invalid"; name?: string }[] = [];

  for (const line of lines) {
    const sku = line.sku?.trim();
    const qty = Number(line.qty ?? 1);
    if (!sku || !Number.isInteger(qty) || qty < 1 || qty > 10000) {
      results.push({ sku: sku ?? "?", status: "invalid" });
      continue;
    }
    const product =
      (await prisma.product.findUnique({ where: { sku } })) ??
      (await prisma.product.findFirst({ where: { sku: { contains: sku } } }));
    if (!product) {
      results.push({ sku, status: "not_found" });
      continue;
    }
    const existing = await prisma.projectItem.findFirst({
      where: { projectId: id, productId: product.id },
    });
    if (existing) {
      await prisma.projectItem.update({ where: { id: existing.id }, data: { qty: existing.qty + qty } });
    } else {
      await prisma.projectItem.create({ data: { projectId: id, productId: product.id, qty } });
    }
    results.push({ sku, status: "added", name: product.name });
  }

  return NextResponse.json({ results });
}

// Update qty or remove: body = { itemId, qty }  (qty 0 removes)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await params;
  if (!(await ownedProject(id, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const itemId = body?.itemId as string | undefined;
  const qty = Number(body?.qty);
  if (!itemId || !Number.isInteger(qty) || qty < 0 || qty > 10000) {
    return NextResponse.json({ error: "itemId and qty (0-10000) required" }, { status: 400 });
  }

  const item = await prisma.projectItem.findUnique({ where: { id: itemId } });
  if (!item || item.projectId !== id) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (qty === 0) await prisma.projectItem.delete({ where: { id: itemId } });
  else await prisma.projectItem.update({ where: { id: itemId }, data: { qty } });

  return NextResponse.json({ ok: true });
}
