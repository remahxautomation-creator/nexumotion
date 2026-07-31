import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { t, locale } = await getT();
  const filter = status && STATUSES.includes(status) ? status : undefined;

  const orders = await prisma.order.findMany({
    where: filter ? { status: filter } : {},
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t("admin.orders")}</h1>
        <div className="flex gap-1 flex-wrap">
          <Link href="/admin/orders"
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${!filter ? "bg-[#0052CC] text-white border-[#0052CC]" : "bg-white text-slate-600 border-slate-300"}`}>
            {t("admin.all")}
          </Link>
          {STATUSES.map((s) => (
            <Link key={s} href={`/admin/orders?status=${s}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border ${filter === s ? "bg-[#0052CC] text-white border-[#0052CC]" : "bg-white text-slate-600 border-slate-300"}`}>
              {t(`status.${s}` as never)}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-start text-xs text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3">{t("orders.order")}</th>
              <th className="px-4 py-3">{t("common.customer")}</th>
              <th className="px-4 py-3">{t("common.lines")}</th>
              <th className="px-4 py-3">{t("cart.total")}</th>
              <th className="px-4 py-3">{t("admin.payment")}</th>
              <th className="px-4 py-3">{t("common.status")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">{t("admin.noOrdersFilter")}</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/orders/${o.orderNumber}`} className="sku text-[#0052CC] hover:underline">{o.orderNumber}</Link>
                  <div className="text-[10px] text-slate-400">
                    {o.createdAt.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short" })}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{o.user.email}</td>
                <td className="px-4 py-3">{o.items.length}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(Number(o.total))}</td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={o.id} field="paymentStatus" value={o.paymentStatus}
                    options={["PENDING", "PAID", "FAILED", "REFUNDED"]} />
                </td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={o.id} field="status" value={o.status} options={STATUSES} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
