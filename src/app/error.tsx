"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCw, PackageSearch, Home } from "lucide-react";
import { useT } from "@/i18n/client";

/**
 * What a visitor sees when a page fails to render.
 *
 * There was no error boundary at all before this, which is why a single failed
 * query produced the raw Next.js error shell — a blank page with no branding,
 * no explanation and no way forward. When D1's read limit was hit, that is what
 * every catalogue page showed, including the pages paid ads were pointing at.
 *
 * The catalogue is the part that depends on the database; sourcing a part does
 * not. So the most useful thing this page can do is send someone to the inquiry
 * form, which needs no database and still captures the lead. That turns an
 * outage from a lost visitor into a request in the inbox.
 *
 * Bilingual through the same dictionary as the rest of the site — an Arabic
 * visitor hitting an error should not suddenly be addressed in English.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useT();

  useEffect(() => {
    // Goes to the Worker log, where the digest can be matched to the stack
    // trace Cloudflare records. The message itself is never shown to the
    // visitor: it can carry query text and internal identifiers.
    console.error(`[error-boundary] ${error.digest ?? "no-digest"}: ${error.message}`);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-600 mb-5">
        <AlertTriangle className="w-7 h-7" aria-hidden />
      </div>

      <h1 className="text-2xl font-bold text-slate-900">{t("error.title")}</h1>
      <p className="mt-3 text-slate-600 leading-relaxed">{t("error.body")}</p>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link
          href="/inquiry"
          className="inline-flex items-center gap-2 bg-[#07C89B] hover:bg-[#06B48C] text-[#0A2A38] font-semibold px-5 py-3 rounded-lg transition-colors"
        >
          <PackageSearch className="w-4 h-4" aria-hidden />
          {t("error.inquiryCta")}
        </Link>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold px-5 py-3 rounded-lg transition-colors"
        >
          <RotateCw className="w-4 h-4" aria-hidden />
          {t("error.retry")}
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium px-4 py-3"
        >
          <Home className="w-4 h-4" aria-hidden />
          {t("error.home")}
        </Link>
      </div>

      <p className="mt-10 text-sm text-slate-500">
        {t("error.contact")}{" "}
        <a href="tel:+201559404399" dir="ltr" className="text-[#0A6286] font-medium">
          +20 15 59404399
        </a>{" "}
        ·{" "}
        <a href="mailto:technical@nexumotion.com" dir="ltr" className="text-[#0A6286] font-medium">
          technical@nexumotion.com
        </a>
      </p>
    </div>
  );
}
