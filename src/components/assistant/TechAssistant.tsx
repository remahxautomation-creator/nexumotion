"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Send, Package, Info } from "lucide-react";
import { useT } from "@/i18n/client";
import { formatPrice, STOCK_LABELS } from "@/lib/utils";

type Product = {
  id: string; sku: string; name: string; slug: string; brand: string;
  category: string; categorySlug: string; price: number; stockStatus: string; stockQty: number;
};

type Answer = {
  understood: string[];
  usedAi: boolean;
  relaxed: string[];
  crossRef: { competitorSku: string; count: number } | null;
  count: number;
  products: Product[];
  suggestions: { slug: string; name: string }[];
};

type Turn = { query: string; answer: Answer | null; error?: string };

export default function TechAssistant({ examples }: { examples: string[] }) {
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    setQuery("");
    setBusy(true);
    setTurns((prev) => [...prev, { query: question, answer: null }]);

    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: question }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setTurns((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (res.ok) last.answer = data;
      else last.error = data.error ?? t("assistant.failed");
      return next;
    });
  };

  return (
    <div className="flex flex-col">
      {/* Conversation */}
      <div className="space-y-6">
        {turns.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#0A6286]" />
              <h2 className="font-bold text-slate-900">{t("assistant.startTitle")}</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">{t("assistant.startBody")}</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((e) => (
                <button
                  key={e}
                  onClick={() => ask(e)}
                  className="text-xs text-start border border-slate-300 bg-slate-50 rounded-full px-3 py-1.5 hover:border-[#0A6286] hover:text-[#0A6286]"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, i) => (
          <div key={i} className="space-y-3">
            {/* Question */}
            <div className="flex justify-end">
              <div className="bg-[#0A6286] text-white rounded-lg rounded-se-sm px-4 py-2.5 text-sm max-w-2xl">
                {turn.query}
              </div>
            </div>

            {/* Answer */}
            {turn.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {turn.error}
              </div>
            )}

            {turn.answer && (
              <div className="bg-white border border-slate-200 rounded-lg rounded-ss-sm p-4">
                {/* What was understood */}
                {turn.answer.understood.length > 0 && (
                  <div className="flex items-start gap-2 mb-3 pb-3 border-b border-slate-100">
                    <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold">{t("assistant.understood")}</span>{" "}
                      {turn.answer.understood.map((u, j) => (
                        <span key={j} className="inline-block bg-slate-100 rounded px-1.5 py-0.5 me-1 mb-1">
                          {u}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {turn.answer.crossRef && (
                  <div className="text-sm bg-blue-50 border border-blue-200 text-blue-800 rounded-md px-3 py-2 mb-3">
                    {t("assistant.crossRef")} <span className="sku">{turn.answer.crossRef.competitorSku}</span>
                  </div>
                )}

                {turn.answer.relaxed.includes("specs") && (
                  <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2 mb-3">
                    {t("assistant.relaxedSpecs")}
                  </div>
                )}

                {turn.answer.count === 0 ? (
                  <div className="text-sm text-slate-600">
                    <p>{t("assistant.noResults")}</p>
                    {turn.answer.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {turn.answer.suggestions.map((s) => (
                          <Link
                            key={s.slug}
                            href={`/categories/${s.slug}`}
                            className="text-xs border border-slate-300 rounded-full px-3 py-1.5 hover:border-[#0A6286] hover:text-[#0A6286]"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    <Link
                      href="/systems#enquire"
                      className="inline-block mt-4 text-sm font-semibold text-[#0A6286] hover:underline"
                    >
                      {t("assistant.askUs")}
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="text-xs text-slate-500 mb-3">
                      {turn.answer.count} {t("assistant.matches")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {turn.answer.products.slice(0, 8).map((p) => {
                        const stock = STOCK_LABELS[p.stockStatus] ?? STOCK_LABELS.IN_STOCK;
                        return (
                          <Link
                            key={p.id}
                            href={`/products/${p.slug}`}
                            className="flex items-center gap-3 border border-slate-200 rounded-md p-2.5 hover:border-[#0A6286] transition-colors"
                          >
                            <div className="w-9 h-9 rounded bg-slate-50 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-slate-300" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="sku text-slate-600">{p.sku}</div>
                              <div className="text-xs text-slate-500 truncate">{p.name}</div>
                              <div className="text-[10px] text-slate-400">{p.brand} · {p.category}</div>
                            </div>
                            <div className="text-end shrink-0">
                              <div className="text-sm font-semibold ltr-nums">{formatPrice(p.price)}</div>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${stock.className}`}>
                                {t(stock.labelKey)}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> {t("assistant.searching")}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); ask(query); }}
        className="sticky bottom-4 mt-6 bg-white border border-slate-300 rounded-lg shadow-lg p-2 flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("assistant.placeholder")}
          className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-transparent"
        />
        <button
          type="submit"
          disabled={busy || !query.trim()}
          className="bg-[#0A6286] hover:bg-[#084A66] text-white font-semibold px-4 py-2.5 rounded-md text-sm disabled:opacity-40 flex items-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rtl:scale-x-[-1]" />}
          <span className="hidden sm:inline">{t("assistant.send")}</span>
        </button>
      </form>
    </div>
  );
}
