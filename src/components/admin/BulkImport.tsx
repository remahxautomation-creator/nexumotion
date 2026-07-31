"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { useT } from "@/i18n/client";

type Result = { sku: string; status: "created" | "updated" | "error"; error?: string };

// Minimal CSV line splitter with double-quote support
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cur += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { out.push(cur); cur = ""; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { error: "Need a header row plus at least one data row", rows: [] };
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const required = ["sku", "name", "brand", "category", "price"];
  for (const r of required) {
    if (!header.includes(r)) return { error: `Missing required column "${r}"`, rows: [] };
  }
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: Record<string, string> = {};
    header.forEach((h, i) => { row[h] = cells[i] ?? ""; });
    return {
      sku: row.sku, name: row.name, brand: row.brand, category: row.category,
      price: row.price, stockQty: row.stockqty ?? row["stock_qty"] ?? "", shortDesc: row.shortdesc ?? "",
    };
  });
  return { error: null, rows };
}

export default function BulkImport() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { t } = useT();

  const submit = async () => {
    setError("");
    const { error: parseError, rows } = parseCsv(text);
    if (parseError) { setError(parseError); return; }
    if (rows.length > 1000) { setError("Max 1000 rows per import"); return; }
    setBusy(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: rows }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setResults(data.results);
      router.refresh();
    } else {
      setError(data.error ?? t("admin.importFailed"));
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setText(await file.text());
    e.target.value = "";
  };

  const counts = results.reduce(
    (acc, r) => { acc[r.status]++; return acc; },
    { created: 0, updated: 0, error: 0 } as Record<Result["status"], number>
  );

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex gap-2 mb-3">
          <label className="text-xs font-medium border border-slate-300 rounded-md px-3 py-1.5 cursor-pointer bg-white hover:bg-slate-50">
            {t("admin.uploadCsvFile")}
            <input type="file" accept=".csv,.txt" onChange={onFile} className="hidden" />
          </label>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={"sku,name,brand,category,price,stockQty,shortDesc\nTEST-001,Test Contactor 9A,Siemens,Motor Control,45,20,SIRIUS-style contactor"}
          className="w-full border border-slate-300 rounded-md p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40"
        />
        {error && (
          <div className="mt-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{error}</div>
        )}
        <button onClick={submit} disabled={busy || !text.trim()}
          className="mt-3 flex items-center gap-2 bg-[#0052CC] hover:bg-[#003D99] text-white font-semibold px-5 py-2.5 rounded-lg text-sm disabled:opacity-50">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} {t("admin.import")}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-slate-600 mb-2">
            <span className="text-emerald-600 font-semibold">{counts.created} {t("admin.created")}</span> ·{" "}
            <span className="text-blue-600 font-semibold">{counts.updated} {t("admin.updated")}</span> ·{" "}
            <span className="text-red-600 font-semibold">{counts.error} {t("admin.errors")}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 text-sm max-h-72 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="px-4 py-2 flex items-center justify-between gap-3">
                <span className="sku">{r.sku}</span>
                {r.status === "created" && <span className="text-emerald-600 text-xs font-medium">{t("admin.created")}</span>}
                {r.status === "updated" && <span className="text-blue-600 text-xs font-medium">{t("admin.updated")}</span>}
                {r.status === "error" && <span className="text-red-600 text-xs font-medium truncate">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
