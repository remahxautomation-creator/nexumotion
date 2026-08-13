import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { featuredBrands } from "@/content/site-content";
import { getT } from "@/i18n/server";

/**
 * The manufacturers we stock, on the home page.
 *
 * Replaces a grid of the top 18 brands by product count. That ordering put
 * whichever brand happened to import most lines at the front, which is an
 * artefact of the source data rather than a statement about the business; the
 * list is now curated in site-content.ts.
 *
 * Every entry is checked against the catalogue before rendering. Two of the
 * supplied brands — Pepperl+Fuchs and Mitsubishi Electric — have no live
 * products, and a logo linking to an empty page is worse than an absent logo,
 * so they drop out automatically and reappear the moment they are stocked.
 *
 * Logos render when a file is present and fall back to a wordmark otherwise,
 * so the section is useful before any asset work and improves without a code
 * change. Grayscale until hover keeps thirty-odd competing brand palettes from
 * fighting the page.
 */
export default async function BrandWall() {
  const { t } = await getT();

  const slugs = featuredBrands.map((b) => b.slug);

  const rows = await prisma.brand.findMany({
    where: {
      slug: { in: slugs },
      isActive: true,
      // The gate that stops dead links.
      products: { some: { isActive: true } },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      country: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  if (!rows.length) return null;

  // Preserve the curated order; the database returns whatever order it likes.
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const ordered = featuredBrands
    .map((f) => {
      const row = bySlug.get(f.slug);
      return row ? { ...row, logo: f.logo } : null;
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t("home.brands.title")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("home.brands.subtitle")}</p>
        </div>
        <Link
          href="/brands"
          className="text-sm text-[#0A6286] font-medium flex items-center gap-1 shrink-0"
        >
          {t("home.brands.all")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>

      {/* Six across on desktop rather than four. This sits directly under the
          hero now, and thirty-odd brands in a four-column grid pushed the
          categories and products most visitors came for below the fold. */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
        {ordered.map((b) => (
          <Link
            key={b.id}
            href={`/brands/${b.slug}`}
            className="group bg-white border border-slate-200 rounded-lg h-20 px-3
                       flex flex-col items-center justify-center gap-1
                       hover:border-[#07858F] hover:shadow-sm transition-all"
          >
            {b.logo ? (
              <Image
                src={b.logo}
                alt={b.name}
                width={160}
                height={44}
                unoptimized
                // max-w-full matters as much as max-h here: these logos vary
                // from square to 5:1, and the wide ones overrun a three-column
                // card on a phone without it.
                className="max-h-9 max-w-full w-auto object-contain grayscale opacity-70
                           group-hover:grayscale-0 group-hover:opacity-100 transition-all"
              />
            ) : (
              <span
                dir="ltr"
                className="text-[13px] font-bold text-slate-700 tracking-tight text-center leading-tight line-clamp-2
                           group-hover:text-[#0A6286] transition-colors"
              >
                {b.name}
              </span>
            )}
            <span className="text-[10px] text-slate-400 ltr-nums">
              {b._count.products} {t("home.products")}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
