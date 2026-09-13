import Link from "next/link";
import { getT } from "@/i18n/server";
import snapshot from "@/content/catalog-snapshot.json";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("meta.brands") };
}

export default async function BrandsPage() {
  // Only brands we actually carry stock for. Seeded brands with no catalogue
  // lines would otherwise render an empty listing page.
  // A correlated `some` filter plus a product count for each of 276 brands.
  // The listing is identical for every visitor and changes only on catalogue
  // import, so it is cached rather than rebuilt per request.
  // Read from the published snapshot, never the database.
  //
  // This used to be cachedStat() with the snapshot as a fallback, which left
  // D1 as the primary. Combined with a per-isolate cache that meant every
  // isolate recomputed it hourly — and `activeBrandCount` is a correlated
  // subquery that reads ~120,000 rows per run. It was 91% of all D1 reads,
  // 48 million rows a day, a week after the catalogue itself had moved to the
  // mirror. Same principle as the mirror now applies here: published data is
  // primary, and `npm run mirror` after an import is what refreshes it.
  const brands = snapshot.brandsListing;

  const grouped = new Map<string, typeof brands>();
  for (const b of brands) {
    const letter = b.name[0].toUpperCase();
    if (!grouped.has(letter)) grouped.set(letter, []);
    grouped.get(letter)!.push(b);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Shop by Brand</h1>
      <p className="text-sm text-slate-500 mb-8">{brands.length} manufacturers — alphabetical directory</p>
      <div className="space-y-8">
        {[...grouped.entries()].map(([letter, list]) => (
          <div key={letter}>
            <h2 className="text-sm font-bold text-[#0A6286] mb-3">{letter}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {list.map((b) => (
                <Link
                  key={b.id}
                  href={`/brands/${b.slug}`}
                  className="bg-white rounded-lg border border-slate-200 p-4 hover:border-[#0A6286] transition-colors"
                >
                  <div className="font-semibold text-slate-900 text-sm">{b.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {b.country} · {b._count.products} products
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
