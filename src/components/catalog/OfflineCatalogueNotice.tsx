import { Info } from "lucide-react";
import { getT } from "@/i18n/server";

/**
 * Shown when a page is rendered from the offline catalogue mirror.
 *
 * The mirror is a point-in-time copy, so stock levels and prices on it can be
 * out of date. Saying so is not optional: this is a B2B parts catalogue, and a
 * buyer acting on a stale price or an "in stock" that is no longer true is a
 * commercial problem, not a cosmetic one.
 *
 * Deliberately low-key — an informational strip, not an error. Everything on
 * the page is still usable, and quoting is by inquiry anyway, so the honest
 * message is "confirm before you commit", not "something is broken".
 */
export default async function OfflineCatalogueNotice() {
  const { t } = await getT();

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <p className="text-sm leading-relaxed text-amber-900">
        {t("catalog.offline")}
      </p>
    </div>
  );
}
