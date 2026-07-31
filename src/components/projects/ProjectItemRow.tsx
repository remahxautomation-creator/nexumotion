"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Item = {
  id: string; qty: number; sku: string; name: string; slug: string;
  brand: string; price: number; stockLabel: string; stockClass: string;
};

export default function ProjectItemRow({ projectId, item }: { projectId: string; item: Item }) {
  const [qty, setQty] = useState(item.qty);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const update = async (next: number) => {
    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, qty: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  };

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-2.5">
        <Link href={`/products/${item.slug}`} className="hover:text-[#0052CC]">
          <span className="sku text-slate-600">{item.sku}</span>
          <div className="text-xs text-slate-500 max-w-64 truncate">{item.name}</div>
          <div className="text-[10px] text-slate-400">{item.brand}</div>
        </Link>
      </td>
      <td className="px-4 py-2.5">{formatPrice(item.price)}</td>
      <td className="px-4 py-2.5">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.stockClass}`}>
          {item.stockLabel}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number" min={1} value={qty} disabled={busy}
          onChange={(e) => setQty(parseInt(e.target.value) || 1)}
          onBlur={() => qty !== item.qty && update(qty)}
          className="w-16 border border-slate-300 rounded-md px-2 py-1 text-sm"
        />
      </td>
      <td className="px-4 py-2.5 font-semibold">{formatPrice(item.price * qty)}</td>
      <td className="px-4 py-2.5">
        <button onClick={() => update(0)} disabled={busy} className="text-slate-400 hover:text-red-600" aria-label="Remove">
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
