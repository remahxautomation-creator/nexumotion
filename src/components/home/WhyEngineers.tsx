import Link from "next/link";
import { FileText, GitCompareArrows, PackageSearch, ListChecks } from "lucide-react";
import snapshot from "@/content/catalog-snapshot.json";
import { getT } from "@/i18n/server";

/**
 * Stands where the testimonials were.
 *
 * The testimonials are still placeholder text, and inventing quotes to fill
 * the gap would be false advertising — so this makes the same argument out of
 * things that are actually true and checkable. Every number below is counted
 * from the catalogue by `npm run mirror` rather than typed in, so it cannot
 * drift into being a false claim as the data changes.
 */

/**
 * Catalogue facts, from the published snapshot.
 *
 * Previously five whole-table counts through cachedStat() with the snapshot
 * as a fallback, which left D1 as the primary and — with a per-isolate cache —
 * had every isolate recomputing them hourly. `activeBrandCount` alone reads
 * ~120,000 rows per run and was 91% of all D1 reads. The snapshot holds exactly
 * these numbers; `npm run mirror` after an import is what refreshes them.
 */
function getFacts() {
  const s = snapshot.stats;
  return {
    products: s.activeProductCount,
    brands: s.activeBrandCount,
    specs: s.specCount,
    datasheets: s.datasheetCount,
    crossRefs: s.crossRefCount,
  };
}

const fmt = (n: number) => n.toLocaleString("en-US");

export default async function WhyEngineers() {
  const { t } = await getT();
  const f = getFacts();

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
