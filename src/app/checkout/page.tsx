"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

const SHIPPING_FLAT = 25;
const FREE_SHIPPING_OVER = 1000;
const VAT_RATE = 0.14;

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", country: "Egypt", notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
  const tax = Math.round(subtotal * VAT_RATE * 100) / 100;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900">Nothing to check out</h1>
        <p className="text-sm text-slate-500 mt-2">Your cart is empty.</p>
        <Link href="/search" className="inline-block mt-6 bg-[#0052CC] text-white font-semibold px-6 py-2.5 rounded-lg text-sm">
          Search Parts
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        email: form.email,
        notes: form.notes,
        shippingAddress: {
          name: form.name, phone: form.phone, address: form.address,
          city: form.city, country: form.country,
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Checkout failed. Please try again.");
      setBusy(false);
      return;
    }
    clear();
    router.push(`/orders/${data.orderNumber}?e=${encodeURIComponent(data.email ?? form.email)}`);
  };

  const input =
    "w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={submit} className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 text-sm">Contact & Shipping</h2>
          {error && (
            <div className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Full name *</label>
              <input required value={form.name} onChange={set("name")} className={input} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={set("email")} className={input} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Phone *</label>
              <input required value={form.phone} onChange={set("phone")} className={input} placeholder="+20 1X XXX XXXX" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Country *</label>
              <select value={form.country} onChange={set("country")} className={input}>
                {["Egypt", "Saudi Arabia", "UAE", "Kuwait", "Qatar", "Jordan", "Libya", "Sudan", "Nigeria", "Kenya", "Morocco", "Algeria", "Other"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Address *</label>
              <input required value={form.address} onChange={set("address")} className={input} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">City *</label>
              <input required value={form.city} onChange={set("city")} className={input} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Order notes (optional)</label>
            <textarea rows={2} value={form.notes} onChange={set("notes")} className={input} />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h2 className="font-semibold text-slate-900 text-sm mb-2">Payment</h2>
            <div className="text-sm bg-blue-50 border border-blue-200 text-blue-800 rounded-md px-3 py-2.5 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                <strong>Confirm order — pay on invoice.</strong> Our team contacts you within one
                business day with payment options (bank transfer, card link, or Fawry).
                Online card payment is coming soon.
              </span>
            </div>
          </div>

          <button type="submit" disabled={busy}
            className="w-full bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Place Order — {formatPrice(total)}
          </button>
          <p className="text-[11px] text-slate-400 text-center">No account required. Guest checkout supported.</p>
        </form>

        <div className="bg-white rounded-lg border border-slate-200 p-5 h-fit">
          <h2 className="font-semibold text-slate-900 text-sm mb-3">Order Summary</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between text-sm gap-2">
                <div className="min-w-0">
                  <div className="sku text-slate-500 truncate">{i.sku}</div>
                  <div className="text-xs text-slate-400">× {i.qty}</div>
                </div>
                <div className="font-medium shrink-0">{formatPrice(i.price * i.qty)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between">
              <span className="text-slate-600">Shipping</span>
              <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between"><span className="text-slate-600">VAT (14%)</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-100">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
          {subtotal < FREE_SHIPPING_OVER && (
            <div className="mt-3 text-[11px] text-slate-400">
              Free shipping on orders over {formatPrice(FREE_SHIPPING_OVER)}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
