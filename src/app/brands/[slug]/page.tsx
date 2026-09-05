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
 * Live read, falling back to the offline mirror.
 *
 * `notFound` has to be distinguishable from "the database is down": a missing
 * brand is a 404, an unreachable database is not. So the live path returns null
 * only for a genuine miss, and a thrown error drops through to the mirror,
 * which answers 404 on its own terms.
 */
async function getBrand(slug: string): Promise<{ view: BrandView; offline: boolean } | null> {
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
    console.warn(`[brand/${slug}] falling back to the catalogue mirror: ${String(err).slice(0, 200)}`);
    const mirrored = await mirrorBrand(slug);
    if (!mirrored) return null;

    return {
      offline: true,
      view: {
        name: mirrored.brand.name,
        country: mirrored.brand.country,
        description: mirrored.brand.description,
        productCount: mirrored.productCount,
        products: mirrored.products,
      },
    };
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
              p={{
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
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
