import Link from "next/link";
import { redirect } from "next/navigation";
import { UserCircle, PackageSearch, FolderKanban, Bell, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/auth/SignOutButton";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("meta.account") };
}
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");
  const { t } = await getT();

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
          <UserCircle className="w-10 h-10 text-[#0A6286]" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.name || user.email}</h1>
            <div className="text-xs text-slate-500">
              {user.companyName ? `${user.companyName} · ` : ""}{user.role} · {user.country}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user.role === "ADMIN" && (
            <Link href="/admin" className="text-sm font-semibold text-white bg-[#0A6286] px-4 py-2 rounded-lg">
              {t("account.adminPanel")}
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/account/orders" className="bg-white rounded-lg border border-slate-200 p-5 hover:border-[#0A6286] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <PackageSearch className="w-5 h-5 text-[#0A6286]" />
            <h2 className="font-semibold text-slate-900 text-sm">{t("admin.orders")}</h2>
          </div>
          <div className="text-2xl font-bold text-slate-900">{user._count.orders}</div>
          <p className="text-xs text-slate-500 mt-1">{t("account.ordersSub")}</p>
        </Link>
        <Link href="/projects" className="bg-white rounded-lg border border-slate-200 p-5 hover:border-[#0A6286] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FolderKanban className="w-5 h-5 text-[#0A6286]" />
            <h2 className="font-semibold text-slate-900 text-sm">{t("projects.title")}</h2>
          </div>
          <div className="text-2xl font-bold text-slate-900">{user._count.projects}</div>
          <p className="text-xs text-slate-500 mt-1">{t("account.projectsSub")}</p>
        </Link>
        <Link href="/account/searches" className="bg-white rounded-lg border border-slate-200 p-5 hover:border-[#0A6286] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-[#0A6286]" />
            <h2 className="font-semibold text-slate-900 text-sm">{t("searches.title")}</h2>
          </div>
          <div className="text-2xl font-bold text-slate-900">{savedSearchCount}</div>
          <p className="text-xs text-slate-500 mt-1">{t("account.searchesSub")}</p>
        </Link>
      </div>

      <div className="mt-4">
        <Link href="/account/quotes" className="block bg-white rounded-lg border border-slate-200 p-5 hover:border-[#0A6286] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-[#0A6286]" />
            <h2 className="font-semibold text-slate-900 text-sm">{t("account.quotesTitle")}</h2>
          </div>
          <div className="text-2xl font-bold text-slate-900">{quoteCount}</div>
          <p className="text-xs text-slate-500 mt-1">{t("account.quotesSub")}</p>
        </Link>
      </div>

      <div className="mt-8 text-sm text-slate-500">
        {t("account.continueShopping")} <Link href="/search" className="text-[#0A6286] font-medium">{t("footer.searchParts")}</Link> ·{" "}
        <Link href="/quick-order" className="text-[#0A6286] font-medium">{t("footer.quickOrderPad")}</Link>
      </div>
    </div>
  );
}
