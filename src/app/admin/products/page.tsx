import { prisma } from "@/lib/prisma";
import ProductRowEditor from "@/components/admin/ProductRowEditor";
import AdminProductSearch from "@/components/admin/AdminProductSearch";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stock?: string }>;
}) {
  const { q, stock } = await searchParams;
  const query = (q ?? "").trim();

  const products = await prisma.product.findMany({
    where: {
      ...(query
        ? { OR: [{ sku: { contains: query } }, { name: { contains: query } }, { brand: { name: { contains: query } } }] }
        : {}),
      ...(stock === "low" ? { stockStatus: { in: ["LOW_STOCK", "OUT_OF_STOCK"] } } : {}),
    },
    include: { brand: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <AdminProductSearch />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3">SKU / Name</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Price (USD)</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No products match.</td></tr>
            )}
            {products.map((p) => (
              <ProductRowEditor
                key={p.id}
                product={{
                  id: p.id, sku: p.sku, name: p.name, slug: p.slug,
                  brand: p.brand.name, price: Number(p.price),
                  stockQty: p.stockQty, stockStatus: p.stockStatus, isActive: p.isActive,
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-3">Showing up to 50 results, most recently updated first. Use search to narrow.</p>
    </div>
  );
}
