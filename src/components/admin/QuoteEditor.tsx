"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Item = {
  id: string; sku: string; name: string; brand: string; qty: number;
  listPrice: number; quotedPrice: number | null; stockQty: number;
};

export default function QuoteEditor({
  quoteId,
  status,
  adminNotes: initialNotes,
  items,
}: {
  quoteId: string;
  status: string;
  adminNotes: string;
  items: Item[];
}) {
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(items.map((it) => [it.id, String(it.quotedPrice ?? it.listPrice)]))
  );
  const [adminNotes, setAdminNotes] = useState(initialNotes);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const editable = status === "REQUESTED" || status === "QUOTED";
  const quotedTotal = items.reduce((n, it) => n + (Number(prices[it.id]) || 0) * it.qty, 0);
  const listTotal = items.reduce((n, it) => n + it.listPrice * it.qty, 0);

  const send = async () => {
    setBusy(true);
    const res = await fetch(`/api/quotes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "quote",
        adminNotes,
        prices: Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, Number(v)])),
      }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Failed to send quote");
  };

  const reject = async () => {
    if (!confirm("Reject this quote request?")) return;
    await fetch(`/api/quotes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    router.refresh();
  };

  return (
    <div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-start text-xs text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">List</th>
              <th className="px-4 py-3">Quoted (USD)</th>
              <th className="px-4 py-3">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5">
                  <span className="sku text-slate-600">{it.sku}</span>
                  <div className="text-xs text-slate-400 max-w-56 truncate">{it.name} · {it.brand}</div>
                </td>
                <td className="px-4 py-2.5 font-medium">{it.qty}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{it.stockQty} avail</td>
                <td className="px-4 py-2.5 text-slate-500">{formatPrice(it.listPrice)}</td>
                <td className="px-4 py-2.5">
                  <input
                    type="number" min={0} step="0.01"
                    value={prices[it.id]}
                    disabled={!editable}
                    onChange={(e) => setPrices((p) => ({ ...p, [it.id]: e.target.value }))}
                    className="w-24 border border-slate-300 rounded-md px-2 py-1 text-sm disabled:bg-slate-50"
                  />
                </td>
                <td className="px-4 py-2.5 font-semibold">
                  {formatPrice((Number(prices[it.id]) || 0) * it.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-sm text-slate-600 text-end">
        List: <span className="line-through">{formatPrice(listTotal)}</span> · Quoted:{" "}
        <strong>{formatPrice(quotedTotal)}</strong>{" "}
        <span className="text-slate-400">
          ({listTotal > 0 ? Math.round((1 - quotedTotal / listTotal) * 100) : 0}% off)
        </span>
      </div>

      {editable && (
        <div className="mt-4 space-y-3 max-w-2xl">
          <textarea
            rows={2}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Note to customer (validity, lead time, terms)…"
            className="w-full border border-slate-300 rounded-md p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40"
          />
          <div className="flex gap-3">
            <button onClick={send} disabled={busy}
              className="flex items-center gap-2 bg-[#0052CC] hover:bg-[#003D99] text-white font-semibold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {status === "QUOTED" ? "Update quote" : "Send quote"}
            </button>
            <button onClick={reject}
              className="flex items-center gap-2 border border-slate-300 bg-white text-slate-600 font-semibold px-5 py-2.5 rounded-lg text-sm hover:text-red-600">
              <X className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
