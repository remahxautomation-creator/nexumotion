"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { useT } from "@/i18n/client";

type Result = { sku: string; status: "added" | "not_found" | "invalid"; name?: string };

// Accepts pasted text or a .csv/.txt file. Each line: "SKU,QTY" / "SKU;QTY" / "SKU QTY" / "SKU"
function parseLines(text: string): { sku: string; qty: number }[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l, i) => !(i === 0 && /^sku[\s,;]/i.test(l))) // skip header row
    .map((l) => {
      const m = l.match(/^"?([^",;\s]+)"?[\s,;\t]+(\d+)\s*$/) ?? l.match(/^"?([^",;\s]+)"?$/);
      if (!m) return null;
      return { sku: m[1], qty: m[2] ? parseInt(m[2]) : 1 };
    })
    .filter((x): x is { sku: string; qty: number } => !!x);
}

export default function BomImport({ projectId }: { projectId: string }) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useT();

  const submit = async () => {
    const lines = parseLines(text);
    if (!lines.length) return;
    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      setResults(data.results);
      setText("");
      router.refresh();
    } else {
      alert("Import failed");
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setText(await file.text());
    setOpen(true);
    e.target.value = "";
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Upload className="w-4 h-4 text-[#0052CC]" /> {t("projects.importTitle")}
        </div>
        <div className="flex gap-2">
          <label className="text-xs font-medium border border-slate-300 rounded-md px-3 py-1.5 cursor-pointer bg-white hover:bg-slate-50">
            {t("projects.uploadCsv")}
            <input type="file" accept=".csv,.txt" onChange={onFile} className="hidden" />
          </label>
          <button onClick={() => setOpen((v) => !v)}
            className="text-xs font-medium border border-slate-300 rounded-md px-3 py-1.5 bg-white hover:bg-slate-50">
            {open ? t("projects.hidePaste") : t("projects.pasteLines")}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder={"One part per line — SKU,QTY or SKU QTY:\n6ES7-42A1234,5\nLC1D-18B2345 2\nVFD-77C3456"}
            className="w-full border border-slate-300 rounded-md p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40"
          />
          <button onClick={submit} disabled={busy || !text.trim()}
            className="mt-2 flex items-center gap-2 bg-[#0052CC] hover:bg-[#003D99] text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} {t("projects.importToProject")}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-3 border border-slate-200 rounded-md divide-y divide-slate-100 text-sm max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <div key={i} className="px-3 py-2 flex items-center justify-between">
              <span className="sku">{r.sku}</span>
              {r.status === "added" && <span className="text-emerald-600 text-xs font-medium">✓ {t("projects.lineAdded")}{r.name ? ` — ${r.name}` : ""}</span>}
              {r.status === "not_found" && <span className="text-red-600 text-xs font-medium">{t("projects.lineNotFound")}</span>}
              {r.status === "invalid" && <span className="text-amber-600 text-xs font-medium">{t("projects.lineInvalid")}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
