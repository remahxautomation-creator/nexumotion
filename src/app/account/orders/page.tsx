import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Orders" };

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-slate-100 text-slate-600",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <Link href="/account" className="text-sm text-[#0052CC] font-medium">← Account</Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500 text-sm">
          No orders yet. <Link href="/search" className="text-[#0052CC] font-medium">Start shopping</Link>.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.orderNumber}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
              <div>
                <div className="sku text-slate-700">{o.orderNumber}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {o.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {o.items.length} line{o.items.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status] ?? STATUS_STYLES.PENDING}`}>
                  {o.status}
                </span>
                <span className="font-semibold text-sm">{formatPrice(Number(o.total))}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
