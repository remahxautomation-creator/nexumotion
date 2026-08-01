// RFC4180-style CSV parser. Handles quoted fields containing commas, escaped
// quotes (""), and newlines inside quotes — all of which appear in real BOM
// exports from ERP systems.
export function parseCsv(text: string, delimiter?: string): string[][] {
  const d = delimiter ?? detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Normalise line endings so \r\n inside quotes doesn't leak into values
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];

    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') { inQuotes = true; continue; }
    if (ch === d) { row.push(field.trim()); field = ""; continue; }
    if (ch === "\n") {
      row.push(field.trim());
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += ch;
  }

  row.push(field.trim());
  if (row.some((c) => c !== "")) rows.push(row);

  // Fallback for whitespace-separated input ("SKU QTY"), which has no real
  // delimiter and would otherwise collapse into a single column.
  if (rows.every((r) => r.length === 1)) {
    const split = rows.map((r) => r[0].split(/\s+/).filter(Boolean));
    if (split.some((r) => r.length > 1)) return split;
  }
  return rows;
}

function detectDelimiter(text: string): string {
  const sample = text.split("\n").slice(0, 5).join("\n");
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0, "|": 0 };
  let inQuotes = false;
  for (const ch of sample) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (!inQuotes && ch in counts) counts[ch]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][1] > 0
    ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    : ",";
}

// Looks like a manufacturer part number: has a digit, isn't purely numeric,
// and isn't a unit-of-measure token.
const UOM = new Set(["pc", "pcs", "ea", "each", "set", "m", "mm", "kg", "no", "nos", "unit", "units"]);

export function looksLikePartNumber(v: string): boolean {
  const s = v.trim();
  if (s.length < 3 || s.length > 60) return false;
  if (UOM.has(s.toLowerCase())) return false;
  if (/^\d+([.,]\d+)?$/.test(s)) return false;       // pure number → line no. or qty
  if (!/\d/.test(s)) return false;                    // part numbers carry digits
  if (/\s/.test(s) && s.split(/\s+/).length > 3) return false; // prose, not a PN
  return true;
}

export function looksLikeQty(v: string): boolean {
  const s = v.trim();
  return /^\d{1,5}$/.test(s) && Number(s) > 0;
}

// Best-guess column indexes. Header names win; otherwise fall back to content.
// Quantity guessing prefers the RIGHTMOST integer column, because BOM exports
// commonly put a line/item number on the left that looks identical to a qty.
export function guessColumns(rows: string[][]): {
  hasHeader: boolean; skuCol: number; qtyCol: number | null;
} {
  if (rows.length === 0) return { hasHeader: false, skuCol: 0, qtyCol: null };

  const first = rows[0].map((c) => c.toLowerCase());
  const headerHit = (names: string[]) =>
    first.findIndex((c) => names.some((n) => c === n || c.includes(n)));

  const skuByHeader = headerHit(["sku", "part number", "part no", "partno", "part_number", "mpn", "material", "catalog", "item code", "reference"]);
  const qtyByHeader = headerHit(["qty", "quantity", "amount", "pieces"]);
  const hasHeader = skuByHeader !== -1 || qtyByHeader !== -1;

  if (hasHeader) {
    return {
      hasHeader: true,
      skuCol: skuByHeader !== -1 ? skuByHeader : 0,
      qtyCol: qtyByHeader !== -1 ? qtyByHeader : null,
    };
  }

  const body = rows.slice(0, 20);
  const colCount = Math.max(...body.map((r) => r.length));
  const score = (fn: (v: string) => boolean, col: number) =>
    body.filter((r) => r[col] !== undefined && fn(r[col])).length;

  let skuCol = 0;
  let best = -1;
  for (let c = 0; c < colCount; c++) {
    const s = score(looksLikePartNumber, c);
    if (s > best) { best = s; skuCol = c; }
  }

  // Score against rows that actually have the column, so ragged input (some
  // lines carrying a qty, some not) still resolves.
  let qtyCol: number | null = null;
  for (let c = colCount - 1; c >= 0; c--) {
    if (c === skuCol) continue;
    const present = body.filter((r) => (r[c] ?? "").trim() !== "").length;
    if (present === 0) continue;
    if (score(looksLikeQty, c) >= Math.ceil(present * 0.8)) { qtyCol = c; break; }
  }

  return { hasHeader: false, skuCol, qtyCol };
}
