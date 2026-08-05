import Link from "next/link";
import { ArrowRight, Cpu, Zap, Shield, Truck, FileText, Upload } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
import ControlPanelArt from "@/components/home/ControlPanelArt";
import Customers from "@/components/home/Customers";
import Testimonials from "@/components/home/Testimonials";
import { categoryIcon } from "@/lib/category-icons";
import { parseJsonArray } from "@/lib/utils";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { t } = await getT();
  const [categories, brands, featured, specCount] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }),
    prisma.brand.findMany({
      where: { isActive: true, products: { some: { isActive: true } } },
      orderBy: { products: { _count: "desc" } },
      take: 18,
    }),
    prisma.product.findMany({ where: { isFeatured: true, isActive: true }, take: 8, include: { brand: true } }),
    prisma.productSpec.count(),
  ]);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A6286] via-[#075E7A] to-[#063B54] text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs font-semibold tracking-wide uppercase bg-white/15 border border-white/25 rounded-full px-3 py-1">
              {t("home.hero.eyebrow")}
            </span>
            <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight">
              {t("home.hero.title")}
            </h1>
            <p className="mt-4 text-lg text-blue-100 max-w-xl">{t("home.hero.subtitle")}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/search" className="bg-[#07C89B] hover:bg-[#06B48C] text-[#0A2A38] font-semibold px-6 py-3 rounded-lg">
                {t("home.hero.searchCta")}
              </Link>
              <Link href="/quick-order" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/30">
                {t("home.hero.brandsCta")}
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md border-t border-white/20 pt-6">
              {[
                { v: `${brands.length >= 18 ? "50+" : brands.length}`, k: t("home.hero.stat1") },
                { v: String(categories.length), k: t("home.hero.stat2") },
                { v: specCount.toLocaleString("en-US"), k: t("home.hero.stat3") },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-2xl font-bold ltr-nums">{s.v}</dt>
                  <dd className="text-xs text-blue-200 mt-0.5">{s.k}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="hidden lg:block">
            <ControlPanelArt className="w-full h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          {[
            { icon: Shield, label: t("home.trust.authentic"), sub: t("home.trust.authenticSub") },
            { icon: Zap, label: t("home.trust.crossRef"), sub: t("home.trust.crossRefSub") },
            { icon: Cpu, label: t("home.trust.specs"), sub: t("home.trust.specsSub") },
            { icon: Truck, label: t("home.trust.delivery"), sub: t("home.trust.deliverySub") },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <f.icon className="w-7 h-7 text-[#0A6286] shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">{f.label}</div>
                <div className="text-slate-500 text-xs">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories with icons ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6">{t("home.categories.title")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((c) => {
            const Icon = categoryIcon(c.slug);
            return (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="group bg-white rounded-lg border border-slate-200 p-4 hover:border-[#0A6286] hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0A6286] flex items-center justify-center mb-3 group-hover:bg-[#0A6286] group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-900 text-sm leading-snug">{c.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {c._count.products} {t("home.products")}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">{t("home.featured.title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => (
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
        </section>
      )}

      {/* ── Customers ────────────────────────────────────────────────── */}
      <Customers />

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <Testimonials />

      {/* ── Brands ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">{t("home.brands.title")}</h2>
          <Link href="/brands" className="text-sm text-[#0A6286] font-medium flex items-center gap-1">
            {t("home.brands.all")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}`}
              className="bg-white rounded-lg border border-slate-200 px-3 py-4 text-center hover:border-[#0A6286] hover:shadow-sm transition-all"
            >
              <div className="text-sm font-bold text-slate-800 tracking-tight truncate" dir="ltr">
                {b.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{b.country}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <section className="surface-inverse">
        <div className="max-w-7xl mx-auto px-4 py-14 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold">{t("home.cta.title")}</h2>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">{t("home.cta.body")}</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link href="/cart" className="flex items-center gap-2 bg-[#07C89B] hover:bg-[#06B48C] text-[#0A2A38] font-semibold px-6 py-3 rounded-lg">
              <FileText className="w-4 h-4" /> {t("home.cta.primary")}
            </Link>
            <Link href="/projects" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-6 py-3 rounded-lg">
              <Upload className="w-4 h-4" /> {t("home.cta.secondary")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
