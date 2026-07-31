import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatPrice, STOCK_LABELS } from "@/lib/utils";
import ProjectItemRow from "@/components/projects/ProjectItemRow";
import BomImport from "@/components/projects/BomImport";
import ProjectActions from "@/components/projects/ProjectActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Project" };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/projects");

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { include: { brand: true } } },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!project || project.userId !== session.user.id) notFound();

  const total = project.items.reduce((n, it) => n + Number(it.product.price) * it.qty, 0);

  const cartItems = project.items.map((it) => ({
    productId: it.product.id,
    sku: it.product.sku,
    name: it.product.name,
    slug: it.product.slug,
    brand: it.product.brand.name,
    price: Number(it.product.price),
    qty: it.qty,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
        <Link href="/projects" className="text-sm text-[#0052CC] font-medium">← All projects</Link>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {project.items.length} items · estimated total {formatPrice(total)}
      </p>

      <BomImport projectId={project.id} />

      <div className="mt-6 bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-start text-xs text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Line Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {project.items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                No items yet — import a BOM above or add parts by SKU.
              </td></tr>
            )}
            {project.items.map((it) => {
              const stock = STOCK_LABELS[it.product.stockStatus] ?? STOCK_LABELS.IN_STOCK;
              return (
                <ProjectItemRow
                  key={it.id}
                  projectId={project.id}
                  item={{
                    id: it.id, qty: it.qty,
                    sku: it.product.sku, name: it.product.name, slug: it.product.slug,
                    brand: it.product.brand.name, price: Number(it.product.price),
                    stockLabel: stock.label, stockClass: stock.className,
                  }}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {project.items.length > 0 && (
        <ProjectActions projectId={project.id} cartItems={cartItems} total={total} />
      )}
    </div>
  );
}
