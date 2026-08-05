"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";

type Result = { line: string; status: "added" | "not_found" | "invalid"; name?: string };

export default function QuickOrderPage() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const add = useCart((s) => s.add);
  const router = useRouter();

  const submit = async () => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setBusy(true);
    const out: Result[] = [];
    for (const line of lines) {
      const match = line.match(/^(\S+)[\s,;\t]+(\d+)$/) ?? line.match(/^(\S+)$/);
      if (!match) {
        out.push({ line, status: "invalid" });
        continue;
      }
      const sku = match[1];
      const qty = match[2] ? parseInt(match[2]) : 1;
      const res = await fetch(`/api/products/lookup?sku=${encodeURIComponent(sku)}`);
      if (res.ok) {
        const p = await res.json();
        add({ productId: p.id, sku: p.sku, name: p.name, slug: p.slug, brand: p.brand, price: p.price }, qty);
        out.push({ line, status: "added", name: p.name });
      } else {
        out.push({ line, status: "not_found" });
      }
    }
    setResults(out);
    setBusy(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList className="w-6 h-6 text-[#0A6286]" />
        <h1 className="text-2xl font-bold text-slate-900">Quick Order Pad</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Paste one part per line as <span className="sku">SKU QTY</span> (quantity optional). Example: <span className="sku">6ES7-42A1234 5</span>
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder={"6ES7-42A1234 5\nLC1D-18B2345 2\nVFD-77C3456"}
        className="w-full bg-white border border-slate-300 rounded-lg p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0A6286]/40"
      />
      <div className="mt-4 flex gap-3">
        <button
          onClick={submit}
          disabled={busy}
          className="bg-[#0A6286] hover:bg-[#084A66] text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-60"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Add to Cart
        </button>
        {results.some((r) => r.status === "added") && (
          <button onClick={() => router.push("/cart")} className="border border-slate-300 bg-white font-semibold px-6 py-2.5 rounded-lg text-sm">
            View Cart
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 text-sm">
          {results.map((r, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between">
              <span className="sku">{r.line}</span>
              {r.status === "added" && <span className="text-emerald-600 font-medium text-xs">✓ Added — {r.name}</span>}
              {r.status === "not_found" && <span className="text-red-600 font-medium text-xs">Not found</span>}
              {r.status === "invalid" && <span className="text-amber-600 font-medium text-xs">Invalid format</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
