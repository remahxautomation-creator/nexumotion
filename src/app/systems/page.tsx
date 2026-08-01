import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { systems } from "@/content/systems";
import { getT, getLocale } from "@/i18n/server";
import InquiryForm from "@/components/systems/InquiryForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("systems.title"), description: t("systems.lead") };
}

export default async function SystemsPage() {
  const { t } = await getT();
  const locale = await getLocale();

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
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight max-w-3xl">
            {t("systems.title")}
          </h1>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl">{t("systems.lead")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#enquire" className="bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg">
              {t("systems.discussCta")}
            </a>
            <Link href="/search" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/30">
              {t("home.hero.searchCta")}
            </Link>
          </div>
        </div>
      </section>

      {/* Systems grid */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systems.map((s) => {
            const copy = locale === "ar" ? s.ar : s.en;
            const Icon = (Icons[s.icon as keyof typeof Icons] ?? Icons.Package) as Icons.LucideIcon;
            return (
              <Link
                key={s.slug}
                href={`/systems/${s.slug}`}
                className="group bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-all flex flex-col"
                style={{ borderTopWidth: 3, borderTopColor: s.accent }}
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-3 transition-colors"
                  style={{ backgroundColor: `${s.accent}14`, color: s.accent }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900 text-sm leading-snug">{copy.name}</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed flex-1">{copy.tagline}</p>
                <span className="mt-4 text-xs font-semibold flex items-center gap-1" style={{ color: s.accent }}>
                  {t("systems.learnMore")}
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquire" className="bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <InquiryForm />
        </div>
      </section>
    </div>
  );
}
