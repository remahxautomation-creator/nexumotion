"use client";

import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import RequestQuoteButton from "@/components/quotes/RequestQuoteButton";

export default function CartPage() {
  const { items, remove, setQty, clear } = useCart();
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="text-sm text-slate-500 mt-2">Add parts from search, categories, or the quick-order pad.</p>
        <Link href="/search" className="inline-block mt-6 bg-[#0052CC] text-white font-semibold px-6 py-2.5 rounded-lg text-sm">
          Search Parts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Cart ({items.length} lines)</h1>
        <button onClick={clear} className="text-sm text-red-600 hover:underline">Clear cart</button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-start text-xs text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.productId} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/products/${i.slug}`} className="hover:text-[#0052CC]">
                    <div className="sku text-slate-500">{i.sku}</div>
                    <div className="font-medium text-slate-900">{i.name}</div>
                    <div className="text-xs text-slate-400">{i.brand}</div>
                  </Link>
                </td>
                <td className="px-4 py-3">{formatPrice(i.price)}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={1}
                    value={i.qty}
                    onChange={(e) => setQty(i.productId, parseInt(e.target.value) || 1)}
                    className="w-16 border border-slate-300 rounded-md px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-3 font-semibold">{formatPrice(i.price * i.qty)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(i.productId)} className="text-slate-400 hover:text-red-600" aria-label="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="bg-white rounded-lg border border-slate-200 p-5 w-full sm:w-80">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <div className="text-xs text-slate-400 mb-4">Shipping & taxes calculated at checkout.</div>
          <Link href="/checkout" className="block text-center w-full bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg text-sm">
            Proceed to Checkout
          </Link>
          <RequestQuoteButton />
          <div className="text-[11px] text-slate-400 text-center mt-2">Guest checkout available — no account required</div>
        </div>
      </div>
    </div>
  );
}
