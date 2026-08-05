"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Menu, ChevronDown, User, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import SearchAutocomplete from "@/components/search/SearchAutocomplete";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeToggle from "@/components/layout/ThemeToggle";
import Logo from "@/components/layout/Logo";
import { useT } from "@/i18n/client";

type Cat = { id: string; name: string; slug: string };

export default function Header({ categories }: { categories: Cat[] }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const { t } = useT();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          <Link href="/" className="flex items-center shrink-0" aria-label="NexuMotion — home">
            <Logo className="h-11 w-auto" priority />
          </Link>

          <div className="flex-1 max-w-2xl hidden md:flex">
            <SearchAutocomplete />
          </div>

          <nav className="flex items-center gap-1 ms-auto">
            <Link href="/assistant" className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#0A6286] hover:text-[#084A66]">
              <Sparkles className="w-4 h-4" /> {t("nav.assistant")}
            </Link>
            <Link href="/systems" className="hidden lg:block px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0A6286]">
              {t("nav.systems")}
            </Link>
            <Link href="/about" className="hidden lg:block px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0A6286]">
              {t("nav.about")}
            </Link>
            <Link href="/brands" className="hidden lg:block px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0A6286]">
              {t("nav.brands")}
            </Link>
            <Link href="/quick-order" className="hidden lg:block px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0A6286]">
              {t("nav.quickOrder")}
            </Link>
            <ThemeToggle />
            <LanguageSwitcher />
            <Link href="/account" className="p-2 text-slate-700 hover:text-[#0A6286]" aria-label={t("nav.account")}>
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="relative p-2 text-slate-700 hover:text-[#0A6286]" aria-label={t("nav.cart")}>
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -end-0.5 bg-[#07C89B] text-[#0A2A38] text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 h-11 -mx-1">
          <button
            onMouseEnter={() => setMegaOpen(true)}
            onClick={() => setMegaOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-[#0A6286] rounded-md hover:bg-[#084A66]"
          >
            <Menu className="w-4 h-4" /> {t("nav.allCategories")} <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <div className="hidden md:flex gap-1 overflow-x-auto">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-[#0A6286] whitespace-nowrap"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {megaOpen && (
        <div
          onMouseLeave={() => setMegaOpen(false)}
          className="absolute inset-x-0 bg-white border-b border-slate-200 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                onClick={() => setMegaOpen(false)}
                className="px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-50 hover:text-[#0A6286]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
