"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { useT } from "@/i18n/client";
import { readConsent, writeConsent, type ConsentValue } from "@/lib/consent";

/**
 * Cookie consent, asked once.
 *
 * A bar at the bottom rather than a modal over the page. Two reasons: this is
 * an ads landing page, and an interstitial that covers the content on arrival
 * is both a Quality Score penalty and the thing every buyer hates; and nothing
 * on the site is withheld pending an answer, so blocking the page would be
 * dishonest about what the choice actually affects.
 *
 * Both buttons are the same size and weight. A greyed-out "reject" next to a
 * bright "accept" is a dark pattern and, under GDPR, not valid consent at all.
 *
 * Nothing is tracked until this is answered: analytics and ad storage start
 * denied in the bootstrap script (see lib/consent.ts), so the first page view
 * of a new visitor writes no cookies either way.
 */
/**
 * Whether the bar is open, kept outside React.
 *
 * The answer lives in a cookie and can also be reopened from the footer on any
 * page, so it is external state in the precise sense useSyncExternalStore
 * exists for — and reading it in an effect would both flash the bar at
 * returning visitors and set state during the effect body.
 */
const REOPEN_EVENT = "nx:cookie-settings";
let reopened = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const open = () => {
    reopened = true;
    emit();
  };
  window.addEventListener(REOPEN_EVENT, open);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener(REOPEN_EVENT, open);
  };
}

const isOpen = () => reopened || readConsent() === null;

export default function CookieBanner() {
  const { t } = useT();
  // The server cannot know whether this browser has answered, so it renders
  // nothing and the real answer arrives on hydration.
  const show = useSyncExternalStore(subscribe, isOpen, () => false);

  if (!show) return null;

  const decide = (value: ConsentValue) => {
    writeConsent(value);
    reopened = false;
    emit();
  };

  return (
    <div
      role="dialog"
      aria-label={t("cookies.title")}
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div
        className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white shadow-2xl
                   p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <Cookie className="w-6 h-6 shrink-0 text-[#0A6286] hidden sm:block" aria-hidden />
        <div className="flex-1 text-sm text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900 block sm:inline">
            {t("cookies.title")}{" "}
          </span>
          {t("cookies.body")}{" "}
          <Link href="/privacy" className="text-[#0A6286] font-medium hover:underline">
            {t("footer.privacy")}
          </Link>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => decide("denied")}
            className="flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-semibold
                       border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t("cookies.reject")}
          </button>
          <button
            onClick={() => decide("granted")}
            className="flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-semibold
                       bg-[#0A6286] text-white hover:bg-[#08506e] transition-colors"
          >
            {t("cookies.accept")}
          </button>
        </div>
        <button
          onClick={() => decide("denied")}
          aria-label={t("cookies.reject")}
          className="absolute top-2 end-2 sm:static text-slate-400 hover:text-slate-600 sm:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Footer link that reopens the bar. Consent has to be as easy to withdraw as
 * it was to give, which means a way back to this choice from every page.
 */
export function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))}
      className="hover:text-white text-start"
    >
      {label}
    </button>
  );
}
