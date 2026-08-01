import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseQuery, describeParse, type ParsedQuery } from "@/lib/spec-parser";
import { extractFilters, aiEnabled } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const query = (body?.query as string | undefined)?.trim();

  if (!query || query.length < 2 || query.length > 500) {
    return NextResponse.json({ error: "Enter a requirement to search for" }, { status: 400 });
  }

  const [categories, brandRows, specTemplates] = await Promise.all([
    prisma.category.findMany({ select: { slug: true, name: true } }),
    prisma.brand.findMany({ select: { name: true } }),
    prisma.specTemplate.findMany({ select: { key: true }, distinct: ["key"] }),
  ]);
  const brands = brandRows.map((b) => b.name);
  const specKeys = [...new Set(specTemplates.map((s) => s.key))];

  // Deterministic parse always runs — it is the baseline and the fallback.
  const parsed: ParsedQuery = parseQuery(query, brands);

  // AI, when configured, refines the extraction. Its output is allow-listed in
  // lib/ai.ts, and it can only ever add filters — never product data.
  let usedAi = false;
  if (aiEnabled()) {
    const ai = await extractFilters(query, categories, brands, specKeys);
    if (ai) {
      usedAi = true;
      if (ai.categorySlugs?.length) parsed.categoryHints = [...new Set([...parsed.categoryHints, ...ai.categorySlugs])];
      if (ai.brands?.length) parsed.brandHints = [...new Set([...parsed.brandHints, ...ai.brands])];
      if (ai.specs?.length) {
        for (const s of ai.specs) {
          if (!parsed.specFilters.some((e) => e.key === s.key)) parsed.specFilters.push(s);
        }
      }
      if (ai.ranges?.length) {
        for (const r of ai.ranges) {
          if (!parsed.rangeFilters.some((e) => e.key === r.key)) parsed.rangeFilters.push(r);
        }
      }
      if (ai.inStockOnly) parsed.inStockOnly = true;
      if (ai.keywords?.length) parsed.freeText = [...new Set([...parsed.freeText, ...ai.keywords])];
    }
  }

  // ── Build the database query. Products come from here, never from a model. ──
  const and: object[] = [];

  if (parsed.specFilters.length) {
    for (const f of parsed.specFilters) {
      and.push({ specs: { some: { specKey: f.key, value: f.value } } });
    }
  }
  for (const r of parsed.rangeFilters) {
    and.push({
      specs: {
        some: {
          specKey: r.key,
          valueNum: {
            ...(r.min !== undefined ? { gte: r.min } : {}),
            ...(r.max !== undefined ? { lte: r.max } : {}),
          },
        },
      },
    });
  }

  const where: Record<string, unknown> = { isActive: true };
  if (parsed.categoryHints.length) where.category = { slug: { in: parsed.categoryHints } };
  if (parsed.brandHints.length) where.brand = { name: { in: parsed.brandHints } };
  if (parsed.inStockOnly) where.stockStatus = { in: ["IN_STOCK", "LOW_STOCK"] };
  if (and.length) where.AND = and;

  // A query that produced no category, brand or spec constraint would match the
  // entire catalogue. Returning 24 arbitrary products as if they answered the
  // question is worse than returning nothing, so only run the constrained query
  // when there is an actual constraint — otherwise fall through to keyword and
  // cross-reference matching below.
  const hasConstraint =
    parsed.categoryHints.length > 0 ||
    parsed.brandHints.length > 0 ||
    parsed.inStockOnly ||
    and.length > 0;

  let products = hasConstraint
    ? await prisma.product.findMany({
        where,
        include: { brand: true, category: true },
        take: 24,
        orderBy: { stockQty: "desc" },
      })
    : [];

  // Progressive relaxation, so the user gets a useful near-miss instead of an
  // empty page. Each step is reported back so the result set is never silently
  // different from what was asked.
  const relaxed: string[] = [];
  if (products.length === 0 && and.length > 0) {
    const loosened = { ...where };
    delete loosened.AND;
    products = await prisma.product.findMany({
      where: loosened,
      include: { brand: true, category: true },
      take: 24,
      orderBy: { stockQty: "desc" },
    });
    if (products.length) relaxed.push("specs");
  }

  if (products.length === 0 && parsed.freeText.length) {
    products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: parsed.freeText.flatMap((w) => [
          { sku: { contains: w } },
          { name: { contains: w } },
          { brand: { name: { contains: w } } },
        ]),
      },
      include: { brand: true, category: true },
      take: 24,
      orderBy: { stockQty: "desc" },
    });
    if (products.length) relaxed.push("keywords");
  }

  // Cross-reference fallback: the query may be a competitor part number.
  let crossRef: { competitorSku: string; count: number } | null = null;
  if (products.length === 0) {
    const token = query.trim().split(/\s+/).find((t) => t.length >= 4 && /\d/.test(t))
      ?? (query.trim().length >= 4 && /\d/.test(query.trim()) ? query.trim() : undefined);
    if (token) {
      const refs = await prisma.crossReference.findMany({
        where: { competitorSku: { contains: token } },
        include: { product: { include: { brand: true, category: true } } },
        take: 12,
      });
      if (refs.length) {
        products = refs.map((r) => r.product);
        crossRef = { competitorSku: token, count: refs.length };
      }
    }
  }

  const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

  return NextResponse.json({
    understood: describeParse(parsed, categoryNames),
    usedAi,
    relaxed,
    crossRef,
    count: products.length,
    products: products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      brand: p.brand.name,
      category: p.category.name,
      categorySlug: p.category.slug,
      price: Number(p.price),
      stockStatus: p.stockStatus,
      stockQty: p.stockQty,
    })),
    // Suggested category links when nothing matched at all.
    suggestions: products.length === 0
      ? categories.filter((c) => parsed.categoryHints.includes(c.slug)).slice(0, 4)
      : [],
  });
}
