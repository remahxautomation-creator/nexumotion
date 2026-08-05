"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { useT } from "@/i18n/client";

export default function AcceptQuote({ quoteId }: { quoteId: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", country: "Egypt" });
  const router = useRouter();
  const { t } = useT();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const accept = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/quotes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept", shippingAddress: form }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) router.push(`/orders/${data.orderNumber}`);
    else setError(data.error ?? t("quotes.acceptFailed"));
  };

  const reject = async () => {
    if (!confirm(t("quotes.confirmDecline"))) return;
    await fetch(`/api/quotes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    router.refresh();
  };

  const input =
    "w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6286]/40";

  return (
    <div className="mt-6">
      {!open ? (
        <div className="flex gap-3">
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-[#07C89B] hover:bg-[#06B48C] text-[#0A2A38] font-semibold px-5 py-2.5 rounded-lg text-sm">
            <Check className="w-4 h-4" /> {t("quotes.accept")}
          </button>
          <button onClick={reject}
            className="flex items-center gap-2 border border-slate-300 bg-white text-slate-600 font-semibold px-5 py-2.5 rounded-lg text-sm hover:text-red-600">
            <X className="w-4 h-4" /> {t("quotes.decline")}
          </button>
        </div>
      ) : (
        <form onSubmit={accept} className="bg-white rounded-lg border border-slate-200 p-5 max-w-lg space-y-3">
          <h2 className="font-semibold text-slate-900 text-sm">{t("quotes.shippingAddress")}</h2>
          {error && <div className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{error}</div>}
          <input required placeholder={t("auth.fullName")} value={form.name} onChange={set("name")} className={input} />
          <input required placeholder={t("checkout.phone")} value={form.phone} onChange={set("phone")} className={input} />
          <input required placeholder={t("checkout.address")} value={form.address} onChange={set("address")} className={input} />
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder={t("checkout.city")} value={form.city} onChange={set("city")} className={input} />
            <input required placeholder={t("checkout.country")} value={form.country} onChange={set("country")} className={input} />
          </div>
          <button type="submit" disabled={busy}
            className="flex items-center gap-2 bg-[#07C89B] hover:bg-[#06B48C] text-[#0A2A38] font-semibold px-5 py-2.5 rounded-lg text-sm disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} {t("quotes.confirmOrder")}
          </button>
        </form>
      )}
    </div>
  );
}
