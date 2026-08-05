"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Check } from "lucide-react";
import { useCart, type CartItem } from "@/hooks/useCart";
import { useT } from "@/i18n/client";
import { formatPrice } from "@/lib/utils";

export default function ProjectActions({
  projectId,
  cartItems,
  total,
}: {
  projectId: string;
  cartItems: CartItem[];
  total: number;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const { t } = useT();

  const addAll = () => {
    for (const item of cartItems) add(item, item.qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const remove = async () => {
    if (!confirm(t("projects.confirmDelete"))) return;
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (res.ok) router.push("/projects");
    else alert("Delete failed");
  };

  return (
    <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
      <button onClick={remove}
        className="flex items-center gap-2 text-sm font-medium text-red-600 border border-red-200 bg-white rounded-lg px-4 py-2 hover:bg-red-50">
        <Trash2 className="w-4 h-4" /> {t("projects.deleteProject")}
      </button>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">{t("projects.estimated")} <strong>{formatPrice(total)}</strong></span>
        <button onClick={addAll}
          className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg text-sm text-[#0A2A38] ${added ? "bg-emerald-600" : "bg-[#07C89B] hover:bg-[#06B48C]"}`}>
          {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          {added ? t("projects.addedToCart") : t("projects.addAllToCart")}
        </button>
      </div>
    </div>
  );
}
