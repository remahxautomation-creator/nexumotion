import Link from "next/link";
import { notFound } from "next/navigation";
import * as Icons from "lucide-react";
import { CheckCircle2, ArrowRight, ClipboardList } from "lucide-react";
import { systems, getSystem } from "@/content/systems";
import { prisma } from "@/lib/prisma";
import { getT, getLocale } from "@/i18n/server";
import SystemDiagram from "@/components/systems/SystemDiagram";
import InquiryForm from "@/components/systems/InquiryForm";
import { categoryIcon } from "@/lib/category-icons";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return systems.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = getSystem(slug);
  if (!system) return { title: "Not found" };
  const locale = await getLocale();
  const copy = locale === "ar" ? system.ar : system.en;
  return {
    title: copy.name,
    description: copy.summary,
    alternates: { canonical: `/systems/${system.slug}` },
  };
}

export default async function SystemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = getSystem(slug);
  if (!system) notFound();

  const { t } = await getT();
  const locale = await getLocale();
  const copy = locale === "ar" ? system.ar : system.en;
  const Icon = (Icons[system.icon as keyof typeof Icons] ?? Icons.Package) as Icons.LucideIcon;

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { slug: { in: system.categorySlugs } },
      include: { _count: { select: { products: true } } },
    }),
    prisma.brand.findMany({ where: { name: { in: system.brands } } }),
  ]);

  const related = systems.filter((s) => s.slug !== system.slug).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: system.accent }}>
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-14">
          <nav className="text-xs text-white/70 mb-4 flex gap-1.5 flex-wrap">
            <Link href="/systems" className="hover:text-white">{t("systems.title")}</Link>
            <span>/</span>
            <span className="text-white">{copy.name}</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold leading-tight">{copy.name}</h1>
              <p className="mt-2 text-lg text-white/85">{copy.tagline}</p>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-white/90 leading-relaxed">{copy.summary}</p>
          <a
            href="#enquire"
            className="mt-8 inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-6 py-3 rounded-lg hover:bg-slate-100"
          >
            {t("systems.discussCta")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </a>
        </div>
      </section>

      {/* Explanation + diagram */}
      <section className="max-w-7xl mx-auto px-4 py-14 grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">{t("systems.whatItIs")}</h2>
          {copy.explanation.map((p, i) => (
            <p key={i} className="text-slate-600 leading-relaxed mb-4">{p}</p>
          ))}

          <h3 className="font-semibold text-slate-900 mt-8 mb-3">{t("systems.outcomes")}</h3>
          <ul className="space-y-2">
            {copy.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: system.accent }} />
                {o}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:sticky lg:top-32">
          <h2 className="text-xl font-bold text-slate-900 mb-4">{t("systems.architecture")}</h2>
          <div className="bg-white rounded-lg border border-slate-200 p-4 overflow-x-auto">
            <SystemDiagram layers={system.diagram} accent={system.accent} className="w-full h-auto min-w-[560px]" />
          </div>
          <p className="text-xs text-slate-400 mt-2">{t("systems.diagramNote")}</p>
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t("systems.requirements")}</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-2xl">{t("systems.requirementsLead")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {copy.requirements.map((group) => (
              <div key={group.title} className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                <h3 className="font-semibold text-slate-900 text-sm mb-3">{group.title}</h3>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: system.accent }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" style={{ color: system.accent }} />
          {t("systems.howTo")}
        </h2>
        <p className="text-sm text-slate-500 mb-8 max-w-2xl">{t("systems.howToLead")}</p>
        <ol className="relative border-s-2 border-slate-200 ms-4 space-y-8">
          {copy.howTo.map((step, i) => (
            <li key={step.title} className="ms-8">
              <span
                className="absolute -start-[17px] w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: system.accent }}
              >
                {i + 1}
              </span>
              <h3 className="font-semibold text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Parts for this system */}
      {(categories.length > 0 || brands.length > 0) && (
        <section className="bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-14">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{t("systems.partsFor")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((c) => {
                const CatIcon = categoryIcon(c.slug);
                return (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    className="bg-slate-50 rounded-lg border border-slate-200 p-4 hover:border-[#0052CC] transition-colors"
                  >
                    <CatIcon className="w-5 h-5 mb-2" style={{ color: system.accent }} />
                    <div className="font-semibold text-slate-900 text-sm leading-snug">{c.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {c._count.products} {t("home.products")}
                    </div>
                  </Link>
                );
              })}
            </div>

            {brands.length > 0 && (
              <>
                <h3 className="font-semibold text-slate-900 text-sm mt-8 mb-3">{t("systems.brandsFor")}</h3>
                <div className="flex flex-wrap gap-2">
                  {brands.map((b) => (
                    <Link
                      key={b.id}
                      href={`/brands/${b.slug}`}
                      className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 hover:border-[#0052CC] hover:text-[#0052CC]"
                      dir="ltr"
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Enquiry */}
      <section id="enquire" className="max-w-3xl mx-auto px-4 py-14">
        <InquiryForm systemSlug={system.slug} accent={system.accent} />
      </section>

      {/* Related systems */}
      <section className="surface-inverse">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-lg font-bold mb-5">{t("systems.related")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((r) => {
              const rc = locale === "ar" ? r.ar : r.en;
              return (
                <Link
                  key={r.slug}
                  href={`/systems/${r.slug}`}
                  className="bg-white/5 border border-white/15 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="font-semibold text-sm">{rc.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{rc.tagline}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
