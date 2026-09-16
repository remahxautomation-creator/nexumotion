import Link from "next/link";
import type { LegalDoc } from "@/content/legal";
import { LEGAL_UPDATED } from "@/content/legal";

/** Plain, readable rendering of a legal document. Both /privacy and /terms use it. */
export default function LegalDocument({
  doc,
  locale,
  updatedLabel,
  otherHref,
  otherLabel,
}: {
  doc: LegalDoc;
  locale: "en" | "ar";
  updatedLabel: string;
  otherHref: string;
  otherLabel: string;
}) {
  const updated = new Date(LEGAL_UPDATED).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{doc.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {updatedLabel}: {updated} ·{" "}
          <Link href={otherHref} className="text-[#0A6286] hover:underline">
            {otherLabel}
          </Link>
        </p>
        <p className="mt-6 text-slate-700 leading-relaxed">{doc.intro}</p>

        {doc.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 text-slate-700 leading-relaxed">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-3 list-disc ps-6 space-y-2 text-slate-700 leading-relaxed">
                {s.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
