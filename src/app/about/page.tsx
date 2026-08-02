import Link from "next/link";
import {
  Cpu, ShieldCheck, Unlock, Globe2, Replace, FileSpreadsheet, Receipt, Headset,
} from "lucide-react";
import ControlPanelArt from "@/components/home/ControlPanelArt";
import { companyFacts } from "@/content/site-content";
import { getT } from "@/i18n/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("about.title"), description: t("about.lead") };
}

export default async function AboutPage() {
  const { t } = await getT();
  const [brandCount, categoryCount] = await Promise.all([
    prisma.brand.count(),
    prisma.category.count(),
  ]);

  const values = [
    { icon: Cpu, title: t("about.values.specs"), body: t("about.values.specsBody") },
    { icon: ShieldCheck, title: t("about.values.genuine"), body: t("about.values.genuineBody") },
    { icon: Unlock, title: t("about.values.open"), body: t("about.values.openBody") },
    { icon: Globe2, title: t("about.values.regional"), body: t("about.values.regionalBody") },
  ];

  const capabilities = [
    { icon: Replace, title: t("about.cap1"), body: t("about.cap1Body") },
    { icon: FileSpreadsheet, title: t("about.cap2"), body: t("about.cap2Body") },
    { icon: Receipt, title: t("about.cap3"), body: t("about.cap3Body") },
    { icon: Headset, title: t("about.cap4"), body: t("about.cap4Body") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-[#00317a] text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{t("about.title")}</h1>
            <p className="mt-4 text-lg text-blue-100 max-w-xl">{t("about.lead")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/search" className="bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg">
                {t("home.hero.searchCta")}
              </Link>
              <Link href="/brands" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/30">
                {t("home.hero.brandsCta")}
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <ControlPanelArt className="w-full h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Facts strip */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          {[
            { k: t("about.founded"), v: companyFacts.foundedYear },
            { k: t("about.based"), v: `${companyFacts.city}, ${companyFacts.country}` },
            { k: t("about.brands"), v: String(brandCount) },
            { k: t("about.serving"), v: companyFacts.regionsServed },
          ].map((f) => (
            <div key={f.k}>
              <div className="text-xs text-slate-500">{f.k}</div>
              <div className="font-bold text-slate-900 mt-0.5">{f.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{t("about.story.title")}</h2>
        <p className="text-slate-600 leading-relaxed">{t("about.story.p1")}</p>
        <p className="text-slate-600 leading-relaxed mt-4">{t("about.story.p2")}</p>
      </section>

      {/* Values */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v) => (
            <div key={v.title} className="flex gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center shrink-0">
                <v.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{v.title}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-xl font-bold text-slate-900 mb-6">{t("about.capabilities.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((c) => (
            <div key={c.title} className="bg-white rounded-lg border border-slate-200 p-5">
              <c.icon className="w-6 h-6 text-[#0052CC] mb-3" />
              <h3 className="font-semibold text-slate-900 text-sm">{c.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-sm text-slate-500">
          {categoryCount} {t("home.categories.title").toLowerCase()} ·{" "}
          <Link href="/brands" className="text-[#0052CC] font-medium">{t("home.brands.all")}</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="surface-inverse">
        <div className="max-w-7xl mx-auto px-4 py-14 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold">{t("home.cta.title")}</h2>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">{t("home.cta.body")}</p>
          </div>
          <Link href="/cart" className="bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg shrink-0">
            {t("home.cta.primary")}
          </Link>
        </div>
      </section>
    </div>
  );
}
