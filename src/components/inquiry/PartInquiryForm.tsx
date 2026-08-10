"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { useT } from "@/i18n/client";
import { trackLead } from "@/lib/analytics";

const COUNTRIES = [
  "Egypt", "Saudi Arabia", "UAE", "Kuwait", "Qatar", "Jordan", "Libya",
  "Sudan", "Nigeria", "Kenya", "Morocco", "Algeria", "Other",
];

/**
 * Sourcing request for a part we cannot ship from stock.
 *
 * Covers both cases with one form, because from the buyer's side they are the
 * same errand: a catalogue item on backorder and a part we have never listed
 * both end as "can you get me this, how much, and how long". When it is a
 * catalogue item the identifying fields arrive prefilled and locked to what
 * the page knows; otherwise they are the buyer's to fill in.
 *
 * The server decides the record's kind by resolving the SKU, so a locked field
 * here is a convenience rather than a trust boundary.
 */
export default function PartInquiryForm({
  sku = "",
  productName = "",
  manufacturer = "",
  locked = false,
}: {
  sku?: string;
  productName?: string;
  manufacturer?: string;
  locked?: boolean;
}) {
  const { t } = useT();
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "Egypt",
    manufacturer,
    partNumber: sku,
    quantity: "1",
    message: productName ? t("inquiry.part.prefill").replace("{part}", productName) : "",
    website: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        kind: "UNLISTED",
        // Only a catalogue page can assert a SKU; a free-form request sends
        // its part number and lets the server decide whether it matches one.
        sku: locked ? sku : form.partNumber,
      }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setSent(true);
      // Fired only on a confirmed 200. Firing on submit instead would count
      // validation failures and rate-limited bots as conversions, which is how
      // ad spend ends up optimised towards noise.
      trackLead({
        partNumber: locked ? sku : form.partNumber,
        manufacturer: form.manufacturer || undefined,
        quantity: Number(form.quantity) || undefined,
        listed: locked,
      });
    } else setError(data.error ?? t("inquiry.failed"));
  };

  const input =
    "w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6286]/40 disabled:bg-slate-100 disabled:text-slate-500";
  const label = "block text-xs font-semibold text-slate-600 mb-1";

  if (sent) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h3 className="font-bold text-slate-900 mb-1">{t("inquiry.sentTitle")}</h3>
        <p className="text-sm text-slate-600">{t("inquiry.part.sentBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={label} htmlFor="inq-mfr">{t("inquiry.part.manufacturer")}</label>
          <input
            id="inq-mfr"
            className={input}
            value={form.manufacturer}
            onChange={set("manufacturer")}
            disabled={locked && !!manufacturer}
            placeholder="Siemens"
            dir="ltr"
          />
        </div>
        <div>
          <label className={label} htmlFor="inq-pn">
            {t("inquiry.part.partNumber")} <span className="text-red-500">*</span>
          </label>
          <input
            id="inq-pn"
            className={`${input} sku`}
            value={form.partNumber}
            onChange={set("partNumber")}
            disabled={locked}
            required
            placeholder="6ES7214-1AG40-0XB0"
            dir="ltr"
          />
        </div>
        <div>
          <label className={label} htmlFor="inq-qty">{t("inquiry.part.quantity")}</label>
          <input
            id="inq-qty"
            type="number"
            min={1}
            className={input}
            value={form.quantity}
            onChange={set("quantity")}
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="inq-name">
            {t("auth.fullName")} <span className="text-red-500">*</span>
          </label>
          <input id="inq-name" className={input} value={form.name} onChange={set("name")} required />
        </div>
        <div>
          <label className={label} htmlFor="inq-company">{t("inquiry.company")}</label>
          <input id="inq-company" className={input} value={form.company} onChange={set("company")} />
        </div>
        <div>
          <label className={label} htmlFor="inq-email">
            {t("auth.email")} <span className="text-red-500">*</span>
          </label>
          <input id="inq-email" type="email" className={input} value={form.email} onChange={set("email")} required dir="ltr" />
        </div>
        <div>
          <label className={label} htmlFor="inq-phone">{t("checkout.phone")}</label>
          <input id="inq-phone" className={input} value={form.phone} onChange={set("phone")} dir="ltr" />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="inq-country">{t("checkout.country")}</label>
        <select id="inq-country" className={input} value={form.country} onChange={set("country")}>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="inq-msg">
          {t("inquiry.message")} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="inq-msg"
          rows={4}
          className={input}
          value={form.message}
          onChange={set("message")}
          required
          minLength={10}
          placeholder={t("inquiry.part.messagePlaceholder")}
        />
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute w-px h-px -left-[9999px] opacity-0"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#07C89B] hover:bg-[#06B48C] text-[#0A2A38] font-semibold px-6 py-3 rounded-lg disabled:opacity-60"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {t("inquiry.part.submit")}
      </button>
    </form>
  );
}
