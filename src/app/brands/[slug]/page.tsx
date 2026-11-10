import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
import { parseJsonArray } from "@/lib/utils";
import { mirrorBrand, mirrorBrandByCategory, type MirrorProduct } from "@/lib/catalog-mirror";
import ListingSchema from "@/components/seo/ListingSchema";
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
    // findFirst rather than findUnique so isActive can be part of the lookup.
    // Brands removed from the catalogue are soft-deleted, and without this a
    // removed brand still resolved from D1 and rendered as an empty page
    // instead of a 404.
    const brand = await prisma.brand.findFirst({
      where: { slug, isActive: true },
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

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexumotion.com";

/**
 * "<Brand> parts in Egypt" is the query a buyer types, so the title and
 * description name the brand, the country, the part count and the categories:
 * the same facts the page shows, in the order a search snippet shows them.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = await mirrorBrand(slug).catch(() => null);
  if (!brand) return {};
  const cats = (await mirrorBrandByCategory(slug, 0).catch(() => [])).map((c) => c.name);
  const name = brand.brand.name;
  const title = `${name} Parts in Egypt — ${brand.productCount} Part Numbers`;
  const description =
    `Buy genuine ${name} industrial automation parts from NexuMotion, Egypt` +
    (cats.length ? `: ${cats.slice(0, 4).join(", ").toLowerCase()}` : "") +
    `. ${brand.productCount} part numbers with prices, specifications and datasheets. Delivery across Egypt and the Middle East.`;
  const url = `${SITE}/brands/${slug}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "website" } };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getBrand(slug);
  if (!result) notFound();

  const { view, offline } = result;
  const sections = await mirrorBrandByCategory(slug).catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {offline && <OfflineCatalogueNotice />}
      <ListingSchema
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexumotion.com"}
        kind="brands" name={view.name} slug={slug}
        products={view.products} total={view.productCount}
      />

      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{view.name}</h1>
        <div className="text-sm text-slate-500 mt-1">
          {view.country} · {view.productCount} products
        </div>
        {view.description && (
          <p className="text-sm text-slate-600 mt-3 max-w-3xl">{view.description}</p>
        )}
      </div>

      {sections.length > 0 && (
        <nav aria-label={`${view.name} categories`} className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-3">{view.name} product categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {sections.map((c) => (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}?brand=${slug}`}
                className="group bg-white border border-slate-200 rounded-lg px-4 py-3
                           hover:border-[#07858F] hover:shadow-sm transition-all"
              >
                <div className="text-sm font-semibold text-slate-800 group-hover:text-[#0A6286]">{c.name}</div>
                <div className="text-xs text-slate-400 ltr-nums mt-0.5">{c.count} parts</div>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {sections.length > 0 ? (
        sections.map((c) => (
          <section key={c.slug} className="mb-10" aria-labelledby={`cat-${c.slug}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 id={`cat-${c.slug}`} className="text-lg font-bold text-slate-900">
                {view.name} {c.name}
              </h2>
              {c.count > c.products.length && (
                <Link
                  href={`/categories/${c.slug}?brand=${slug}`}
                  className="text-sm text-[#0A6286] font-medium flex items-center gap-1 shrink-0"
                >
                  All {c.count} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {c.products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </section>
        ))
      ) : view.products.length === 0 ? (
        <div className="text-slate-500 text-sm">No products listed yet for this brand.</div>
      ) : (
        // Database fallback: the mirror is unavailable, so no grouping.
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {view.products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
