import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/search/FilterSidebar";
import SaveSearchButton from "@/components/search/SaveSearchButton";
import { getT } from "@/i18n/server";
import { parseJsonArray } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const { t } = await getT();

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { specs: { where: { isFilterable: true }, orderBy: { sortOrder: "asc" } } },
  });
  if (!category) notFound();

  // Build spec filters from query params: spec keys map directly to template keys.
  // ENUM/BOOLEAN → exact value match; NUMBER → key_min / key_max range on valueNum.
  const specFilters: { key: string; value: string }[] = [];
  const rangeFilters: { key: string; min?: number; max?: number }[] = [];
  for (const t of category.specs) {
    if (t.dataType === "NUMBER") {
      const min = Number(sp[`${t.key}_min`]);
      const max = Number(sp[`${t.key}_max`]);
      const range: { key: string; min?: number; max?: number } = { key: t.key };
      if (typeof sp[`${t.key}_min`] === "string" && Number.isFinite(min)) range.min = min;
      if (typeof sp[`${t.key}_max`] === "string" && Number.isFinite(max)) range.max = max;
      if (range.min !== undefined || range.max !== undefined) rangeFilters.push(range);
    } else {
      const v = sp[t.key];
      if (typeof v === "string" && v) specFilters.push({ key: t.key, value: v });
    }
  }
  const brandFilter = typeof sp.brand === "string" ? sp.brand : undefined;
  const inStockOnly = sp.stock === "in";

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
      ...(brandFilter ? { brand: { slug: brandFilter } } : {}),
      ...(inStockOnly ? { stockStatus: { in: ["IN_STOCK", "LOW_STOCK"] } } : {}),
      ...(specFilters.length || rangeFilters.length
        ? {
            AND: [
              ...specFilters.map((f) => ({ specs: { some: { specKey: f.key, value: f.value } } })),
              ...rangeFilters.map((f) => ({
                specs: {
                  some: {
                    specKey: f.key,
                    valueNum: {
                      ...(f.min !== undefined ? { gte: f.min } : {}),
                      ...(f.max !== undefined ? { lte: f.max } : {}),
                    },
                  },
                },
              })),
            ],
          }
        : {}),
    },
    include: { brand: true },
    orderBy: { name: "asc" },
    take: 60,
  });

  const brandsInCategory = await prisma.brand.findMany({
    where: { products: { some: { categoryId: category.id } } },
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });

  const filters = category.specs.map((t) => ({
    key: t.key,
    name: t.name,
    unit: t.unit,
    dataType: t.dataType,
    options: parseJsonArray(t.options),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">{category.name}</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">{category.description}</p>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 shrink-0">
          <FilterSidebar filters={filters} brands={brandsInCategory} />
        </aside>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-500">{products.length} {t("home.products")}</div>
            <SaveSearchButton defaultName={category.name} />
          </div>
          {products.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500">
              {t("filters.noMatch")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  p={{
                    id: p.id, sku: p.sku, name: p.name, slug: p.slug,
                    price: Number(p.price), comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
                    stockStatus: p.stockStatus, stockQty: p.stockQty, brandName: p.brand.name, image: parseJsonArray(p.images)[0] ?? null,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
