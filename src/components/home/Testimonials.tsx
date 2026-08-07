import { Quote, AlertTriangle } from "lucide-react";
import { testimonials, testimonialsArePlaceholder } from "@/content/site-content";
import { getT } from "@/i18n/server";

export default async function Testimonials() {
  const { t } = await getT();

  // Renders nothing until the quotes are real.
  //
  // The alternative on a live storefront is either a visible "these are fake"
  // banner or, worse, invented quotes shown as genuine — which is false
  // advertising in Egypt, the EU and the US alike, and buyers act on it.
  // WhyEngineers stands in the same slot meanwhile, making the same case out
  // of facts counted from the catalogue.
  //
  // To publish: replace the examples in site-content.ts with quotes real
  // customers gave you and set testimonialsArePlaceholder = false. This
  // section then appears on its own — no code change needed.
  if (testimonialsArePlaceholder) return null;

  return (
    <section className="bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-900">{t("home.testimonials.title")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("home.testimonials.subtitle")}</p>
        </div>

        {testimonialsArePlaceholder && (
          <div className="mb-6 flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2 max-w-2xl mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Placeholder testimonials. Replace with quotes real customers gave you, with their
              permission, in <code>src/content/site-content.ts</code>. Invented testimonials are
              false advertising in Egypt, the EU and the US alike.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((tst, i) => (
            <figure
              key={i}
              className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col"
            >
              <Quote className="w-6 h-6 text-[#0A6286] opacity-40 mb-3 rtl:scale-x-[-1]" />
              <blockquote className="text-sm text-slate-700 leading-relaxed flex-1">
                {tst.quote}
              </blockquote>
              <figcaption className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-sm font-semibold text-slate-900">{tst.author}</div>
                <div className="text-xs text-slate-500">
                  {tst.role} · {tst.company}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
