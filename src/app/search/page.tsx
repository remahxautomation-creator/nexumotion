import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { SearchTracker } from "@/components/analytics/Trackers";
import { parseJsonArray } from "@/lib/utils";

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

  let products: Awaited<ReturnType<typeof searchProducts>> = [];
  let crossMatched = false;

  async function searchProducts(term: string) {
    return prisma.product.findMany({
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
  }

  if (query) {
    products = await searchProducts(query);

    // Cross-reference fallback: search by competitor SKU
    if (products.length === 0) {
      const refs = await prisma.crossReference.findMany({
        where: { competitorSku: { contains: query } },
        include: { product: { include: { brand: true } } },
        take: 48,
      });
      products = refs.map((r) => r.product);
      crossMatched = products.length > 0;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
                price: Number(p.price), comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
                stockStatus: p.stockStatus, stockQty: p.stockQty, brandName: p.brand.name, image: parseJsonArray(p.images)[0] ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
