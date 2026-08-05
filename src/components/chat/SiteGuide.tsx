"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { useT } from "@/i18n/client";
import { guideTopics, guideFallback } from "@/content/site-guide";

type Msg = {
  role: "bot" | "user";
  text: string;
  links?: { label: string; href: string }[];
};

// Intent matching runs entirely client-side against the knowledge base — no
// network call, no model, so it cannot invent an answer. Technical product
// questions are handed off to /assistant, which queries the database.
function matchTopic(input: string, locale: "en" | "ar") {
  const lower = input.toLowerCase();
  let best: { score: number; topic: (typeof guideTopics)[number] } | null = null;

  for (const topic of guideTopics) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (lower.includes(kw.toLowerCase())) score += kw.length; // longer match wins
    }
    if (score > 0 && (!best || score > best.score)) best = { score, topic };
  }

  if (!best) return guideFallback[locale];
  return best.topic[locale];
}

export default function SiteGuide() {
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const lang: "en" | "ar" = locale === "ar" ? "ar" : "en";

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{ role: "bot", text: t("guide.welcome") }]);
    }
  }, [open, msgs.length, t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, open]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setInput("");
    const answer = matchTopic(q, lang);
    setMsgs((m) => [
      ...m,
      { role: "user", text: q },
      { role: "bot", text: answer.reply, links: answer.links },
    ]);
  };

  return (
    <>
      {/* Launcher — left side */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("guide.title")}
        className="fixed bottom-5 start-5 z-40 flex items-center gap-2 bg-[#0A6286] hover:bg-[#084A66] text-white rounded-full shadow-lg ps-4 pe-5 py-3 transition-transform hover:scale-105"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        <span className="text-sm font-semibold hidden sm:inline">{t("guide.launcher")}</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 start-5 z-40 w-[min(22rem,calc(100vw-2.5rem))] bg-white rounded-xl border border-slate-200 shadow-2xl flex flex-col max-h-[min(30rem,calc(100vh-8rem))]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
            <div className="w-8 h-8 rounded-full bg-[#0A6286] text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900">{t("guide.title")}</div>
              <div className="text-[11px] text-slate-500 truncate">{t("guide.subtitle")}</div>
            </div>
            <button onClick={() => setOpen(false)} className="ms-auto text-slate-400 hover:text-slate-700" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div
                  className={
                    m.role === "user"
                      ? "bg-[#0A6286] text-white rounded-lg rounded-se-sm px-3 py-2 text-sm max-w-[85%]"
                      : "bg-slate-100 text-slate-700 rounded-lg rounded-ss-sm px-3 py-2 text-sm max-w-[92%]"
                  }
                >
                  {m.text}
                  {m.links && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="text-xs font-medium bg-white border border-slate-300 rounded-full px-2.5 py-1 text-[#0A6286] hover:border-[#0A6286]"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {msgs.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {guideTopics.slice(0, 5).map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => send(topic[lang].label)}
                    className="text-xs border border-slate-300 rounded-full px-2.5 py-1 text-slate-600 hover:border-[#0A6286] hover:text-[#0A6286]"
                  >
                    {topic[lang].label}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-100 p-2">
            <Link
              href="/assistant"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 justify-center text-xs font-semibold text-[#0A6286] mb-2 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> {t("guide.toAssistant")}
            </Link>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-1.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("guide.placeholder")}
                className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6286]/40"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-[#0A6286] text-white rounded-md px-3 disabled:opacity-40"
                aria-label={t("assistant.send")}
              >
                <Send className="w-4 h-4 rtl:scale-x-[-1]" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
