import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orderCount, pendingCount, revenueAgg, productCount, lowStock, recentOrders, userCount] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ["CANCELLED", "RETURNED"] } } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: { isActive: true, stockStatus: { in: ["LOW_STOCK", "OUT_OF_STOCK"] } },
        orderBy: { stockQty: "asc" },
        take: 8,
        include: { brand: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: true, items: true },
      }),
      prisma.user.count(),
    ]);

  const stats = [
    { label: "Total Orders", value: orderCount, href: "/admin/orders" },
    { label: "Pending Orders", value: pendingCount, href: "/admin/orders?status=PENDING" },
    { label: "Revenue (booked)", value: formatPrice(Number(revenueAgg._sum.total ?? 0)) },
    { label: "Active Products", value: productCount, href: "/admin/products" },
    { label: "Users", value: userCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {s.href ? <Link href={s.href} className="hover:text-[#0052CC]">{s.value}</Link> : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="font-semibold text-slate-900 text-sm mb-3">Recent Orders</h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {recentOrders.length === 0 && <div className="p-6 text-sm text-slate-500">No orders yet.</div>}
            {recentOrders.map((o) => (
              <Link key={o.id} href={`/orders/${o.orderNumber}`} className="flex justify-between items-center px-4 py-3 text-sm hover:bg-slate-50">
                <div>
                  <span className="sku">{o.orderNumber}</span>
                  <div className="text-xs text-slate-400">{o.user.email} · {o.items.length} lines</div>
                </div>
                <div className="text-end">
                  <div className="font-semibold">{formatPrice(Number(o.total))}</div>
                  <div className="text-[10px] text-slate-500">{o.status}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900 text-sm mb-3">Low / Out of Stock</h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {lowStock.length === 0 && <div className="p-6 text-sm text-slate-500">All stocked.</div>}
            {lowStock.map((p) => (
              <div key={p.id} className="flex justify-between items-center px-4 py-3 text-sm">
                <div>
                  <span className="sku">{p.sku}</span>
                  <div className="text-xs text-slate-400">{p.brand.name}</div>
                </div>
                <span className={`text-xs font-semibold ${p.stockQty === 0 ? "text-red-600" : "text-amber-600"}`}>
                  {p.stockQty} units
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
