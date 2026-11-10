/**
 * Pure mapping from a DigiKey Product Information V4 product to a row for
 * scripts/import-products.ts. No network here, so it can be unit-tested.
 *
 * What is kept: manufacturer part number, series, parametric values, datasheet
 * link, unit price. These are facts about the part.
 * What is dropped: DigiKey's description text and photos. The product name is
 * composed from the brand, series, DigiKey's category name and the part number,
 * so no copy is reused. Same rule as convert-distributor-export.ts.
 */

/** The subset of the V4 product shape this mapping reads. */
export type DkProduct = {
  ManufacturerProductNumber?: string;
  Manufacturer?: { Id?: number | string; Name?: string };
  UnitPrice?: number;
  DatasheetUrl?: string | null;
  ProductStatus?: { Id?: number; Status?: string };
  Series?: { Name?: string };
  Category?: { Name?: string; ChildCategories?: { Name?: string }[] };
  Parameters?: { ParameterText?: string; ValueText?: string }[];
  ProductVariations?: { StandardPricing?: { BreakQuantity?: number; UnitPrice?: number }[] }[];
};

export type ImportRow = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  stockQty: string;
  shortDesc: string;
  datasheetUrl: string;
  specs: string;
};

export const IMPORT_HEADER: (keyof ImportRow)[] = [
  "sku", "name", "brand", "category", "price", "stockQty", "shortDesc", "datasheetUrl", "specs",
];

/** Parameters that describe DigiKey's packaging or listing, not the part. */
const SKIP_PARAMS = new Set(["Packaging", "Part Status", "Base Product Number", "Product Status"]);

/**
 * DigiKey parameter name → the display name our category templates use, so the
 * importer derives the same filter key (e.g. "IP Rating" → ip_rating) and the
 * values land in the existing sidebar filters instead of a parallel key.
 */
const PARAM_RENAMES: Record<string, string> = {
  "Ingress Protection": "IP Rating",
  "Voltage - Supply": "Voltage",
  "Sensing Distance": "Sensing Range",
  "Voltage - Output": "Output Voltage",
  "Current - Output (Max)": "Current",
  "Power (Watts)": "Power",
  "Number of Positions": "Pins",
};

const ACTIVE = new Set(["Active"]);

export function isActive(p: DkProduct): boolean {
  const s = p.ProductStatus?.Status;
  return s == null || ACTIVE.has(s);
}

/** Deepest category name DigiKey returns, e.g. "Proximity Sensors". */
export function leafCategory(p: DkProduct): string {
  let name = p.Category?.Name ?? "";
  let kids = p.Category?.ChildCategories ?? [];
  while (kids.length) {
    name = kids[0].Name ?? name;
    kids = (kids[0] as { ChildCategories?: { Name?: string }[] }).ChildCategories ?? [];
  }
  return name;
}

/** Quantity-1 price if listed, else UnitPrice, else 0 (price on request). */
export function unitPrice(p: DkProduct): number {
  for (const v of p.ProductVariations ?? []) {
    const one = v.StandardPricing?.find((b) => b.BreakQuantity === 1);
    if (one?.UnitPrice) return Math.round(one.UnitPrice * 100) / 100;
  }
  return Math.round((p.UnitPrice ?? 0) * 100) / 100;
}

export function toImportRow(
  p: DkProduct,
  opts: { brand: string; category: string; stockQty: number; markup: number },
): ImportRow | null {
  const sku = (p.ManufacturerProductNumber ?? "").trim();
  if (!sku || !isActive(p)) return null;

  const specs: Record<string, string> = {};
  const series = p.Series?.Name?.trim();
  if (series && series !== "-" && series !== "*") specs["Series"] = series;
  for (const param of p.Parameters ?? []) {
    const label = param.ParameterText?.trim();
    const value = param.ValueText?.trim();
    if (!label || !value || value === "-" || SKIP_PARAMS.has(label)) continue;
    specs[PARAM_RENAMES[label] ?? label] = value;
  }

  const leaf = leafCategory(p);
  const name = [opts.brand, series && series !== "-" && series !== "*" ? series : "", leaf, sku]
    .filter(Boolean).join(" ").replace(/\s+/g, " ");

  let datasheet = (p.DatasheetUrl ?? "").trim();
  if (datasheet.startsWith("//")) datasheet = "https:" + datasheet;

  const price = unitPrice(p) * opts.markup;

  return {
    sku,
    name,
    brand: opts.brand,
    category: opts.category,
    price: (Math.round(price * 100) / 100).toString(),
    stockQty: String(opts.stockQty),
    shortDesc: name.length > 140 ? name.slice(0, 137) + "…" : name,
    datasheetUrl: datasheet,
    specs: JSON.stringify(specs),
  };
}

export function toCsv(rows: ImportRow[]): string {
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [IMPORT_HEADER.join(","), ...rows.map((r) => IMPORT_HEADER.map((k) => cell(r[k])).join(","))].join("\n") + "\n";
}
