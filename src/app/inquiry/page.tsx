import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, Clock, ShieldCheck } from "lucide-react";
import PartInquiryForm from "@/components/inquiry/PartInquiryForm";
import { prisma } from "@/lib/prisma";
import { mirrorProductBySku } from "@/lib/catalog-mirror";
import { getT } from "@/i18n/server";
import { contact } from "@/content/site-content";
import { telHref, mailHref } from "@/lib/contact";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("meta.inquiry"),
    description: t("meta.inquiryDesc"),
  };
}

/**
 * Sourcing request, for two arrivals:
 *   /inquiry              — a part we do not list at all
 *   /inquiry?sku=XYZ      — a catalogue item we cannot ship from stock
 *
 * The SKU is looked up so the page can name the part and lock the identifying
 * fields. An unknown SKU is not an error: that is exactly the "we do not carry
 * this" case, and the form simply opens with the value prefilled and editable.
 */
/** Prefill for the form: mirror first, database only for very new SKUs. */
async function loadPrefill(sku: string) {
  const mirrored = await mirrorProductBySku(sku).catch(() => null);
  if (mirrored) return mirrored;

  try {
    return await prisma.product.findUnique({
      where: { sku },
      select: { sku: true, name: true, slug: true, brand: { select: { name: true } } },
    });
  } catch (err) {
    // The form still works — it just opens without the part details filled in,
    // and the SKU the visitor arrived with is passed through regardless.
    console.warn(`[inquiry] prefill unavailable for ${sku}: ${String(err).slice(0, 160)}`);
    return null;
  }
}

export default async function InquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string }>;
}) {
  const { sku = "" } = await searchParams;
  const { t } = await getT();

  // Mirror first. This page is where an out-of-stock product and an empty
  // search result both lead, so a database problem must never break it — the
  // visitor has already told us the part number they want.
  const product = sku ? await loadPrefill(sku) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-start gap-3 mb-2">
        <PackageSearch className="w-7 h-7 text-[#0A6286] shrink-0 mt-0.5" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("inquiry.part.title")}</h1>
          <p className="text-slate-600 mt-1">{t("inquiry.part.subtitle")}</p>
        </div>
      </div>

      {product && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-xs font-semibold text-blue-800 mb-1">
            {t("inquiry.part.aboutThis")}
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="font-semibold text-slate-900 hover:text-[#0A6286]"
          >
            {product.name}
          </Link>
          <div className="text-sm text-slate-600 mt-0.5">
            {product.brand.name} · <span className="sku">{product.sku}</span>
          </div>
        </div>
      )}

      {sku && !product && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {t("inquiry.part.notListed").replace("{sku}", sku)}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3 mt-6 mb-8">
        {/* Written out rather than mapped over key strings: the dictionary is
            typed on its literal keys, so a mapped string is not a valid key. */}
        {[
          { Icon: PackageSearch, text: t("inquiry.part.benefit1") },
          { Icon: Clock, text: t("inquiry.part.benefit2") },
          { Icon: ShieldCheck, text: t("inquiry.part.benefit3") },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-start gap-2 text-sm text-slate-600">
            <Icon className="w-4 h-4 text-[#00A88F] shrink-0 mt-0.5" />
            <span>{text}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <PartInquiryForm
          sku={product?.sku ?? sku}
          productName={product?.name ?? ""}
          manufacturer={product?.brand.name ?? ""}
          locked={!!product}
        />
      </div>

      <p className="text-sm text-slate-500 mt-6">
        {t("inquiry.part.orContact")}{" "}
        <a href={telHref} dir="ltr" className="text-[#0A6286] font-medium hover:underline">
          {contact.phone}
        </a>{" "}
        ·{" "}
        <a href={mailHref} dir="ltr" className="text-[#0A6286] font-medium hover:underline">
          {contact.email}
        </a>
      </p>
    </div>
  );
}
