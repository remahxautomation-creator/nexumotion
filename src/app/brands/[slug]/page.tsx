import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
import { parseJsonArray } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      products: { where: { isActive: true }, include: { brand: true }, orderBy: { name: "asc" }, take: 60 },
      _count: { select: { products: true } },
    },
  });
  if (!brand) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{brand.name}</h1>
        <div className="text-sm text-slate-500 mt-1">{brand.country} · {brand._count.products} products</div>
        {brand.description && <p className="text-sm text-slate-600 mt-3 max-w-3xl">{brand.description}</p>}
      </div>
      {brand.products.length === 0 ? (
        <div className="text-slate-500 text-sm">No products listed yet for this brand.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {brand.products.map((p) => (
            <ProductCard
              key={p.id}
              p={{
                id: p.id, sku: p.sku, name: p.name, slug: p.slug,
                price: Number(p.price), comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
                stockStatus: p.stockStatus, brandName: brand.name, image: parseJsonArray(p.images)[0] ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
