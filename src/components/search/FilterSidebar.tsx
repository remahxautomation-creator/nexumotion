"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";

type Filter = {
  key: string;
  name: string;
  unit: string | null;
  dataType: string;
  options: string[];
};

export default function FilterSidebar({
  filters,
  brands,
}: {
  filters: Filter[];
  brands: { name: string; slug: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeCount = [...sp.keys()].length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 text-sm">Filters</h2>
        {activeCount > 0 && (
          <button
            onClick={() => router.push(pathname)}
            className="text-xs text-[#0052CC] flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Availability</label>
        <select
          value={sp.get("stock") ?? ""}
          onChange={(e) => setParam("stock", e.target.value)}
          className="w-full text-sm border border-slate-300 rounded-md px-2 py-1.5"
        >
          <option value="">All</option>
          <option value="in">In stock only</option>
        </select>
      </div>

      {brands.length > 1 && (
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Brand</label>
          <select
            value={sp.get("brand") ?? ""}
            onChange={(e) => setParam("brand", e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-md px-2 py-1.5"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {filters
        .filter((f) => f.dataType === "ENUM" && f.options.length > 0)
        .map((f) => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              {f.name} {f.unit ? `(${f.unit})` : ""}
            </label>
            <select
              value={sp.get(f.key) ?? ""}
              onChange={(e) => setParam(f.key, e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-md px-2 py-1.5"
            >
              <option value="">Any</option>
              {f.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}

      {filters
        .filter((f) => f.dataType === "NUMBER")
        .map((f) => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              {f.name} {f.unit ? `(${f.unit})` : ""}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={sp.get(`${f.key}_min`) ?? ""}
                onBlur={(e) => setParam(`${f.key}_min`, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setParam(`${f.key}_min`, (e.target as HTMLInputElement).value)}
                className="w-full text-sm border border-slate-300 rounded-md px-2 py-1.5"
              />
              <span className="text-slate-400 text-xs">–</span>
              <input
                type="number"
                placeholder="Max"
                defaultValue={sp.get(`${f.key}_max`) ?? ""}
                onBlur={(e) => setParam(`${f.key}_max`, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setParam(`${f.key}_max`, (e.target as HTMLInputElement).value)}
                className="w-full text-sm border border-slate-300 rounded-md px-2 py-1.5"
              />
            </div>
          </div>
        ))}

      {filters
        .filter((f) => f.dataType === "BOOLEAN")
        .map((f) => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">{f.name}</label>
            <select
              value={sp.get(f.key) ?? ""}
              onChange={(e) => setParam(f.key, e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-md px-2 py-1.5"
            >
              <option value="">Any</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        ))}
    </div>
  );
}
