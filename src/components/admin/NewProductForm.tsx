"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { useT } from "@/i18n/client";

export default function NewProductForm({
  brands,
  categories,
}: {
  brands: string[];
  categories: string[];
}) {
  const [form, setForm] = useState({
    sku: "", name: "", brand: brands[0] ?? "", category: categories[0] ?? "",
    price: "", stockQty: "0", shortDesc: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { t } = useT();

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: [form] }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    const result = data.results?.[0];
    if (res.ok && result?.status !== "error") {
      router.push(`/admin/products?q=${encodeURIComponent(form.sku)}`);
    } else {
      setError(result?.error ?? data.error ?? t("admin.createFailed"));
    }
  };

  const input =
    "w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40";

  return (
    <form onSubmit={submit} className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl space-y-4">
      {error && (
        <div className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("admin.sku")} *</label>
          <input required value={form.sku} onChange={set("sku")} className={`${input} font-mono`} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("admin.name")} *</label>
          <input required value={form.name} onChange={set("name")} className={input} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("common.brand")} *</label>
          <select value={form.brand} onChange={set("brand")} className={input}>
            {brands.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("admin.category")} *</label>
          <select value={form.category} onChange={set("category")} className={input}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("admin.priceUsd")} *</label>
          <input required type="number" min={0} step="0.01" value={form.price} onChange={set("price")} className={input} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("admin.stockQty")}</label>
          <input type="number" min={0} value={form.stockQty} onChange={set("stockQty")} className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-600 block mb-1">{t("admin.shortDesc")}</label>
          <input value={form.shortDesc} onChange={set("shortDesc")} className={input} maxLength={255} />
        </div>
      </div>
      <button type="submit" disabled={busy}
        className="flex items-center gap-2 bg-[#0052CC] hover:bg-[#003D99] text-white font-semibold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} {t("admin.createProduct")}
      </button>
    </form>
  );
}
