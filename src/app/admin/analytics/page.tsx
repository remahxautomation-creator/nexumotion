import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const { t } = await getT();
  const [bestSellers, ordersByStatus, brandSales, categorySales] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { qty: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
      _sum: { total: true },
    }),
    prisma.orderItem.findMany({ include: { product: { include: { brand: true, category: true } } } }),
    null,
  ]);

  const products = await prisma.product.findMany({
    where: { id: { in: bestSellers.map((b) => b.productId) } },
    include: { brand: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  // Aggregate brand + category revenue from order items
  const byBrand = new Map<string, number>();
  const byCategory = new Map<string, number>();
  for (const it of brandSales) {
    byBrand.set(it.product.brand.name, (byBrand.get(it.product.brand.name) ?? 0) + Number(it.total));
    byCategory.set(it.product.category.name, (byCategory.get(it.product.category.name) ?? 0) + Number(it.total));
  }
  const topBrands = [...byBrand.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topCategories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  void categorySales;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t("admin.analytics")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="font-semibold text-slate-900 text-sm mb-3">{t("admin.bestSellers")}</h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {bestSellers.length === 0 && <div className="p-6 text-sm text-slate-500">{t("admin.noSales")}</div>}
            {bestSellers.map((b) => {
              const p = productById.get(b.productId);
              if (!p) return null;
              return (
                <Link key={b.productId} href={`/products/${p.slug}`}
                  className="flex justify-between items-center px-4 py-3 text-sm hover:bg-slate-50">
                  <div>
                    <span className="sku">{p.sku}</span>
                    <div className="text-xs text-slate-400">{p.brand.name} · {b._sum.qty} {t("admin.unitsSold")}</div>
                  </div>
                  <span className="font-semibold">{formatPrice(Number(b._sum.total ?? 0))}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900 text-sm mb-3">{t("admin.ordersByStatus")}</h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {ordersByStatus.length === 0 && <div className="p-6 text-sm text-slate-500">{t("admin.noOrders")}</div>}
            {ordersByStatus.map((s) => (
              <div key={s.status} className="flex justify-between items-center px-4 py-3 text-sm">
                <span className="font-medium">{t(`status.${s.status}` as never)}</span>
                <span className="text-slate-600">
                  {s._count} · {formatPrice(Number(s._sum.total ?? 0))}
                </span>
              </div>
            ))}
          </div>

          <h2 className="font-semibold text-slate-900 text-sm mb-3 mt-6">{t("admin.revenueByBrand")}</h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {topBrands.length === 0 && <div className="p-6 text-sm text-slate-500">{t("admin.noSales")}</div>}
            {topBrands.map(([name, total]) => (
              <div key={name} className="flex justify-between items-center px-4 py-2.5 text-sm">
                <span>{name}</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
            ))}
          </div>

          <h2 className="font-semibold text-slate-900 text-sm mb-3 mt-6">{t("admin.revenueByCategory")}</h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {topCategories.length === 0 && <div className="p-6 text-sm text-slate-500">{t("admin.noSales")}</div>}
            {topCategories.map(([name, total]) => (
              <div key={name} className="flex justify-between items-center px-4 py-2.5 text-sm">
                <span>{name}</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
