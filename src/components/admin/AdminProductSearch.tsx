"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function AdminProductSearch() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    router.push(`/admin/products?${params.toString()}`);
  };

  const toggleLow = () => {
    const params = new URLSearchParams(sp.toString());
    if (params.get("stock") === "low") params.delete("stock");
    else params.set("stock", "low");
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      <form onSubmit={submit} className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search SKU, name, brand…"
          className="w-64 border border-slate-300 rounded-md pl-8 pr-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40"
        />
        <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
      </form>
      <button
        onClick={toggleLow}
        className={`text-xs font-medium px-3 py-1.5 rounded-md border ${
          sp.get("stock") === "low"
            ? "bg-amber-100 text-amber-800 border-amber-300"
            : "bg-white text-slate-600 border-slate-300"
        }`}
      >
        Low stock
      </button>
    </div>
  );
}
