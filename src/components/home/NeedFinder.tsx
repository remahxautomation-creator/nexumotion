"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Send, CheckCircle2, UserPlus, ArrowRight } from "lucide-react";
import { useT } from "@/i18n/client";
import { formatPrice } from "@/lib/utils";
import { contact } from "@/content/site-content";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

type Match = { sku: string; name: string; slug: string; brand: string; price: number };
type Stage = "describe" | "questions" | "result" | "sent" | "limit";

const GUEST_USED = "nm_need_request_sent";
const QUESTIONS = [
  { q: "need.q1", hint: "need.q1hint" },
  { q: "need.q2", hint: "need.q2hint" },
  { q: "need.q3", hint: "need.q3hint" },
] as const;

const usedBefore = () => {
  try { return localStorage.getItem(GUEST_USED) === "1"; } catch { return false; }
};

/**
 * Home page sourcing assistant.
 *
 * Asks at most three questions, all skippable, because a buyer with a burnt
 * drive and a nameplate photo should not fill in a form to be helped. The
 * answers are folded into one query for the catalogue search (/api/assistant),
 * so matching parts show up front; whatever the search finds, the request can
 * still go to the engineers, which is the point for parts we do not list.
 *
 * Guests can send one request, then are asked to register. The server enforces
 * that (see /api/need-request); localStorage only saves a guest from filling in
 * the form before being told.
 */
export default function NeedFinder({ signedIn, userName }: { signedIn: boolean; userName?: string | null }) {
  const { t } = useT();
  const [stage, setStage] = useState<Stage>("describe");
  const [need, setNeed] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const start = () => {
    if (need.trim().length < 5) return;
    if (!signedIn && usedBefore()) { setStage("limit"); return; }
    setStage("questions");
  };

  const answer = async (value: string) => {
    const next = [...answers, value.trim()];
    setAnswers(next);
    setDraft("");
    if (next.length < QUESTIONS.length) return;

    setStage("result");
    const query = [need, ...next.slice(0, 2)].filter(Boolean).join(", ").slice(0, 500);
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }).catch(() => null);
    const data = res?.ok ? await res.json().catch(() => null) : null;
    setMatches((data?.products ?? []).slice(0, 6));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/need-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        need, answers,
        matches: (matches ?? []).map((m) => `${m.brand} ${m.sku}`),
        ...form,
      }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (res?.ok) {
      if (!signedIn) try { localStorage.setItem(GUEST_USED, "1"); } catch {}
      setStage("sent");
    } else if (data.signupRequired) {
      setStage("limit");
    } else {
      setError(data.error && data.error !== "signup_required" ? data.error : t("need.error"));
    }
  };

  // The same request as a WhatsApp message to the business number. The site
  // cannot send WhatsApp itself without the paid Business API, so the buyer
  // sends it: one tap, and the chat opens directly with the person who asked.
  const whatsAppRequest = () => {
    const labels = ["Brand / part number", "Key ratings", "Quantity / timing"];
    const text = [
      "Part request from nexumotion.com",
      "",
      `Need: ${need}`,
      ...answers.map((a, i) => `${labels[i]}: ${a || "not sure"}`),
      "",
      signedIn ? userName ?? "" : [form.name, form.company, form.email, form.phone].filter(Boolean).join(" · "),
    ].join("\n");
    return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  const restart = () => {
    setNeed(""); setAnswers([]); setDraft(""); setMatches(null); setError("");
    setStage(!signedIn && usedBefore() ? "limit" : "describe");
  };

  const input = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#07858F] bg-white";
  const primary = "inline-flex items-center justify-center gap-2 bg-[#0A6286] hover:bg-[#084F6C] text-white font-semibold text-sm px-5 py-2.5 rounded-lg disabled:opacity-50";

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-6">
      {stage === "describe" && (
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); start(); } }}
            placeholder={t("need.placeholder")}
            rows={2}
            maxLength={1000}
            className={`${input} resize-none flex-1`}
          />
          <button onClick={start} disabled={need.trim().length < 5} className={`${primary} sm:self-stretch`}>
            <Sparkles className="w-4 h-4" /> {t("need.start")}
          </button>
        </div>
      )}

      {stage !== "describe" && stage !== "limit" && (
        <div className="space-y-3 text-sm">
          <div className="ms-auto max-w-[85%] w-fit bg-[#0A6286] text-white rounded-2xl rounded-ee-sm px-4 py-2">{need}</div>
          {answers.map((a, i) => (
            <div key={i} className="space-y-3">
              <div className="max-w-[85%] w-fit bg-slate-100 text-slate-800 rounded-2xl rounded-es-sm px-4 py-2">{t(QUESTIONS[i].q)}</div>
              <div className="ms-auto max-w-[85%] w-fit bg-[#0A6286]/10 text-slate-800 rounded-2xl rounded-ee-sm px-4 py-2">
                {a || <span className="text-slate-500">{t("need.skip")}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {stage === "questions" && (
        <div className="mt-3 space-y-2">
          <div className="max-w-[85%] w-fit bg-slate-100 text-slate-800 rounded-2xl rounded-es-sm px-4 py-2 text-sm">
            <div className="text-[11px] text-slate-500 mb-0.5">
              {t("need.step")} {answers.length + 1} {t("need.of")} {QUESTIONS.length}
            </div>
            {t(QUESTIONS[answers.length].q)}
          </div>
          <div className="text-xs text-slate-500">{t(QUESTIONS[answers.length].hint)}</div>
          <form onSubmit={(e) => { e.preventDefault(); answer(draft); }} className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={300} autoFocus className={input} />
            <button type="button" onClick={() => answer("")} className="text-sm text-slate-600 border border-slate-300 rounded-lg px-3 whitespace-nowrap hover:bg-slate-50">
              {t("need.skip")}
            </button>
            <button type="submit" className={primary} aria-label={t("need.next")}>
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      )}

      {stage === "result" && (
        <div className="mt-5 grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">{t("need.matches")}</h3>
            {matches === null ? (
              <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> {t("assistant.searching")}</div>
            ) : matches.length === 0 ? (
              <p className="text-sm text-slate-500">{t("need.noMatches")}</p>
            ) : (
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {matches.map((m) => (
                  <li key={m.sku}>
                    <Link href={`/products/${m.slug}`} className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-slate-50">
                      <span className="min-w-0">
                        <span className="sku text-xs text-slate-500 block">{m.brand} · {m.sku}</span>
                        <span className="text-sm text-slate-800 line-clamp-1">{m.name}</span>
                      </span>
                      <span className="text-sm font-semibold text-slate-900 ltr-nums shrink-0">{formatPrice(m.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={submit} className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">{t("need.formTitle")}</h3>
            <p className="text-xs text-slate-500">{t("need.formLead")}</p>
            {signedIn ? (
              <p className="text-sm text-slate-700">{userName}</p>
            ) : (
              <>
                <input required placeholder={t("need.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} maxLength={120} />
                <input required type="email" placeholder={t("need.email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} maxLength={200} dir="ltr" />
              </>
            )}
            <input required={!signedIn} type="tel" placeholder={t("need.phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} maxLength={40} dir="ltr" />
            {!signedIn && (
              <input placeholder={t("need.company")} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={input} maxLength={120} />
            )}
            {/* Honeypot: hidden from people, filled by bots. */}
            <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className={`${primary} w-full`}>
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("need.sending")}</> : <><Send className="w-4 h-4 rtl:rotate-180" /> {t("need.submit")}</>}
            </button>
          </form>
        </div>
      )}

      {stage === "sent" && (
        <div className="mt-5 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold text-slate-900">{t("need.sent")}</div>
            <p className="text-slate-600 mt-0.5">{t("need.sentBody")}</p>
            <a
              href={whatsAppRequest()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white font-semibold text-sm px-4 py-2 rounded-lg"
            >
              <WhatsAppIcon className="w-4 h-4" /> {t("need.whatsapp")}
            </a>
            <br />
            <button onClick={restart} className="text-[#0A6286] font-medium mt-2 inline-flex items-center gap-1">
              {t("need.restart")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}

      {stage === "limit" && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <UserPlus className="w-8 h-8 text-[#0A6286] shrink-0" />
          <div className="flex-1 text-sm">
            <div className="font-semibold text-slate-900">{t("need.limitTitle")}</div>
            <p className="text-slate-600 mt-0.5">{t("need.limitBody")}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/register?callbackUrl=/%23assistant" className={primary}>{t("need.signup")}</Link>
            <Link href="/login?callbackUrl=/%23assistant" className="inline-flex items-center text-sm font-semibold text-[#0A6286] border border-[#0A6286]/30 rounded-lg px-4 py-2.5">
              {t("need.login")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
