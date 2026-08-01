import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { customers, isPlaceholder } from "@/content/site-content";
import { getT } from "@/i18n/server";

// Typographic mark used when a customer has no logo file. Safe default: showing
// a company's actual logo needs their permission.
function Monogram({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
        {initials}
      </div>
      <span className="text-sm font-semibold text-slate-700 truncate">{name}</span>
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

      {isPlaceholder && (
        <div className="mb-6 flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2 max-w-2xl mx-auto">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Placeholder customers. Replace them in <code>src/content/site-content.ts</code> and set{" "}
            <code>isPlaceholder = false</code>. Listing a company you do not supply — or showing
            their logo without permission — is false advertising.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {customers.map((c, i) => (
          <div
            key={`${c.name}-${i}`}
            className="bg-white border border-slate-200 rounded-lg px-4 py-3.5 flex flex-col gap-1.5 hover:border-slate-300 transition-colors"
          >
            {c.logo ? (
              <Image
                src={c.logo}
                alt={c.name}
                width={120}
                height={36}
                className="h-9 w-auto object-contain grayscale opacity-80"
              />
            ) : (
              <Monogram name={c.name} />
            )}
            <span className="text-[11px] text-slate-400">{c.sector}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
