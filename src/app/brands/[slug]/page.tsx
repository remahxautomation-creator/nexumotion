import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
import { parseJsonArray } from "@/lib/utils";
import { mirrorBrand, type MirrorProduct } from "@/lib/catalog-mirror";
import OfflineCatalogueNotice from "@/components/catalog/OfflineCatalogueNotice";

export const dynamic = "force-dynamic";

type BrandView = {
  name: string;
  country: string | null;
  description: string | null;
  productCount: number;
  products: MirrorProduct[];
};

/**
 * Published catalogue first, database only if it is unavailable.
 *
 * The catalogue is published content, not live data: 1,025 products that change
 * on import, weekly at most. Querying D1 for them on every request is what read
 * 56 million rows in a day and took the site down. Reading the mirror instead
 * costs zero database rows and cannot be rate limited, because it is a static
 * asset.
 *
 * D1 stays behind it as the safety net for the window between a catalogue
 * import and the mirror being regenerated, so a brand that exists in the
 * database but not yet in the mirror still resolves.
 */
async function getBrand(slug: string): Promise<{ view: BrandView; offline: boolean } | null> {
  const mirrored = await mirrorBrand(slug).catch(() => null);
  if (mirrored) {
    return {
      offline: false,
      view: {
        name: mirrored.brand.name,
        country: mirrored.brand.country,
        description: mirrored.brand.description,
        productCount: mirrored.productCount,
        products: mirrored.products,
      },
    };
  }

  try {
    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: { brand: true },
          orderBy: { name: "asc" },
          take: 60,
        },
        _count: { select: { products: true } },
      },
    });
    if (!brand) return null;

    return {
      offline: false,
      view: {
        name: brand.name,
        country: brand.country,
        description: brand.description,
        productCount: brand._count.products,
        products: brand.products.map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          slug: p.slug,
          shortDesc: p.shortDesc,
          price: Number(p.price),
          comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
          stockStatus: p.stockStatus,
          stockQty: p.stockQty,
          brandName: brand.name,
          brandSlug: brand.slug,
          categoryId: p.categoryId,
          image: parseJsonArray(p.images)[0] ?? null,
        })),
      },
    };
  } catch (err) {
    // Not in the mirror and the database is unreachable: nothing left to try.
    console.warn(`[brand/${slug}] not in the mirror and D1 failed: ${String(err).slice(0, 200)}`);
    return null;
  }
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getBrand(slug);
  if (!result) notFound();

  const { view, offline } = result;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {offline && <OfflineCatalogueNotice />}

      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{view.name}</h1>
        <div className="text-sm text-slate-500 mt-1">
          {view.country} · {view.productCount} products
        </div>
        {view.description && (
          <p className="text-sm text-slate-600 mt-3 max-w-3xl">{view.description}</p>
        )}
      </div>

      {view.products.length === 0 ? (
        <div className="text-slate-500 text-sm">No products listed yet for this brand.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {view.products.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
            />
          ))}
        </div>
      )}
    </div>
  );
}
