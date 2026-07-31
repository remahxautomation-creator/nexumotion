import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, PackageSearch, Boxes, PlusCircle, Upload, BarChart3 } from "lucide-react";
import { auth } from "@/lib/auth";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/account");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-52 shrink-0">
          <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-1">
            <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Admin</div>
            <Link href="/admin" className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 hover:text-[#0052CC]">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 hover:text-[#0052CC]">
              <PackageSearch className="w-4 h-4" /> Orders
            </Link>
            <Link href="/admin/products" className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 hover:text-[#0052CC]">
              <Boxes className="w-4 h-4" /> Products
            </Link>
            <Link href="/admin/products/new" className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 hover:text-[#0052CC]">
              <PlusCircle className="w-4 h-4" /> New Product
            </Link>
            <Link href="/admin/products/import" className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 hover:text-[#0052CC]">
              <Upload className="w-4 h-4" /> Bulk Import
            </Link>
            <Link href="/admin/analytics" className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 hover:text-[#0052CC]">
              <BarChart3 className="w-4 h-4" /> Analytics
            </Link>
          </div>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
