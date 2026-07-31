"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function RequestQuoteButton() {
  const items = useCart((s) => s.items);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const request = async () => {
    if (items.length === 0) return;
    const notes = prompt("Anything we should know? (lead time, project, target price)") ?? "";
    setBusy(true);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        notes,
      }),
    });
    setBusy(false);
    if (res.status === 401) {
      router.push("/login?callbackUrl=/cart");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (res.ok) router.push(`/account/quotes/${data.id}`);
    else alert(data.error ?? "Could not create quote request");
  };

  return (
    <button onClick={request} disabled={busy}
      className="w-full mt-2 flex items-center justify-center gap-2 border border-slate-300 bg-white text-slate-700 font-semibold py-2.5 rounded-lg text-sm hover:border-[#0052CC] hover:text-[#0052CC] disabled:opacity-60">
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
      Request a quote
    </button>
  );
}
