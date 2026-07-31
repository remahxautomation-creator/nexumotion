import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
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
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="font-semibold text-slate-900 text-sm mb-3">Best Sellers (by revenue)</h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {bestSellers.length === 0 && <div className="p-6 text-sm text-slate-500">No sales yet.</div>}
            {bestSellers.map((b) => {
              const p = productById.get(b.productId);
              if (!p) return null;
              return (
                <Link key={b.productId} href={`/products/${p.slug}`}
                  className="flex justify-between items-center px-4 py-3 text-sm hover:bg-slate-50">
                  <div>
                    <span className="sku">{p.sku}</span>
                    <div className="text-xs text-slate-400">{p.brand.name} · {b._sum.qty} units sold</div>
                  </div>
                  <span className="font-semibold">{formatPrice(Number(b._sum.total ?? 0))}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900 text-sm mb-3">Orders by Status</h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {ordersByStatus.length === 0 && <div className="p-6 text-sm text-slate-500">No orders yet.</div>}
            {ordersByStatus.map((s) => (
              <div key={s.status} className="flex justify-between items-center px-4 py-3 text-sm">
                <span className="font-medium">{s.status}</span>
                <span className="text-slate-600">
                  {s._count} order{s._count !== 1 ? "s" : ""} · {formatPrice(Number(s._sum.total ?? 0))}
                </span>
              </div>
            ))}
          </div>

          <h2 className="font-semibold text-slate-900 text-sm mb-3 mt-6">Revenue by Brand</h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {topBrands.length === 0 && <div className="p-6 text-sm text-slate-500">No sales yet.</div>}
            {topBrands.map(([name, total]) => (
              <div key={name} className="flex justify-between items-center px-4 py-2.5 text-sm">
                <span>{name}</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
            ))}
          </div>

          <h2 className="font-semibold text-slate-900 text-sm mb-3 mt-6">Revenue by Category</h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {topCategories.length === 0 && <div className="p-6 text-sm text-slate-500">No sales yet.</div>}
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
