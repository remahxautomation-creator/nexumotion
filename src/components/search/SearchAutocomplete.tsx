"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Suggestion = {
  sku: string; name: string; slug: string; brand: string; price: number; stockStatus: string;
};

export default function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [crossRef, setCrossRef] = useState<{ competitorSku: string; count: number } | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setCrossRef(null);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (res.ok) {
          const data = await res.json();
          setResults(data.products);
          setCrossRef(data.crossRef);
          setOpen(true);
        }
      } catch {
        /* aborted */
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search by part number, competitor SKU, or keyword…"
          className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40 focus:border-[#0052CC]"
        />
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
      </form>

      {open && (results.length > 0 || crossRef) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((r) => (
            <Link
              key={r.slug}
              href={`/products/${r.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0"
            >
              <div className="min-w-0">
                <span className="sku text-slate-600">{r.sku}</span>
                <div className="text-xs text-slate-500 truncate">{r.name} · {r.brand}</div>
              </div>
              <span className="text-sm font-semibold shrink-0 ml-3">{formatPrice(r.price)}</span>
            </Link>
          ))}
          {crossRef && (
            <button
              onClick={() => { setOpen(false); router.push(`/search?q=${encodeURIComponent(query.trim())}`); }}
              className="w-full text-left px-4 py-2.5 text-sm text-blue-800 bg-blue-50 hover:bg-blue-100"
            >
              {crossRef.count} equivalent{crossRef.count > 1 ? "s" : ""} found for competitor part{" "}
              <span className="sku">{crossRef.competitorSku}</span> →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
