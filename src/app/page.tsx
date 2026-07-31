import Link from "next/link";
import { ArrowRight, Cpu, Zap, Shield, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, brands, featured] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, take: 8, include: { _count: { select: { products: true } } } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, take: 12, include: { _count: { select: { products: true } } } }),
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: 8,
      include: { brand: true },
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0052CC] to-[#003D99] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <h1 className="text-3xl md:text-5xl font-bold max-w-3xl leading-tight">
            Industrial Automation Parts for the MENA Region
          </h1>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl">
            50+ brands. 5,000+ SKUs. Parametric search, cross-referencing, and BOM ordering —
            built for engineers, not marketers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/search" className="bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg">
              Search Parts
            </Link>
            <Link href="/brands" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/30">
              Browse Brands
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          {[
            { icon: Shield, label: "Authenticity guaranteed", sub: "Genuine parts only" },
            { icon: Zap, label: "Cross-reference engine", sub: "Search competitor SKUs" },
            { icon: Cpu, label: "Engineer-first specs", sub: "Full parametric data" },
            { icon: Truck, label: "MENA-wide delivery", sub: "Egypt, GCC & Africa" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <f.icon className="w-7 h-7 text-[#0052CC] shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">{f.label}</div>
                <div className="text-slate-500 text-xs">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="bg-white rounded-lg border border-slate-200 p-5 hover:border-[#0052CC] hover:shadow-md transition-all"
            >
              <div className="font-semibold text-slate-900 text-sm">{c.name}</div>
              <div className="text-xs text-slate-500 mt-1">{c._count.products} products</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => (
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

      {/* Brands */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Top Brands</h2>
          <Link href="/brands" className="text-sm text-[#0052CC] font-medium flex items-center gap-1">
            All 50 brands <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}`}
              className="bg-white rounded-lg border border-slate-200 p-4 text-center hover:border-[#0052CC] transition-colors"
            >
              <div className="text-sm font-semibold text-slate-800">{b.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{b.country}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
