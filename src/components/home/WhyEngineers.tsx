import Link from "next/link";
import { FileText, GitCompareArrows, PackageSearch, ListChecks } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cachedStat } from "@/lib/stats-cache";
import snapshot from "@/content/catalog-snapshot.json";
import { getT } from "@/i18n/server";

/**
 * Stands where the testimonials were.
 *
 * The testimonials are still placeholder text, and inventing quotes to fill
 * the gap would be false advertising — so this makes the same argument out of
 * things that are actually true and checkable. Every number below is counted
 * from the catalogue at request time rather than typed in, so it cannot drift
 * into being a false claim as the data changes.
 *
 * Counts degrade to null rather than throwing: this sits on the home page, and
 * a database blip should cost a statistic, not the whole page.
 */
async function getFacts() {
  try {
    // Five whole-table counts. Uncached, this block alone examined ~15,300 rows
    // every time the home page rendered, and `specs` repeated the same
    // ProductSpec scan page.tsx had just done. Sharing the cache keys with
    // page.tsx collapses both to one scan per key per hour — the counts change
    // on catalogue import, which is weekly at best.
    const [products, brands, specs, datasheets, crossRefs] = await Promise.all([
      cachedStat(
        "stats.activeProductCount",
        () => prisma.product.count({ where: { isActive: true } }),
        { fallback: snapshot.stats.activeProductCount }
      ),
      cachedStat(
        "stats.activeBrandCount",
        () => prisma.brand.count({ where: { isActive: true, products: { some: { isActive: true } } } }),
        { fallback: snapshot.stats.activeBrandCount }
      ),
      cachedStat("stats.specCount", () => prisma.productSpec.count(), {
        fallback: snapshot.stats.specCount,
      }),
      cachedStat(
        "stats.datasheetCount",
        () => prisma.product.count({ where: { isActive: true, NOT: { datasheetUrl: null } } }),
        { fallback: snapshot.stats.datasheetCount }
      ),
      cachedStat("stats.crossRefCount", () => prisma.crossReference.count(), {
        fallback: snapshot.stats.crossRefCount,
      }),
    ]);
    return { products, brands, specs, datasheets, crossRefs };
  } catch {
    return null;
  }
}

const fmt = (n: number) => n.toLocaleString("en-US");

export default async function WhyEngineers() {
  const { t } = await getT();
  const f = await getFacts();

  const cards = [
    {
      Icon: FileText,
      title: t("home.why.specs.title"),
      body: f
        ? t("home.why.specs.body")
            .replace("{specs}", fmt(f.specs))
            .replace("{products}", fmt(f.products))
        : t("home.why.specs.bodyPlain"),
      href: "/search",
    },
    {
      Icon: ListChecks,
      title: t("home.why.datasheets.title"),
      body: f
        ? t("home.why.datasheets.body").replace("{datasheets}", fmt(f.datasheets))
        : t("home.why.datasheets.bodyPlain"),
      href: "/brands",
    },
    {
      Icon: GitCompareArrows,
      title: t("home.why.crossref.title"),
      body: t("home.why.crossref.body"),
      href: "/quick-order",
    },
    {
      Icon: PackageSearch,
      title: t("home.why.sourcing.title"),
      body: t("home.why.sourcing.body"),
      href: "/inquiry",
    },
  ];

  return (
    <section className="bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-900">{t("home.why.title")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("home.why.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ Icon, title, body, href }) => (
            <Link
              key={title}
              href={href}
              className="group bg-slate-50 border border-slate-200 rounded-lg p-5 hover:border-[#07858F] transition-colors"
            >
              <Icon className="w-6 h-6 text-[#0A6286] mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#0A6286]">
                {title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-1.5">{body}</p>
            </Link>
          ))}
        </div>

        {f && (
          <p className="text-center text-xs text-slate-400 mt-6 ltr-nums">
            {t("home.why.footnote")
              .replace("{products}", fmt(f.products))
              .replace("{brands}", fmt(f.brands))}
          </p>
        )}
      </div>
    </section>
  );
}
