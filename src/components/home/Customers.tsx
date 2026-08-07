import Image from "next/image";
import { customers, customersArePlaceholder } from "@/content/site-content";
import { getT } from "@/i18n/server";

/**
 * Client wall.
 *
 * Renders a typographic mark unless an entry carries a `logo` path. That is
 * the deliberate default: reproducing a customer's actual logo needs their
 * permission, and the name alone carries the same weight without the exposure.
 * Drop files into public/customers/ and set `logo` per entry to switch any
 * individual one over.
 */
function Monogram({ name }: { name: string }) {
  // Two initials from the first two words, or the first two letters of a
  // single-word name — "Fresh" as "F" alone reads like a missing image.
  const words = name.split(/[\s&-]+/).filter(Boolean);
  const initials =
    words.length > 1
      ? words.slice(0, 2).map((w) => w[0]).join("")
      : name.slice(0, 2);

  return (
    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0A6286] to-[#07858F] text-white flex items-center justify-center text-[11px] font-bold shrink-0 tracking-tight">
      {initials.toUpperCase()}
    </div>
  );
}

export default async function Customers() {
  const { t } = await getT();

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-slate-900">{t("home.customers.title")}</h2>
        <p className="text-sm text-slate-500 mt-1">{t("home.customers.subtitle")}</p>
      </div>

      {customersArePlaceholder && (
        <div className="mb-6 flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2 max-w-2xl mx-auto">
          <span>
            Placeholder customers. Replace them in <code>src/content/site-content.ts</code> and set{" "}
            <code>customersArePlaceholder = false</code>. Listing a company you do not supply — or
            showing their logo without permission — is false advertising.
          </span>
        </div>
      )}

      {/* Dense on purpose. At five columns the 53 entries ran over a full
          viewport and pushed the rest of the page down; six columns with
          tighter cards keeps the wall readable without dominating the home
          page. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {customers.map((c, i) => (
          <div
            key={`${c.name}-${i}`}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 flex items-center gap-2 hover:border-[#07858F] transition-colors"
          >
            {c.logo ? (
              <Image
                src={c.logo}
                alt={c.name}
                width={120}
                height={40}
                className="h-10 w-auto object-contain shrink-0"
                unoptimized
              />
            ) : (
              <Monogram name={c.name} />
            )}
            <div className="min-w-0">
              {/* dir="ltr" so Latin company names are not reordered on the
                  Arabic pages, where the surrounding text runs right-to-left. */}
              <div className="text-[12px] font-semibold text-slate-800 truncate leading-tight" dir="ltr">
                {c.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate leading-tight">{c.sector}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        {t("home.customers.note").replace("{count}", String(customers.length))}
      </p>
    </section>
  );
}
