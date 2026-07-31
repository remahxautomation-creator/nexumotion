"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteSavedSearch({ id }: { id: string }) {
  const router = useRouter();
  const remove = async () => {
    const res = await fetch(`/api/saved-searches?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };
  return (
    <button onClick={remove} className="text-slate-400 hover:text-red-600 shrink-0 ml-3" aria-label="Delete saved search">
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
