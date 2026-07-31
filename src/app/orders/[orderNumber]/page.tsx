import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order Confirmation" };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  const { orderNumber } = await params;
  const { e } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { user: true, items: { include: { product: { include: { brand: true } } } } },
  });
  if (!order) notFound();

  // Access: session owner, or guest with matching email in query
  const session = await auth();
  const isOwner = session?.user?.id === order.userId;
  const emailMatches = !!e && e.toLowerCase() === order.user.email.toLowerCase();
  if (!isOwner && !emailMatches) notFound();

  const addr = order.shippingAddress as {
    name?: string; phone?: string; address?: string; city?: string; country?: string;
  } | null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Order placed</h1>
            <div className="sku text-slate-500">{order.orderNumber}</div>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-3">
          Thank you{addr?.name ? `, ${addr.name}` : ""}. A confirmation was recorded for{" "}
          <strong>{order.user.email}</strong>. Our team will contact you within one business
          day with payment instructions.
        </p>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <h2 className="font-semibold text-slate-900 text-sm mb-3">Items</h2>
          <div className="divide-y divide-slate-100">
            {order.items.map((it) => (
              <div key={it.id} className="py-2.5 flex justify-between text-sm gap-3">
                <div>
                  <div className="sku text-slate-500">{it.product.sku}</div>
                  <div className="text-slate-900">{it.product.name}</div>
                  <div className="text-xs text-slate-400">{it.product.brand.name} · × {it.qty}</div>
                </div>
                <div className="font-medium shrink-0">{formatPrice(Number(it.total))}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span>{Number(order.shipping) === 0 ? "Free" : formatPrice(Number(order.shipping))}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">VAT</span><span>{formatPrice(Number(order.tax))}</span></div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-100">
            <span>Total</span><span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>

        {addr && (
          <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <h2 className="font-semibold text-slate-900 text-sm mb-1">Ships to</h2>
            {addr.name} · {addr.phone}<br />
            {addr.address}, {addr.city}, {addr.country}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link href="/search" className="bg-[#0052CC] text-white font-semibold px-5 py-2 rounded-lg text-sm">
            Continue shopping
          </Link>
          {session?.user && (
            <Link href="/account/orders" className="border border-slate-300 bg-white font-semibold px-5 py-2 rounded-lg text-sm">
              My orders
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
