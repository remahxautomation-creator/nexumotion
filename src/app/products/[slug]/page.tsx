import Link from "next/link";
import { notFound } from "next/navigation";
import { Package, FileText, Box, CircuitBoard, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseJsonArray, STOCK_LABELS } from "@/lib/utils";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductCard from "@/components/product/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      specs: true,
      crossReferences: true,
    },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    include: { brand: true },
    take: 4,
  });

  const stock = STOCK_LABELS[product.stockStatus] ?? STOCK_LABELS.IN_STOCK;
  const certs = parseJsonArray(product.certifications);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 mb-4 flex gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-[#0052CC]">Home</Link> /
        <Link href={`/categories/${product.category.slug}`} className="hover:text-[#0052CC]">{product.category.name}</Link> /
        <span className="text-slate-700">{product.sku}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image placeholder */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 flex items-center justify-center min-h-72">
          <Package className="w-24 h-24 text-slate-200" />
        </div>

        {/* Main info */}
        <div className="lg:col-span-1">
          <div className="sku text-slate-500">{product.sku}</div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{product.name}</h1>
          <Link href={`/brands/${product.brand.slug}`} className="text-sm text-[#0052CC] font-medium mt-1 inline-block">
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
            <span className="text-2xl font-bold text-slate-900">{formatPrice(Number(product.price))}</span>
            {product.comparePrice && (
              <span className="text-sm text-slate-400 line-through">{formatPrice(Number(product.comparePrice))}</span>
            )}
            <span className="text-xs text-slate-500">{product.costPerUnit}</span>
          </div>
          <div className={`inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full ${stock.className}`}>
            {stock.label}{product.stockQty > 0 ? ` — ${product.stockQty} units` : ""}
          </div>
          <div className="mt-4">
            <AddToCartButton
              product={{
                productId: product.id, sku: product.sku, name: product.name,
                slug: product.slug, brand: product.brand.name, price: Number(product.price),
              }}
              disabled={product.stockStatus === "OUT_OF_STOCK"}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Datasheet PDF {product.datasheetUrl ? "" : "(on request)"}</div>
            <div className="flex items-center gap-2"><Box className="w-3.5 h-3.5" /> CAD file (STEP/IGES) {product.cadUrl ? "" : "(on request)"}</div>
            <div className="flex items-center gap-2"><CircuitBoard className="w-3.5 h-3.5" /> Wiring diagram (on request)</div>
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
                <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
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
                  price: Number(p.price), comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
                  stockStatus: p.stockStatus, brandName: p.brand.name,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
