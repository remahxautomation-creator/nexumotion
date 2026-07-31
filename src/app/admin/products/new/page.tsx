import { prisma } from "@/lib/prisma";
import NewProductForm from "@/components/admin/NewProductForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Product</h1>
      <NewProductForm
        brands={brands.map((b) => b.name)}
        categories={categories.map((c) => c.name)}
      />
    </div>
  );
}
