"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Bookmark, Check } from "lucide-react";
import { useT } from "@/i18n/client";

export default function SaveSearchButton({ defaultName }: { defaultName: string }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  const { t } = useT();

  const save = async () => {
    const qs = sp.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    const name = prompt("Name this saved search:", defaultName);
    if (!name) return;
    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url }),
    });
    if (res.status === 401) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(url)}`;
      return;
    }
    setState(res.ok ? "saved" : "error");
    setTimeout(() => setState("idle"), 2000);
  };

  return (
    <button
      onClick={save}
      className="flex items-center gap-1.5 text-xs font-medium border border-slate-300 bg-white rounded-md px-3 py-1.5 text-slate-600 hover:text-[#0A6286] hover:border-[#0A6286]"
    >
      {state === "saved" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
      {state === "saved" ? t("filters.saved") : state === "error" ? "…" : t("filters.saveSearch")}
    </button>
  );
}
