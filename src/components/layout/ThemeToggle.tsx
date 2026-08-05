"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useT } from "@/i18n/client";

export type ThemeChoice = "light" | "dark" | "system";
export const THEME_KEY = "autoparts-theme";

function resolve(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function apply(choice: ThemeChoice) {
  document.documentElement.setAttribute("data-theme", resolve(choice));
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch {
    /* private mode — the in-page choice still applies for this session */
  }
}

export default function ThemeToggle() {
  const { t } = useT();
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored: ThemeChoice = "system";
    try {
      const v = localStorage.getItem(THEME_KEY);
      if (v === "light" || v === "dark" || v === "system") stored = v;
    } catch {
      /* ignore */
    }
    setChoice(stored);
    setMounted(true);
  }, []);

  // Follow the OS while the user is on "system"
  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);

  const pick = (next: ThemeChoice) => {
    setChoice(next);
    apply(next);
  };

  const options: { key: ThemeChoice; Icon: typeof Sun; label: string }[] = [
    { key: "light", Icon: Sun, label: t("theme.light") },
    { key: "dark", Icon: Moon, label: t("theme.dark") },
    { key: "system", Icon: Monitor, label: t("theme.system") },
  ];

  return (
    <div
      role="group"
      aria-label={t("theme.label")}
      className="flex items-center gap-0.5 rounded-full border border-slate-300 bg-slate-50 p-0.5"
    >
      {options.map(({ key, Icon, label }) => {
        // Before mount every button renders unselected, so server and client
        // markup agree and hydration stays clean.
        const active = mounted && choice === key;
        return (
          <button
            key={key}
            onClick={() => pick(key)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              active
                ? "bg-[#0A6286] text-white"
                : "text-slate-500 hover:text-[#0A6286]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}
