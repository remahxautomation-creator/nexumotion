import BulkImport from "@/components/admin/BulkImport";
import { getT } from "@/i18n/server";

export const metadata = { title: "Bulk Import" };

export default async function BulkImportPage() {
  const { t } = await getT();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("admin.bulkImport")}</h1>
      <p className="text-sm text-slate-500 mb-6 max-w-2xl">
        {t("admin.importIntro")}
      </p>
      <BulkImport />
    </div>
  );
}
