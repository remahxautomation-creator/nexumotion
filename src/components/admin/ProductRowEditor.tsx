"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2 } from "lucide-react";
import { STOCK_LABELS } from "@/lib/utils";

type P = {
  id: string; sku: string; name: string; slug: string; brand: string;
  price: number; stockQty: number; stockStatus: string; isActive: boolean;
};

export default function ProductRowEditor({ product }: { product: P }) {
  const [price, setPrice] = useState(String(product.price));
  const [stockQty, setStockQty] = useState(String(product.stockQty));
  const [isActive, setIsActive] = useState(product.isActive);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const dirty =
    Number(price) !== product.price ||
    Number(stockQty) !== product.stockQty ||
    isActive !== product.isActive;

  const save = async () => {
    setBusy(true);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: Number(price), stockQty: Number(stockQty), isActive }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Update failed");
  };

  const stock = STOCK_LABELS[product.stockStatus] ?? STOCK_LABELS.IN_STOCK;

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-2.5">
        <Link href={`/products/${product.slug}`} className="hover:text-[#0052CC]">
          <span className="sku text-slate-700">{product.sku}</span>
          <div className="text-xs text-slate-500 max-w-56 truncate">{product.name}</div>
        </Link>
      </td>
      <td className="px-4 py-2.5 text-slate-600">{product.brand}</td>
      <td className="px-4 py-2.5">
        <input
          type="number" min={0} step="0.01" value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 border border-slate-300 rounded-md px-2 py-1 text-sm"
        />
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            className="w-20 border border-slate-300 rounded-md px-2 py-1 text-sm"
          />
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${stock.className}`}>
            {stock.label}
          </span>
        </div>
      </td>
      <td className="px-4 py-2.5">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4" />
      </td>
      <td className="px-4 py-2.5">
        <button
          onClick={save}
          disabled={!dirty || busy}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-[#0052CC] text-white disabled:opacity-30"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
        </button>
      </td>
    </tr>
  );
}
