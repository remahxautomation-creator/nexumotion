import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import AcceptQuote from "@/components/quotes/AcceptQuote";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quote" };

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/quotes");

  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: { items: { include: { product: { include: { brand: true } } } } },
  });
  if (!quote || quote.userId !== session.user.id) notFound();

  const listTotal = quote.items.reduce((n, it) => n + Number(it.listPrice) * it.qty, 0);
  const quotedTotal = quote.items.reduce(
    (n, it) => n + (it.quotedPrice !== null ? Number(it.quotedPrice) * it.qty : 0), 0
  );
  const allQuoted = quote.items.every((it) => it.quotedPrice !== null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-slate-900">
          Quote <span className="sku">Q-{quote.id.slice(-8).toUpperCase()}</span>
        </h1>
        <Link href="/account/quotes" className="text-sm text-[#0052CC] font-medium">← All quotes</Link>
      </div>
      <div className="text-sm text-slate-500 mb-6">Status: <strong>{quote.status}</strong></div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">List Price</th>
              <th className="px-4 py-3">Quoted Price</th>
              <th className="px-4 py-3">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5">
                  <span className="sku text-slate-600">{it.product.sku}</span>
                  <div className="text-xs text-slate-400">{it.product.brand.name}</div>
                </td>
                <td className="px-4 py-2.5">{it.qty}</td>
                <td className="px-4 py-2.5 text-slate-500">{formatPrice(Number(it.listPrice))}</td>
                <td className="px-4 py-2.5 font-semibold">
                  {it.quotedPrice !== null ? (
                    <span className="text-emerald-700">{formatPrice(Number(it.quotedPrice))}</span>
                  ) : (
                    <span className="text-slate-400 text-xs">pending</span>
                  )}
                </td>
                <td className="px-4 py-2.5 font-semibold">
                  {it.quotedPrice !== null ? formatPrice(Number(it.quotedPrice) * it.qty) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-sm w-full sm:w-80 space-y-1.5">
          <div className="flex justify-between text-slate-500">
            <span>List total</span><span className="line-through">{formatPrice(listTotal)}</span>
          </div>
          {allQuoted && (
            <div className="flex justify-between font-bold text-base">
              <span>Quoted total</span><span className="text-emerald-700">{formatPrice(quotedTotal)}</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400">+ 14% VAT on acceptance · shipping per agreement</div>
        </div>
      </div>

      {quote.notes && (
        <div className="mt-4 text-sm text-slate-600"><strong>Your notes:</strong> {quote.notes}</div>
      )}
      {quote.adminNotes && (
        <div className="mt-2 text-sm text-slate-600"><strong>Our reply:</strong> {quote.adminNotes}</div>
      )}

      {quote.status === "QUOTED" && allQuoted && <AcceptQuote quoteId={quote.id} />}
    </div>
  );
}
