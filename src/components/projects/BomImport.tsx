"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, AlertTriangle } from "lucide-react";
import { useT } from "@/i18n/client";
import { parseCsv, guessColumns } from "@/lib/csv";

type Result = { sku: string; status: "added" | "not_found" | "invalid"; name?: string };

export default function BomImport({ projectId }: { projectId: string }) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [skuCol, setSkuCol] = useState<number | null>(null);
  const [qtyCol, setQtyCol] = useState<number | null>(null);
  const [skipFirst, setSkipFirst] = useState<boolean | null>(null);
  const router = useRouter();
  const { t } = useT();

  // Re-parse whenever the pasted text changes; column choices default to the
  // guess but stay user-overridable.
  const parsed = useMemo(() => {
    if (!text.trim()) return null;
    const rows = parseCsv(text);
    if (rows.length === 0) return null;
    const guess = guessColumns(rows);
    return { rows, guess, colCount: Math.max(...rows.map((r) => r.length)) };
  }, [text]);

  const effSku = skuCol ?? parsed?.guess.skuCol ?? 0;
  const effQty = qtyCol !== null ? qtyCol : parsed?.guess.qtyCol ?? null;
  const effSkip = skipFirst ?? parsed?.guess.hasHeader ?? false;

  const buildLines = () => {
    if (!parsed) return [];
    const body = effSkip ? parsed.rows.slice(1) : parsed.rows;
    return body
      .map((r) => {
        const sku = (r[effSku] ?? "").trim();
        if (!sku) return null;
        const rawQty = effQty !== null ? (r[effQty] ?? "").trim() : "";
        const qty = /^\d{1,5}$/.test(rawQty) ? parseInt(rawQty) : 1;
        return { sku, qty: qty > 0 ? qty : 1 };
      })
      .filter((x): x is { sku: string; qty: number } => !!x);
  };

  const preview = parsed ? buildLines().slice(0, 5) : [];
  const lineCount = parsed ? buildLines().length : 0;

  const submit = async () => {
    setError("");
    const lines = buildLines();

    if (lines.length === 0) {
      setError(t("projects.importNothingParsed"));
      return;
    }
    if (lines.length > 500) {
      setError(t("projects.importTooMany"));
      return;
    }

    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines }),
    });
    setBusy(false);

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setResults(data.results ?? []);
      setText("");
      setSkuCol(null);
      setQtyCol(null);
      setSkipFirst(null);
      router.refresh();
    } else {
      setError(data.error ?? t("projects.importFailed"));
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setText(await file.text());
    setSkuCol(null);
    setQtyCol(null);
    setSkipFirst(null);
    setError("");
    setOpen(true);
    e.target.value = "";
  };

  const notFound = results.filter((r) => r.status === "not_found").length;
  const added = results.filter((r) => r.status === "added").length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Upload className="w-4 h-4 text-[#0A6286]" /> {t("projects.importTitle")}
        </div>
        <div className="flex gap-2">
          <label className="text-xs font-medium border border-slate-300 rounded-md px-3 py-1.5 cursor-pointer bg-white hover:bg-slate-50">
            {t("projects.uploadCsv")}
            <input type="file" accept=".csv,.txt,.tsv" onChange={onFile} className="hidden" />
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
            onChange={(e) => { setText(e.target.value); setError(""); }}
            rows={6}
            placeholder={t("projects.pastePlaceholder")}
            className="w-full border border-slate-300 rounded-md p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0A6286]/40"
            dir="ltr"
          />

          {/* Column mapping — shown once something parses */}
          {parsed && (
            <div className="mt-3 border border-slate-200 rounded-md p-3 bg-slate-50">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    {t("projects.colPartNumber")}
                  </label>
                  <select
                    value={effSku}
                    onChange={(e) => setSkuCol(Number(e.target.value))}
                    className="text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white"
                  >
                    {Array.from({ length: parsed.colCount }).map((_, i) => (
                      <option key={i} value={i}>
                        {t("projects.column")} {i + 1}
                        {parsed.rows[0]?.[i] ? ` — ${parsed.rows[0][i].slice(0, 22)}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    {t("projects.colQty")}
                  </label>
                  <select
                    value={effQty === null ? "" : effQty}
                    onChange={(e) => setQtyCol(e.target.value === "" ? -1 : Number(e.target.value))}
                    className="text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white"
                  >
                    <option value="">{t("projects.qtyDefaultOne")}</option>
                    {Array.from({ length: parsed.colCount }).map((_, i) => (
                      <option key={i} value={i}>
                        {t("projects.column")} {i + 1}
                        {parsed.rows[0]?.[i] ? ` — ${parsed.rows[0][i].slice(0, 22)}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-600 pb-2">
                  <input
                    type="checkbox"
                    checked={effSkip}
                    onChange={(e) => setSkipFirst(e.target.checked)}
                    className="w-4 h-4"
                  />
                  {t("projects.skipHeader")}
                </label>
              </div>

              {preview.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] text-slate-500 mb-1.5">
                    {t("projects.previewOf")} {lineCount} {t("common.lines")}
                  </div>
                  <table className="w-full text-xs bg-white border border-slate-200 rounded">
                    <thead>
                      <tr className="text-start text-slate-500 border-b border-slate-200">
                        <th className="px-2 py-1.5 text-start">{t("admin.sku")}</th>
                        <th className="px-2 py-1.5 text-start">{t("cart.qty")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((l, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="px-2 py-1.5"><span className="sku">{l.sku}</span></td>
                          <td className="px-2 py-1.5 ltr-nums">{l.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-2 flex items-start gap-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button onClick={submit} disabled={busy || lineCount === 0}
            className="mt-3 flex items-center gap-2 bg-[#0A6286] hover:bg-[#084A66] text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("projects.importToProject")}
            {lineCount > 0 ? ` (${lineCount})` : ""}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="mt-3 text-xs text-slate-600">
            <span className="text-emerald-600 font-semibold">{added} {t("projects.lineAdded")}</span>
            {notFound > 0 && (
              <> · <span className="text-red-600 font-semibold">{notFound} {t("projects.lineNotFound")}</span></>
            )}
          </div>
          {notFound > 0 && (
            <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              {t("projects.notFoundHint")}
            </div>
          )}
          <div className="mt-2 border border-slate-200 rounded-md divide-y divide-slate-100 text-sm max-h-48 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="px-3 py-2 flex items-center justify-between gap-2">
                <span className="sku">{r.sku}</span>
                {r.status === "added" && <span className="text-emerald-600 text-xs font-medium">✓ {t("projects.lineAdded")}{r.name ? ` — ${r.name}` : ""}</span>}
                {r.status === "not_found" && <span className="text-red-600 text-xs font-medium">{t("projects.lineNotFound")}</span>}
                {r.status === "invalid" && <span className="text-amber-600 text-xs font-medium">{t("projects.lineInvalid")}</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
