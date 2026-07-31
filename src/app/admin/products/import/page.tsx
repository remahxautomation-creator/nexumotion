import BulkImport from "@/components/admin/BulkImport";

export const metadata = { title: "Bulk Import" };

export default function BulkImportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Bulk Product Import</h1>
      <p className="text-sm text-slate-500 mb-6 max-w-2xl">
        Upload or paste CSV with header{" "}
        <span className="sku">sku,name,brand,category,price,stockQty,shortDesc</span>.
        Existing SKUs are updated; new SKUs are created. Brand and category must match
        existing names (or slugs).
      </p>
      <BulkImport />
    </div>
  );
}
