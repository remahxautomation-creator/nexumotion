"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Menu, ChevronDown, Cpu, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";

type Cat = { id: string; name: string; slug: string };

export default function Header({ categories }: { categories: Cat[] }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Cpu className="w-7 h-7 text-[#0052CC]" />
            <span className="font-bold text-lg text-slate-900">
              AutoParts <span className="text-[#FF6B00]">MENA</span>
            </span>
          </Link>

          <form onSubmit={submit} className="flex-1 max-w-2xl hidden md:flex">
            <div className="relative w-full">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by part number, competitor SKU, or keyword…"
                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40 focus:border-[#0052CC]"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </form>

          <nav className="flex items-center gap-1 ml-auto">
            <Link href="/brands" className="hidden lg:block px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0052CC]">
              Brands
            </Link>
            <Link href="/quick-order" className="hidden lg:block px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0052CC]">
              Quick Order
            </Link>
            <Link href="/account" className="p-2 text-slate-700 hover:text-[#0052CC]" aria-label="Account">
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="relative p-2 text-slate-700 hover:text-[#0052CC]" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#FF6B00] text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
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
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-[#0052CC] rounded-md hover:bg-[#003D99]"
          >
            <Menu className="w-4 h-4" /> All Categories <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <div className="hidden md:flex gap-1 overflow-x-auto">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-[#0052CC] whitespace-nowrap"
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
          className="absolute left-0 right-0 bg-white border-b border-slate-200 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                onClick={() => setMegaOpen(false)}
                className="px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-50 hover:text-[#0052CC]"
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
