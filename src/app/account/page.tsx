import Link from "next/link";
import { redirect } from "next/navigation";
import { UserCircle, PackageSearch, FolderKanban, Bell, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/auth/SignOutButton";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { orders: true, projects: true, savedSearches: true, quoteRequests: true } } },
  });
  const savedSearchCount = user?._count.savedSearches ?? 0;
  const quoteCount = user?._count.quoteRequests ?? 0;
  if (!user) redirect("/login");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <UserCircle className="w-10 h-10 text-[#0052CC]" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.name || user.email}</h1>
            <div className="text-xs text-slate-500">
              {user.companyName ? `${user.companyName} · ` : ""}{user.role} · {user.country}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user.role === "ADMIN" && (
            <Link href="/admin" className="text-sm font-semibold text-white bg-[#0052CC] px-4 py-2 rounded-lg">
              Admin Panel
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/account/orders" className="bg-white rounded-lg border border-slate-200 p-5 hover:border-[#0052CC] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <PackageSearch className="w-5 h-5 text-[#0052CC]" />
            <h2 className="font-semibold text-slate-900 text-sm">Orders</h2>
          </div>
          <div className="text-2xl font-bold text-slate-900">{user._count.orders}</div>
          <p className="text-xs text-slate-500 mt-1">View order history and status.</p>
        </Link>
        <Link href="/projects" className="bg-white rounded-lg border border-slate-200 p-5 hover:border-[#0052CC] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FolderKanban className="w-5 h-5 text-[#0052CC]" />
            <h2 className="font-semibold text-slate-900 text-sm">Projects / BOMs</h2>
          </div>
          <div className="text-2xl font-bold text-slate-900">{user._count.projects}</div>
          <p className="text-xs text-slate-500 mt-1">Save BOMs, import CSVs, convert to orders.</p>
        </Link>
        <Link href="/account/searches" className="bg-white rounded-lg border border-slate-200 p-5 hover:border-[#0052CC] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-[#0052CC]" />
            <h2 className="font-semibold text-slate-900 text-sm">Saved Searches</h2>
          </div>
          <div className="text-2xl font-bold text-slate-900">{savedSearchCount}</div>
          <p className="text-xs text-slate-500 mt-1">Rerun saved filter combinations.</p>
        </Link>
      </div>

      <div className="mt-4">
        <Link href="/account/quotes" className="block bg-white rounded-lg border border-slate-200 p-5 hover:border-[#0052CC] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-[#0052CC]" />
            <h2 className="font-semibold text-slate-900 text-sm">Quote Requests</h2>
          </div>
          <div className="text-2xl font-bold text-slate-900">{quoteCount}</div>
          <p className="text-xs text-slate-500 mt-1">Volume pricing for large orders — request from your cart.</p>
        </Link>
      </div>

      <div className="mt-8 text-sm text-slate-500">
        Continue shopping: <Link href="/search" className="text-[#0052CC] font-medium">Search parts</Link> ·{" "}
        <Link href="/quick-order" className="text-[#0052CC] font-medium">Quick order pad</Link>
      </div>
    </div>
  );
}
