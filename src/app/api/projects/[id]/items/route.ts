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

  type Result = { sku: string; status: "added" | "not_found" | "invalid"; name?: string };

  // Validate first, then resolve every SKU in a couple of queries rather than
  // two or three per line. A 500-line BOM previously issued ~1,500 sequential
  // round trips; it now issues a handful. Matching precedence is unchanged:
  // exact SKU wins, then a `contains` fallback.
  //
  // Results are written back into their original line positions, so the report
  // the user sees still lines up with the file they pasted.
  const parsed = lines.map((line) => {
    const sku = line.sku?.trim();
    const qty = Number(line.qty ?? 1);
    const valid = !!sku && Number.isInteger(qty) && qty >= 1 && qty <= 10000;
    return { sku, qty, valid };
  });

  const results: Result[] = parsed.map((p) =>
    p.valid ? { sku: p.sku!, status: "not_found" } : { sku: p.sku ?? "?", status: "invalid" }
  );

  const valid = parsed
    .map((p, i) => ({ ...p, i }))
    .filter((p): p is { sku: string; qty: number; valid: true; i: number } => p.valid);

  const bySku = new Map<string, { id: string; name: string }>();
  if (valid.length) {
    const skus = [...new Set(valid.map((v) => v.sku))];
    const exact = await prisma.product.findMany({
      where: { sku: { in: skus } },
      select: { id: true, sku: true, name: true },
    });
    for (const p of exact) bySku.set(p.sku, { id: p.id, name: p.name });

    // Only the SKUs that missed need the slower partial match.
    const unmatched = skus.filter((s) => !bySku.has(s));
    if (unmatched.length) {
      const partial = await prisma.product.findMany({
        where: { OR: unmatched.map((s) => ({ sku: { contains: s } })) },
        select: { id: true, sku: true, name: true },
      });
      for (const s of unmatched) {
        const hit = partial.find((p) => p.sku.includes(s));
        if (hit) bySku.set(s, { id: hit.id, name: hit.name });
      }
    }
  }

  // Existing items for this project, so duplicate SKUs merge as before.
  const matchedIds = [...bySku.values()].map((p) => p.id);
  const existingItems = matchedIds.length
    ? await prisma.projectItem.findMany({
        where: { projectId: id, productId: { in: matchedIds } },
        select: { id: true, productId: true, qty: true },
      })
    : [];
  const existingByProduct = new Map(existingItems.map((i) => [i.productId, i]));

  for (const { sku, qty, i } of valid) {
    const product = bySku.get(sku);
    if (!product) continue; // already seeded as not_found at position i

    const existing = existingByProduct.get(product.id);
    if (existing) {
      const nextQty = existing.qty + qty;
      await prisma.projectItem.update({ where: { id: existing.id }, data: { qty: nextQty } });
      existing.qty = nextQty; // keep the map correct if the same SKU repeats
    } else {
      const created = await prisma.projectItem.create({
        data: { projectId: id, productId: product.id, qty },
      });
      existingByProduct.set(product.id, { id: created.id, productId: product.id, qty });
    }
    results[i] = { sku, status: "added", name: product.name };
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
