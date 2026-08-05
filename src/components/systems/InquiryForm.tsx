"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { useT } from "@/i18n/client";

const COUNTRIES = [
  "Egypt", "Saudi Arabia", "UAE", "Kuwait", "Qatar", "Jordan", "Libya",
  "Sudan", "Nigeria", "Kenya", "Morocco", "Algeria", "Other",
];

export default function InquiryForm({
  systemSlug,
  accent = "#0A6286",
}: {
  systemSlug?: string;
  accent?: string;
}) {
  const { t } = useT();
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", country: "Egypt", message: "", website: "",
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
      body: JSON.stringify({ ...form, systemSlug }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) setSent(true);
    else setError(data.error ?? t("inquiry.failed"));
  };

  const input =
    "w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6286]/40";

  if (sent) {
    return (
      <div className="bg-white rounded-lg border border-emerald-200 p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h3 className="font-bold text-slate-900">{t("inquiry.sentTitle")}</h3>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">{t("inquiry.sentBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
      <div>
        <h3 className="font-bold text-slate-900">{t("inquiry.title")}</h3>
        <p className="text-sm text-slate-500 mt-1">{t("inquiry.subtitle")}</p>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("auth.fullName")} *</label>
          <input required value={form.name} onChange={set("name")} className={input} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("inquiry.company")}</label>
          <input value={form.company} onChange={set("company")} className={input} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("auth.email")} *</label>
          <input type="email" required value={form.email} onChange={set("email")} className={input} dir="ltr" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("checkout.phone")}</label>
          <input value={form.phone} onChange={set("phone")} className={input} placeholder="+20 1X XXX XXXX" dir="ltr" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("checkout.country")}</label>
          <select value={form.country} onChange={set("country")} className={input}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1">{t("inquiry.message")} *</label>
        <textarea
          required rows={4} minLength={10} value={form.message} onChange={set("message")}
          className={input} placeholder={t("inquiry.messagePlaceholder")}
        />
      </div>

      {/* Honeypot — hidden from users, filled by bots */}
      <input
        type="text" name="website" value={form.website} onChange={set("website")}
        tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="absolute w-px h-px -m-px overflow-hidden opacity-0 pointer-events-none"
      />

      <button
        type="submit" disabled={busy}
        style={{ backgroundColor: accent }}
        className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg text-sm disabled:opacity-60 hover:brightness-110 transition-all"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rtl:scale-x-[-1]" />}
        {t("inquiry.submit")}
      </button>
      <p className="text-[11px] text-slate-400 text-center">{t("inquiry.privacyNote")}</p>
    </form>
  );
}
