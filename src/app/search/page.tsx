import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { SearchTracker } from "@/components/analytics/Trackers";
import { parseJsonArray } from "@/lib/utils";
import { mirrorSearch, type MirrorProduct } from "@/lib/catalog-mirror";
import OfflineCatalogueNotice from "@/components/catalog/OfflineCatalogueNotice";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("meta.search") };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  let products: MirrorProduct[] = [];
  let crossMatched = false;
  const offline = false;

  async function searchLive(term: string) {
    const rows = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { sku: { contains: term } },
          { name: { contains: term } },
          { shortDesc: { contains: term } },
          { brand: { name: { contains: term } } },
        ],
      },
      include: { brand: true },
      take: 48,
    });
    return rows.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      shortDesc: p.shortDesc,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      stockStatus: p.stockStatus,
      stockQty: p.stockQty,
      brandName: p.brand.name,
      brandSlug: p.brand.slug,
      categoryId: p.categoryId,
      image: parseJsonArray(p.images)[0] ?? null,
    }));
  }

  if (query) {
    // Mirror first: search scans the catalogue, which is the most expensive
    // possible thing to ask a database for on every keystroke-driven page load.
    // In memory over 1,025 indexed rows it is free and immediate.
    const mirrored = await mirrorSearch(query).catch(() => null);
    if (mirrored) {
      products = mirrored.products;
      crossMatched = mirrored.crossMatched;
    }

    try {
      if (!mirrored) products = await searchLive(query);

      // Cross-reference fallback: search by competitor SKU. Only reached when
      // the mirror was unavailable, since it resolves cross-references itself.
      if (!mirrored && products.length === 0) {
        const refs = await prisma.crossReference.findMany({
          where: { competitorSku: { contains: query } },
          include: { product: { include: { brand: true } } },
          take: 48,
        });
        products = refs.map((r) => ({
          id: r.product.id,
          sku: r.product.sku,
          name: r.product.name,
          slug: r.product.slug,
          shortDesc: r.product.shortDesc,
          price: Number(r.product.price),
          comparePrice: r.product.comparePrice ? Number(r.product.comparePrice) : null,
          stockStatus: r.product.stockStatus,
          stockQty: r.product.stockQty,
          brandName: r.product.brand.name,
          brandSlug: r.product.brand.slug,
          categoryId: r.product.categoryId,
          image: parseJsonArray(r.product.images)[0] ?? null,
        }));
        crossMatched = products.length > 0;
      }
    } catch (err) {
      // Mirror missing and the database is down: return nothing rather than
      // failing the page, so the "request this part" path still shows.
      console.warn(`[search] no mirror and D1 failed: ${String(err).slice(0, 200)}`);
      products = [];
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {offline && <OfflineCatalogueNotice />}
      {query && <SearchTracker term={query} results={products.length} />}
      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        {query ? `Results for “${query}”` : "Search Parts"}
      </h1>
      {crossMatched && (
        <div className="mt-2 mb-4 text-sm bg-blue-50 text-blue-800 border border-blue-200 rounded-md px-3 py-2">
          No direct match — showing our equivalents for competitor part number <span className="sku">{query}</span>.
        </div>
      )}
      <p className="text-sm text-slate-500 mb-6">
        {query ? `${products.length} products found` : "Search by part number, competitor SKU, brand, or keyword using the bar above."}
      </p>
      {query && products.length === 0 ? (
        // A search that returns nothing is the clearest signal we have that
        // someone wants a part we do not list, so it offers to source it
        // rather than being a dead end. The query is passed through as the SKU
        // so the form opens with the part number already filled in.
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-500">
            No products found. Try a shorter part number fragment or a different keyword.
          </p>
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-700">
              Looking for a part we don&apos;t list?
            </p>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              We source outside the catalogue. Send the manufacturer and part number and we&apos;ll
              come back with price and lead time.
            </p>
            <Link
              href={`/inquiry?sku=${encodeURIComponent(query)}`}
              className="inline-flex items-center gap-2 bg-[#07C89B] hover:bg-[#06B48C] text-[#0A2A38] font-semibold px-6 py-3 rounded-lg text-sm"
            >
              <MessageSquareQuote className="w-4 h-4" />
              Request this part
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
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
      )}
    </div>
  );
}
