"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useT } from "@/i18n/client";

export default function LanguageSwitcher() {
  const { t, locale } = useT();
  const router = useRouter();

  const switchTo = locale === "ar" ? "en" : "ar";

  const change = async () => {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: switchTo }),
    });
    router.refresh();
  };

  return (
    <button
      onClick={change}
      lang={switchTo}
      aria-label={switchTo === "ar" ? "التبديل إلى العربية" : "Switch to English"}
      className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium text-slate-700 hover:text-[#0A6286]"
    >
      <Languages className="w-4 h-4" />
      <span className="hidden sm:inline">{t("lang.switch")}</span>
    </button>
  );
}
