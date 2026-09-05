import Link from "next/link";
import { isPurchasable } from "@/lib/inventory";
import { notFound } from "next/navigation";
import { FileText, Box, CircuitBoard, ShieldCheck, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatEgp, formatWeight, parseJsonArray, STOCK_LABELS } from "@/lib/utils";
import { unitWeightKg } from "@/lib/pricing";
import { getT } from "@/i18n/server";
import AddToCartButton from "@/components/product/AddToCartButton";
import InquireButton from "@/components/product/InquireButton";
import ProductImage from "@/components/product/ProductImage";
import ProductCard from "@/components/product/ProductCard";
import { mirrorProduct } from "@/lib/catalog-mirror";
import OfflineCatalogueNotice from "@/components/catalog/OfflineCatalogueNotice";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Metadata runs before the page body and would otherwise throw first, so it
  // gets the same fallback. A title is not worth a 500.
  let product;
  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: { brand: true, category: true },
    });
  } catch {
    const m = await mirrorProduct(slug);
    product = m && {
      sku: m.product.sku,
      name: m.product.name,
      slug: m.product.slug,
      shortDesc: m.product.shortDesc,
      brand: { name: m.product.brandName },
      category: { name: m.categoryName ?? "parts" },
    };
  }
  if (!product) return { title: "Product not found" };

  const title = `${product.sku} — ${product.name} | ${product.brand.name}`;
  const description =
    product.shortDesc ??
    `${product.name} by ${product.brand.name}. Genuine ${product.category.name.toLowerCase()} in stock for Egypt, the Middle East and Africa.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await loadProduct(slug);
  if (!loaded) notFound();
  const { product, related, offline } = loaded;

  const stock = STOCK_LABELS[product.stockStatus] ?? STOCK_LABELS.IN_STOCK;
  const certs = parseJsonArray(product.certifications);
  const images = parseJsonArray(product.images);
  const { t } = await getT();
  // Real weight where the supplier gave one, otherwise the per-category
  // estimate that checkout will price the shipment on.
  const shipWeight = unitWeightKg(
    product.weightKg ? Number(product.weightKg) : null,
    product.category.slug
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    sku: product.sku,
    name: product.name,
    description: product.description ?? product.shortDesc ?? undefined,
    brand: { "@type": "Brand", name: product.brand.name },
    category: product.category.name,
    offers: {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: "USD",
      availability:
        product.stockStatus === "OUT_OF_STOCK"
          ? "https://schema.org/OutOfStock"
          : product.stockStatus === "BACKORDER"
          ? "https://schema.org/BackOrder"
          : "https://schema.org/InStock",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {offline && <OfflineCatalogueNotice />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 mb-4 flex gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-[#0A6286]">Home</Link> /
        <Link href={`/categories/${product.category.slug}`} className="hover:text-[#0A6286]">{product.category.name}</Link> /
        <span className="text-slate-700">{product.sku}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product images */}
        <div>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <ProductImage
              src={images[0]}
              alt={product.name}
              className="h-72"
              sizes="(max-width: 1024px) 100vw, 33vw"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {images.slice(1, 5).map((src, i) => (
                <div key={src} className="bg-white rounded-md border border-slate-200 overflow-hidden">
                  <ProductImage src={src} alt={`${product.name} — view ${i + 2}`} className="h-16" sizes="12vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="lg:col-span-1">
          <div className="sku text-slate-500">{product.sku}</div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{product.name}</h1>
          <Link href={`/brands/${product.brand.slug}`} className="text-sm text-[#0A6286] font-medium mt-1 inline-block">
            {product.brand.name} · {product.brand.country}
          </Link>
          <p className="text-sm text-slate-600 mt-3">{product.description}</p>
          {certs.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {certs.map((c) => (
                <span key={c} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 h-fit">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 ltr-nums">{formatPrice(Number(product.price))}</span>
            {product.comparePrice && (
              <span className="text-sm text-slate-400 line-through ltr-nums">{formatPrice(Number(product.comparePrice))}</span>
            )}
            <span className="text-xs text-slate-500">{product.costPerUnit}</span>
          </div>
          <div className="text-sm font-semibold text-slate-600 mt-0.5 ltr-nums">
            {formatEgp(Number(product.price))}
          </div>
          {shipWeight > 0 && (
            <div className="text-xs text-slate-400 mt-1.5 ltr-nums">
              {t("product.shipWeight")}: {formatWeight(shipWeight)}
              {product.weightKg ? "" : ` (${t("product.estimated")})`}
            </div>
          )}
          <div className={`inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full ${stock.className}`}>
            {stock.label}{product.stockQty > 0 ? ` — ${product.stockQty} units` : ""}
          </div>
          <div className="mt-4">
            {isPurchasable(product) ? (
              <AddToCartButton
                product={{
                  productId: product.id, sku: product.sku, name: product.name,
                  slug: product.slug, brand: product.brand.name, price: Number(product.price),
                }}
              />
            ) : (
              <>
                <InquireButton sku={product.sku} />
                <p className="text-xs text-slate-500 mt-2">
                  {t("product.inquireHint")}
                </p>
              </>
            )}
          </div>
          {product.priceTiers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-600 mb-2">Volume pricing</div>
              <table className="w-full text-xs">
                <tbody>
                  <tr className="text-slate-500">
                    <td className="py-0.5">1–{product.priceTiers[0].minQty - 1}</td>
                    <td className="py-0.5 text-end font-medium text-slate-700">{formatPrice(Number(product.price))}</td>
                  </tr>
                  {product.priceTiers.map((t, i) => {
                    const next = product.priceTiers[i + 1];
                    return (
                      <tr key={t.id} className="text-slate-500">
                        <td className="py-0.5">{t.minQty}{next ? `–${next.minQty - 1}` : "+"}</td>
                        <td className="py-0.5 text-end font-medium text-emerald-700">{formatPrice(Number(t.price))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="text-[10px] text-slate-400 mt-1.5">Need more? Request a quote from your cart.</div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
            {product.datasheetUrl ? (
              <a
                href={`/datasheet/${encodeURIComponent(product.sku)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#0A6286] font-medium hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> {t("product.datasheet")}
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> {t("product.datasheet")} ({t("product.onRequest")})
              </div>
            )}
            <div className="flex items-center gap-2"><Box className="w-3.5 h-3.5" /> {t("product.cad")} ({t("product.onRequest")})</div>
            <div className="flex items-center gap-2"><CircuitBoard className="w-3.5 h-3.5" /> {t("product.wiring")} ({t("product.onRequest")})</div>
          </div>
        </div>
      </div>

      {/* Spec matrix */}
      {product.specs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Technical Specifications</h2>
          <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {product.specs.map((s, i) => (
                  <tr key={s.id} className={i % 2 ? "bg-slate-50" : ""}>
                    <td className="px-4 py-2.5 font-medium text-slate-600 w-1/3">{s.specName}</td>
                    <td className="px-4 py-2.5 text-slate-900">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Cross-references */}
      {product.crossReferences.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Cross-References & Alternates</h2>
          <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-start text-xs text-slate-500 border-b border-slate-200">
                  <th className="px-4 py-2.5">Competitor SKU</th>
                  <th className="px-4 py-2.5">Brand</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5">Match</th>
                </tr>
              </thead>
              <tbody>
                {product.crossReferences.map((x) => (
                  <tr key={x.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5"><span className="sku">{x.competitorSku}</span></td>
                    <td className="px-4 py-2.5">{x.competitorBrand}</td>
                    <td className="px-4 py-2.5 text-slate-600">{x.competitorName}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{x.matchType}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Related in {product.category.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                p={{
                  id: p.id, sku: p.sku, name: p.name, slug: p.slug,
                  price: p.price, comparePrice: p.comparePrice,
                  stockStatus: p.stockStatus, stockQty: p.stockQty,
                  brandName: p.brandName, image: p.image,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Live product, falling back to the offline mirror.
 *
 * The mirror carries everything the page renders except price tiers and
 * cross-references, which are extras rather than the substance of the page and
 * are dropped rather than guessed at. Everything returned is normalised to one
 * shape so the JSX above does not need to know which source it came from.
 */
async function loadProduct(slug: string) {
  const m = await mirrorProduct(slug).catch(() => null);
  if (m) {
    return {
      offline: false,
      product: buildMirrorProduct(m),
      related: m.related.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        price: p.price,
        comparePrice: p.comparePrice,
        stockStatus: p.stockStatus,
        stockQty: p.stockQty,
        brandName: p.brandName,
        image: p.image,
      })),
    };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        specs: true,
        crossReferences: true,
        priceTiers: { orderBy: { minQty: "asc" } },
      },
    });
    if (!product) return null;

    const relatedRows = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
      include: { brand: true },
      take: 4,
    });

    return {
      offline: false,
      product: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        weightKg: product.weightKg ? Number(product.weightKg) : null,
        priceTiers: product.priceTiers.map((tier) => ({
          id: tier.id,
          minQty: tier.minQty,
          price: Number(tier.price),
        })),
      },
      related: relatedRows.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        stockStatus: p.stockStatus,
        stockQty: p.stockQty,
        brandName: p.brand.name,
        image: parseJsonArray(p.images)[0] ?? null,
      })),
    };
  } catch (err) {
    console.warn(`[product/${slug}] not in the mirror and D1 failed: ${String(err).slice(0, 200)}`);
    return null;
  }
}

/** Normalises a mirror record into the shape the page renders. */
function buildMirrorProduct(m: NonNullable<Awaited<ReturnType<typeof mirrorProduct>>>) {
  return {
    id: m.product.id,
    sku: m.product.sku,
    name: m.product.name,
    slug: m.product.slug,
    description: m.description,
    shortDesc: m.product.shortDesc,
    price: m.product.price,
    comparePrice: m.product.comparePrice,
    costPerUnit: "per unit",
    stockQty: m.product.stockQty,
    stockStatus: m.product.stockStatus,
    weightKg: m.weightKg,
    images: m.images,
    certifications: m.certifications,
    datasheetUrl: m.datasheetUrl,
    categoryId: m.product.categoryId,
    brand: {
      name: m.product.brandName,
      slug: m.product.brandSlug,
      country: m.brand?.country ?? null,
    },
    category: { name: m.categoryName ?? "", slug: m.categorySlug ?? "" },
    specs: m.specs.map((sp, i) => ({
      id: `${m.product.id}-${i}`,
      specKey: sp.specKey,
      specName: sp.specName,
      value: sp.value,
      unit: sp.unit,
    })),
    // Not mirrored: both are supplementary, and inventing them would be
    // worse than omitting them.
    crossReferences: [] as Array<{
      id: string;
      competitorBrand: string;
      competitorName: string;
      competitorSku: string;
      matchType: string;
    }>,
    priceTiers: [] as Array<{ id: string; minQty: number; price: number }>,
  };
}
