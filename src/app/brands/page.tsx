import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "All Brands" };

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

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
            <h2 className="text-sm font-bold text-[#0052CC] mb-3">{letter}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {list.map((b) => (
                <Link
                  key={b.id}
                  href={`/brands/${b.slug}`}
                  className="bg-white rounded-lg border border-slate-200 p-4 hover:border-[#0052CC] transition-colors"
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
