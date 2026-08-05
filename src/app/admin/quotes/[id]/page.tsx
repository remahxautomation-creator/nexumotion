import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuoteEditor from "@/components/admin/QuoteEditor";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminQuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getT();
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: { include: { brand: true } } } },
    },
  });
  if (!quote) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-slate-900">
          {t("quotes.quote")} <span className="sku">Q-{quote.id.slice(-8).toUpperCase()}</span>
        </h1>
        <Link href="/admin/quotes" className="text-sm text-[#0A6286] font-medium">{t("quotes.all")}</Link>
      </div>
      <div className="text-sm text-slate-500 mb-1">
        {quote.user.email}{quote.user.companyName ? ` · ${quote.user.companyName}` : ""} · {t("common.status")}: <strong>{t(`status.${quote.status}` as never)}</strong>
      </div>
      {quote.notes && <div className="text-sm text-slate-600 mb-4"><strong>{t("admin.customerNotes")}</strong> {quote.notes}</div>}

      <QuoteEditor
        quoteId={quote.id}
        status={quote.status}
        adminNotes={quote.adminNotes ?? ""}
        items={quote.items.map((it) => ({
          id: it.id,
          sku: it.product.sku,
          name: it.product.name,
          brand: it.product.brand.name,
          qty: it.qty,
          listPrice: Number(it.listPrice),
          quotedPrice: it.quotedPrice !== null ? Number(it.quotedPrice) : null,
          stockQty: it.product.stockQty,
        }))}
      />
    </div>
  );
}
