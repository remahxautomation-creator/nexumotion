"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { useT } from "@/i18n/client";
import { contact } from "@/content/site-content";
import { trackLead } from "@/lib/analytics";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

/**
 * Lead capture on the home page.
 *
 * Deliberately not on every page. A buyer reading a datasheet has already said
 * what they want by being there, and interrupting that is how a supplier gets
 * closed rather than contacted. The home page is where someone arrives without
 * a part number — exactly the visitor this is for.
 *
 * It waits DELAY_MS rather than firing on load. Google counts an interstitial
 * that covers the content on arrival against the page on mobile, and the ads
 * land here, so the delay is the thing keeping this on the right side of that
 * line — shortening it further trades ranking for reach.
 *
 * It asks on every visit to the home page — the owner's call, made with the
 * trade stated: more leads, and repeat buyers see it every time they come
 * back. Closing it holds for that page view only.
 *
 * Submission goes to the existing /api/inquiries endpoint — the same
 * validation, honeypot, rate limiting, database record and email notification
 * the full inquiry page uses. A second endpoint would be a second set of rules
 * to keep in step.
 */

const DELAY_MS = 5_000;

export default function LeadPopup() {
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
    website: "",
  });
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Escape closes it. A modal that traps the visitor is worse than no modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
  }

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  /**
   * The same enquiry, written out as a WhatsApp message.
   *
   * The site cannot send a WhatsApp message on anyone's behalf — that needs
   * the WhatsApp Business API, which this account does not have. What it can
   * do is hand the visitor the message already composed, so reaching us there
   * is one tap rather than a retyping job. The email has already been sent by
   * this point, so nothing depends on their taking it.
   */
  const whatsAppHandoff = () => {
    const who = form.company ? `${form.name} (${form.company})` : form.name;
    const lines =
      locale === "ar"
        ? [`مرحباً، أنا ${who}.`, "", form.message, "", `البريد الإلكتروني: ${form.email}`]
        : [`Hello, I am ${who}.`, "", form.message, "", `Email: ${form.email}`];
    return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, kind: "UNLISTED" }),
    }).catch(() => null);
    setBusy(false);

    if (res?.ok) {
      setSent(true);
      // Same conversion the inquiry page fires, and only on a confirmed 200.
      trackLead({ listed: false });
    } else {
      const data = await res?.json().catch(() => ({}));
      setError(data?.error ?? t("inquiry.failed"));
    }
  };

  if (!open) return null;

  const input =
    "w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6286]/40";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/50"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-popup-title"
        // Keeps a click inside the card from reaching the backdrop handler.
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        <button
          ref={closeRef}
          onClick={close}
          aria-label={t("popup.close")}
          className="absolute top-3 end-3 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {sent ? (
          <div className="text-center py-2">
            <h2 id="lead-popup-title" className="text-lg font-bold text-slate-900">
              {t("inquiry.sentTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t("inquiry.sentBody")}</p>
            <a
              href={whatsAppHandoff()}
              target="_blank"
              rel="noopener noreferrer"
              data-contact="lead-popup"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold
                         py-2.5 bg-[#25D366] text-white hover:bg-[#1fb85a] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0" />
              {t("popup.alsoWhatsApp")}
            </a>
            <button
              onClick={close}
              className="mt-2 w-full rounded-md border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("popup.close")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <h2 id="lead-popup-title" className="text-lg font-bold text-slate-900 pe-6">
              {t("popup.title")}
            </h2>
            <p className="text-sm text-slate-600">{t("popup.subtitle")}</p>

            <div className="grid grid-cols-2 gap-3">
              <input
                className={input}
                value={form.name}
                onChange={set("name")}
                required
                placeholder={`${t("auth.fullName")} *`}
                aria-label={t("auth.fullName")}
              />
              <input
                className={input}
                value={form.company}
                onChange={set("company")}
                placeholder={t("inquiry.company")}
                aria-label={t("inquiry.company")}
              />
              <input
                className={input}
                type="email"
                value={form.email}
                onChange={set("email")}
                required
                dir="ltr"
                placeholder={`${t("auth.email")} *`}
                aria-label={t("auth.email")}
              />
              <input
                className={input}
                value={form.phone}
                onChange={set("phone")}
                dir="ltr"
                placeholder={t("checkout.phone")}
                aria-label={t("checkout.phone")}
              />
            </div>

            <textarea
              rows={3}
              className={input}
              value={form.message}
              onChange={set("message")}
              required
              minLength={10}
              placeholder={t("popup.messagePlaceholder")}
              aria-label={t("inquiry.message")}
            />

            {/* Honeypot — hidden from people, irresistible to bots. */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={set("website")}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-[#07C89B] hover:bg-[#06B48C]
                         disabled:opacity-60 text-[#0A2A38] font-semibold text-sm py-2.5 transition-colors"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {t("inquiry.submit")}
            </button>
            <p className="text-[11px] text-slate-400 text-center">{t("inquiry.privacyNote")}</p>
          </form>
        )}
      </div>
    </div>
  );
}
