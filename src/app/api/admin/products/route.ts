import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { stockStatusFor } from "@/lib/inventory";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type LineInput = {
  sku?: string; name?: string; brand?: string; category?: string;
  price?: number | string; stockQty?: number | string; shortDesc?: string;
};

// POST { products: LineInput[] } — creates or updates (upsert by SKU). Used by both
// the single-product form (1 line) and bulk CSV import.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const products = (body?.products ?? []) as LineInput[];
  if (!Array.isArray(products) || products.length === 0 || products.length > 1000) {
    return NextResponse.json({ error: "1-1000 products required" }, { status: 400 });
  }

  const results: { sku: string; status: "created" | "updated" | "error"; error?: string }[] = [];

  for (const line of products) {
    const sku = line.sku?.trim();
    const name = line.name?.trim();
    const brandName = line.brand?.trim();
    const categoryName = line.category?.trim();
    const price = Number(line.price);
    const stockQty = line.stockQty === undefined || line.stockQty === "" ? 0 : Number(line.stockQty);

    if (!sku || !name || !brandName || !categoryName || !Number.isFinite(price) || price < 0 ||
        !Number.isInteger(stockQty) || stockQty < 0) {
      results.push({ sku: sku ?? "?", status: "error", error: "sku, name, brand, category, valid price required" });
      continue;
    }

    const brand = await prisma.brand.findFirst({
      where: { OR: [{ name: brandName }, { slug: slugify(brandName) }] },
    });
    if (!brand) {
      results.push({ sku, status: "error", error: `Unknown brand "${brandName}"` });
      continue;
    }
    const category = await prisma.category.findFirst({
      where: { OR: [{ name: categoryName }, { slug: slugify(categoryName) }] },
    });
    if (!category) {
      results.push({ sku, status: "error", error: `Unknown category "${categoryName}"` });
      continue;
    }

    const stockStatus = stockStatusFor(stockQty);
    const existing = await prisma.product.findUnique({ where: { sku } });

    try {
      if (existing) {
        await prisma.product.update({
          where: { sku },
          data: {
            name, brandId: brand.id, categoryId: category.id, price, stockQty, stockStatus,
            shortDesc: line.shortDesc?.trim() || existing.shortDesc,
          },
        });
        results.push({ sku, status: "updated" });
      } else {
        await prisma.product.create({
          data: {
            sku, name,
            slug: slugify(`${brand.name}-${sku}`),
            brandId: brand.id, categoryId: category.id,
            price, stockQty, stockStatus,
            shortDesc: line.shortDesc?.trim() || null,
            costPerUnit: "per unit",
            images: JSON.stringify([]),
            certifications: JSON.stringify([]),
          },
        });
        results.push({ sku, status: "created" });
      }
    } catch (e) {
      results.push({ sku, status: "error", error: e instanceof Error ? e.message.slice(0, 120) : "DB error" });
    }
  }

  return NextResponse.json({ results });
}
